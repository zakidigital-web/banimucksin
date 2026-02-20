#!/usr/bin/env bun
/**
 * Import "daftar anggota.xlsx" into Turso, REPLACING all existing FamilyMember data.
 * 
 * Data structure:
 * - Gen 1: Mucksin & Supiyah — root patriarch/matriarch  
 * - Gen 2: Listed in pairs (child, then their spouse). Odd rows = Mucksin's child, even rows = in-law
 * - Gen 3+: "Nama Orangtua" = "Name1 - Name2" format
 * - Spouse names may have prefixes: "Bpk.", "Bu", "Hj.", "H.", "(alm)", etc.
 * 
 * Strategy:
 * 1. Delete all existing FamilyMember records
 * 2. Insert all members without relationships
 * 3. Link spouses by fuzzy-matching names  
 * 4. Link parents:
 *    - Gen 2: Only the FIRST member in each couple pair → parentId = Mucksin
 *    - Gen 3+: Match first found name from "Nama Orangtua" split by " - "
 */

import { createClient } from '@libsql/client';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Load env
const envFile = Bun.file(path.join(import.meta.dir, '..', '.env'));
const envText = await envFile.text();
for (const line of envText.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
}

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ─── Read Excel ────────────────────────────────────────
const xlsPath = path.join(import.meta.dir, '..', 'daftar anggota.xlsx');
const wb = XLSX.readFile(xlsPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as Record<string, any>[];

console.log(`📥 Read ${rows.length} rows from "daftar anggota.xlsx"\n`);

// ─── Clean name helper ─────────────────────────────────
function cleanName(raw: string): string {
    return raw
        .replace(/\(alm\.?\)/gi, '')
        .replace(/^(Bpk\.|Bu |Hj\.|H\.) */gi, '')
        .trim();
}

function normalizeName(raw: string): string {
    return cleanName(raw).toLowerCase().replace(/\s+/g, ' ');
}

// ─── Step 1: Delete all existing members ───────────────
console.log('🗑️  Clearing existing FamilyMember data...');
await turso.execute('DELETE FROM FamilyMember');
console.log('   ✓ Cleared\n');

// ─── Step 2: Insert all members ────────────────────────
console.log('👨‍👩‍👧‍👦 Inserting members...');

interface MemberRow {
    id: string;
    name: string;
    gender: string;
    generation: number;
    parentRaw: string;
    spouseRaw: string;
    notes: string;
    rowIndex: number; // original row index in excel (0-based among data rows)
}

const memberRows: MemberRow[] = [];
const nameToId = new Map<string, string>();
const normalizedToId = new Map<string, string>();

for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row['Nama Lengkap'] || '').trim();
    if (!name) continue;

    const id = randomUUID().replace(/-/g, '').slice(0, 25);
    const gender = String(row['Jenis Kelamin'] || '').toLowerCase().startsWith('l') ? 'L' : 'P';
    const generation = Number(row['Generasi']) || 1;
    const parentRaw = String(row['Nama Orangtua'] || '').trim();
    const spouseRaw = String(row['Nama Pasangan'] || '').trim();
    const notes = String(row['Catatan'] || '').trim();

    await turso.execute({
        sql: `INSERT INTO FamilyMember (id, name, gender, generation, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [id, name, gender, generation, notes || null],
    });

    memberRows.push({ id, name, gender, generation, parentRaw, spouseRaw, notes, rowIndex: i });
    nameToId.set(name, id);
    normalizedToId.set(normalizeName(name), id);

    console.log(`  ✓ ${name} (Gen ${generation}, ${gender})`);
}

console.log(`\n✅ Inserted ${memberRows.length} members\n`);

// ─── Step 3: Link spouses ──────────────────────────────
console.log('💑 Linking spouses...');

function findMemberId(rawName: string): string | null {
    if (!rawName) return null;
    if (nameToId.has(rawName)) return nameToId.get(rawName)!;
    const cleaned = cleanName(rawName);
    if (nameToId.has(cleaned)) return nameToId.get(cleaned)!;
    const norm = normalizeName(rawName);
    if (normalizedToId.has(norm)) return normalizedToId.get(norm)!;
    // Fuzzy: substring match
    for (const [memberName, memberId] of nameToId) {
        const memberNorm = normalizeName(memberName);
        if (memberNorm.includes(norm) || norm.includes(memberNorm)) {
            return memberId;
        }
    }
    return null;
}

const linkedSpouses = new Set<string>();

for (const member of memberRows) {
    if (!member.spouseRaw || linkedSpouses.has(member.id)) continue;

    const spouseId = findMemberId(member.spouseRaw);
    if (spouseId && spouseId !== member.id) {
        await turso.execute({
            sql: 'UPDATE FamilyMember SET spouseId = ? WHERE id = ?',
            args: [spouseId, member.id],
        });
        linkedSpouses.add(member.id);
        linkedSpouses.add(spouseId);
        console.log(`  💑 ${member.name} ↔ ${member.spouseRaw}`);
    } else if (member.spouseRaw) {
        console.log(`  ⚠ Could not find spouse "${member.spouseRaw}" for ${member.name}`);
    }
}

console.log('');

// ─── Step 4: Link parents ──────────────────────────────
console.log('👨‍👧 Linking parents...');

const mucksinId = nameToId.get('Mucksin');

// For Gen 2: identify which members are actual Mucksin children vs in-law spouses
// Strategy: Gen 2 members are listed in pairs in the Excel.
// The FIRST in each pair is the Mucksin child, the SECOND is the in-law spouse.
// We detect pairs by checking: if memberA has spouseRaw pointing to memberB, they're a pair.
// The one with the LOWER rowIndex in each pair is the actual child.

const gen2Members = memberRows.filter(m => m.generation === 2);
const gen2PairProcessed = new Set<string>();

// Build a set of actual Mucksin children (first in each Gen 2 couple pair)
const mucksinChildIds = new Set<string>();

for (const member of gen2Members) {
    if (gen2PairProcessed.has(member.id)) continue;

    // Find this member's spouse
    const spouseId = member.spouseRaw ? findMemberId(member.spouseRaw) : null;
    const spouseMember = spouseId ? memberRows.find(m => m.id === spouseId) : null;

    if (spouseMember && spouseMember.generation === 2) {
        // This is a Gen 2 couple — the one with lower rowIndex is the Mucksin child
        gen2PairProcessed.add(member.id);
        gen2PairProcessed.add(spouseMember.id);

        if (member.rowIndex < spouseMember.rowIndex) {
            mucksinChildIds.add(member.id);
        } else {
            mucksinChildIds.add(spouseMember.id);
        }
    } else {
        // Single Gen 2 member without a spouse pair — treat as Mucksin child
        mucksinChildIds.add(member.id);
        gen2PairProcessed.add(member.id);
    }
}

console.log(`  📋 Mucksin children identified: ${[...mucksinChildIds].map(id => memberRows.find(m => m.id === id)?.name).join(', ')}\n`);

for (const member of memberRows) {
    let parentId: string | null = null;

    if (member.generation === 2 && !member.parentRaw) {
        // Gen 2: only assign parentId = Mucksin if this member is an actual child
        if (mucksinChildIds.has(member.id) && mucksinId) {
            parentId = mucksinId;
        }
        // In-law spouses get NO parentId — they appear as "pure spouse" in the tree
    } else if (member.parentRaw) {
        // Gen 3+: Parse "Name1 - Name2" format and find the first matching member
        const parts = member.parentRaw.split(' - ').map(p => p.trim());
        for (const part of parts) {
            const found = findMemberId(part);
            if (found) {
                parentId = found;
                break;
            }
        }
    }

    if (parentId) {
        await turso.execute({
            sql: 'UPDATE FamilyMember SET parentId = ? WHERE id = ?',
            args: [parentId, member.id],
        });
        console.log(`  👨‍👧 ${member.name} → parent: ${memberRows.find(m => m.id === parentId)?.name || parentId}`);
    }
}

console.log('');

// ─── Summary ───────────────────────────────────────────
const totalResult = await turso.execute('SELECT COUNT(*) as cnt FROM FamilyMember');
const spouseResult = await turso.execute('SELECT COUNT(*) as cnt FROM FamilyMember WHERE spouseId IS NOT NULL');
const parentResult = await turso.execute('SELECT COUNT(*) as cnt FROM FamilyMember WHERE parentId IS NOT NULL');
const orphanResult = await turso.execute("SELECT COUNT(*) as cnt FROM FamilyMember WHERE parentId IS NULL AND generation > 1 AND id NOT IN (SELECT COALESCE(spouseId,'') FROM FamilyMember WHERE spouseId IS NOT NULL)");

console.log('📊 Final Summary:');
console.log(`   Total members:       ${totalResult.rows[0].cnt}`);
console.log(`   With spouse linked:  ${spouseResult.rows[0].cnt}`);
console.log(`   With parent linked:  ${parentResult.rows[0].cnt}`);
console.log(`   Orphan (no parent, not a spouse): ${orphanResult.rows[0].cnt}`);
console.log('\n✅ Import complete!');
