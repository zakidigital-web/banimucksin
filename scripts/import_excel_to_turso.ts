#!/usr/bin/env bun
/**
 * Import "daftar anggota.xlsx" into Turso, REPLACING all existing FamilyMember data.
 * 
 * Data handling:
 * - Gen 1: Mucksin & Supiyah — root patriarch/matriarch
 * - Gen 2: Children of Mucksin & Supiyah (Nama Orangtua is empty, inferred from family context)
 * - Gen 3+: Nama Orangtua format: "Name1 - Name2" (one is the parent who is child of Gen 1)
 * - Nama Pasangan has prefixes: "Bpk.", "Bu", "Hj.", "H.", "(alm)", etc.
 * 
 * Strategy:
 * 1. Delete all existing FamilyMember records
 * 2. Insert all members without relationships
 * 3. Link spouses by fuzzy-matching names
 * 4. Link parents: Gen 2 → Mucksin, Gen 3+ → first matching name from "Nama Orangtua"
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

// Normalize for matching: lowercase, remove titles/honorifics
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
}

const memberRows: MemberRow[] = [];
const nameToId = new Map<string, string>();
const normalizedToId = new Map<string, string>();

for (const row of rows) {
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

    memberRows.push({ id, name, gender, generation, parentRaw, spouseRaw, notes });
    nameToId.set(name, id);
    normalizedToId.set(normalizeName(name), id);

    console.log(`  ✓ ${name} (Gen ${generation}, ${gender})`);
}

console.log(`\n✅ Inserted ${memberRows.length} members\n`);

// ─── Step 3: Link spouses ──────────────────────────────
console.log('💑 Linking spouses...');

// Find the best match for a spouse name
function findMemberId(rawName: string): string | null {
    if (!rawName) return null;

    // Direct match
    if (nameToId.has(rawName)) return nameToId.get(rawName)!;

    // Clean and try
    const cleaned = cleanName(rawName);
    if (nameToId.has(cleaned)) return nameToId.get(cleaned)!;

    // Normalized match
    const norm = normalizeName(rawName);
    if (normalizedToId.has(norm)) return normalizedToId.get(norm)!;

    // Fuzzy: try if any name contains or is contained in the target
    for (const [memberName, memberId] of nameToId) {
        const memberNorm = normalizeName(memberName);
        if (memberNorm.includes(norm) || norm.includes(memberNorm)) {
            return memberId;
        }
    }

    return null;
}

// Track already-linked spouses to avoid duplicates
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

// Find Mucksin's ID for Gen 2 parent assignment
const mucksinId = nameToId.get('Mucksin');

for (const member of memberRows) {
    let parentId: string | null = null;

    if (member.generation === 2 && !member.parentRaw) {
        // Gen 2 with no explicit parent → child of Mucksin
        // But only for members who are Mucksin's actual children (not in-law spouses)
        // Check if this member is in the "Bani Mucksin" family by checking their notes or context
        // For this data: Gen 2 members whose family name connects to Mucksin
        // Since all Gen 2 are listed together with their spouses, we need to identify 
        // the actual children vs married-in spouses.
        // Strategy: Gen 2 members who appear as the FIRST name in "Nama Orangtua" of Gen 3 children
        // are the actual children of Mucksin.
        // But this creates a chicken-and-egg: let's first assign all Gen 2 to Mucksin,
        // then the tree filter will handle spouse display.
        // Actually, only one side of each couple should be Mucksin's child.
        // Let's check if any Gen 3 member's "Nama Orangtua" references this person.
        const isReferencedAsParent = memberRows.some(m => {
            if (m.generation <= member.generation) return false;
            const parts = m.parentRaw.split(' - ').map(p => p.trim());
            return parts.some(p => normalizeName(p) === normalizeName(member.name));
        });

        if (isReferencedAsParent && mucksinId) {
            parentId = mucksinId;
        }
    } else if (member.parentRaw) {
        // Parse "Name1 - Name2" format
        const parts = member.parentRaw.split(' - ').map(p => p.trim());
        // Try to find either name in our members
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
const result = await turso.execute('SELECT COUNT(*) as cnt FROM FamilyMember');
const spouseResult = await turso.execute('SELECT COUNT(*) as cnt FROM FamilyMember WHERE spouseId IS NOT NULL');
const parentResult = await turso.execute('SELECT COUNT(*) as cnt FROM FamilyMember WHERE parentId IS NOT NULL');

console.log('📊 Final Summary:');
console.log(`   Total members:  ${result.rows[0].cnt}`);
console.log(`   With spouse:    ${spouseResult.rows[0].cnt}`);
console.log(`   With parent:    ${parentResult.rows[0].cnt}`);
console.log('\n✅ Import complete!');
