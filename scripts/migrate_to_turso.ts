/**
 * Migration Script: Push local SQLite data to Turso + base64 images to Vercel Blob
 * Uses raw LibSQL for Turso (bypasses Prisma adapter issues)
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually
const envFile = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    let val = trimmed.slice(eqIdx + 1)
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
    }
    process.env[key] = val
}

import { createClient as createLibsqlClient } from '@libsql/client'
import { put } from '@vercel/blob'
import Database from 'bun:sqlite'

const TURSO_URL = process.env.TURSO_DATABASE_URL!
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!TURSO_URL || !TURSO_TOKEN) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env')
    process.exit(1)
}

// Local SQLite via Bun native
const localDb = new Database(resolve(__dirname, '../db/custom.db'))

// Turso via LibSQL
const turso = createLibsqlClient({ url: TURSO_URL, authToken: TURSO_TOKEN })

// Upload base64 to Vercel Blob
async function uploadBase64(base64: string, filename: string): Promise<string> {
    if (!BLOB_TOKEN) {
        console.warn('  ⚠ No BLOB_READ_WRITE_TOKEN, keeping base64')
        return base64
    }
    const match = base64.match(/^data:(.+);base64,(.+)$/)
    if (!match) return base64
    const buffer = Buffer.from(match[2], 'base64')
    const blob = await put(filename, buffer, { access: 'public', contentType: match[1] })
    console.log(`  📤 Uploaded: ${blob.url}`)
    return blob.url
}

// Helper: insert row into Turso
async function insertRow(table: string, data: Record<string, any>) {
    const keys = Object.keys(data)
    const placeholders = keys.map(() => '?').join(', ')
    const values = keys.map(k => data[k])
    const sql = `INSERT OR REPLACE INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`
    await turso.execute({ sql, args: values })
}

async function migrate() {
    console.log('🚀 Starting migration: Local SQLite → Turso + Vercel Blob\n')

    // 1. FamilyInfo
    console.log('📋 FamilyInfo...')
    const infos = localDb.query('SELECT * FROM FamilyInfo').all() as any[]
    for (const row of infos) {
        await insertRow('FamilyInfo', row)
        console.log(`  ✓ ${row.familyName}`)
    }

    // 2. AdminUser
    console.log('\n👤 AdminUser...')
    const admins = localDb.query('SELECT * FROM AdminUser').all() as any[]
    for (const row of admins) {
        await insertRow('AdminUser', row)
        console.log(`  ✓ ${row.username}`)
    }

    // 3. FamilyMember (two passes: first without spouseId, then update spouseId)
    console.log('\n👨‍👩‍👧‍👦 FamilyMember...')
    const members = localDb.query('SELECT * FROM FamilyMember ORDER BY generation ASC').all() as any[]

    // Pass 1: insert all without spouse
    for (const row of members) {
        let photo = row.photo
        if (photo && photo.startsWith('data:')) {
            photo = await uploadBase64(photo, `member-${row.id}.png`)
        }
        const data = { ...row, photo, spouseId: null }
        await insertRow('FamilyMember', data)
        console.log(`  ✓ ${row.name} (Gen ${row.generation})`)
    }

    // Pass 2: update spouse
    for (const row of members) {
        if (row.spouseId) {
            await turso.execute({
                sql: `UPDATE "FamilyMember" SET "spouseId" = ? WHERE "id" = ?`,
                args: [row.spouseId, row.id],
            })
            console.log(`  💑 ${row.name} → spouse linked`)
        }
    }

    // 4. Gallery
    console.log('\n🖼️  Gallery...')
    const galleries = localDb.query('SELECT * FROM Gallery').all() as any[]
    for (const row of galleries) {
        let imageUrl = row.imageUrl
        if (imageUrl && imageUrl.startsWith('data:')) {
            imageUrl = await uploadBase64(imageUrl, `gallery-${row.id}.png`)
        }
        await insertRow('Gallery', { ...row, imageUrl })
        console.log(`  ✓ ${row.title}`)
    }

    // 5. FamilyEvent
    console.log('\n📅 FamilyEvent...')
    const events = localDb.query('SELECT * FROM FamilyEvent').all() as any[]
    for (const row of events) {
        let image = row.image
        if (image && image.startsWith('data:')) {
            image = await uploadBase64(image, `event-${row.id}.png`)
        }
        await insertRow('FamilyEvent', { ...row, image })
        console.log(`  ✓ ${row.title}`)
    }

    // Verify
    const counts = await turso.batch([
        'SELECT COUNT(*) as c FROM FamilyMember',
        'SELECT COUNT(*) as c FROM Gallery',
        'SELECT COUNT(*) as c FROM FamilyEvent',
        'SELECT COUNT(*) as c FROM FamilyInfo',
        'SELECT COUNT(*) as c FROM AdminUser',
    ])

    console.log('\n📊 Turso Data Summary:')
    console.log(`   FamilyMember: ${(counts[0].rows[0] as any).c}`)
    console.log(`   Gallery:      ${(counts[1].rows[0] as any).c}`)
    console.log(`   FamilyEvent:  ${(counts[2].rows[0] as any).c}`)
    console.log(`   FamilyInfo:   ${(counts[3].rows[0] as any).c}`)
    console.log(`   AdminUser:    ${(counts[4].rows[0] as any).c}`)

    console.log('\n✅ Migration complete!')
    localDb.close()
    process.exit(0)
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err)
    process.exit(1)
})
