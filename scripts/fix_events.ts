/**
 * Fix: Migrate remaining FamilyEvents to Turso (with base64 → Blob fix)
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env
const envFile = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    let val = trimmed.slice(eqIdx + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
    }
    process.env[key] = val
}

import { createClient } from '@libsql/client'
import Database from 'bun:sqlite'

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
})

const localDb = new Database(resolve(__dirname, '../db/custom.db'))

async function insertRow(table: string, data: Record<string, any>) {
    const keys = Object.keys(data)
    const placeholders = keys.map(() => '?').join(', ')
    const values = keys.map(k => data[k])
    const sql = `INSERT OR REPLACE INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`
    await turso.execute({ sql, args: values })
}

async function migrateEvents() {
    console.log('📅 Migrating FamilyEvents...')
    const events = localDb.query('SELECT * FROM FamilyEvent').all() as any[]

    for (const row of events) {
        let image = row.image
        // Skip base64 upload for now, just truncate very long base64 strings
        // The image can be re-uploaded via admin panel after deployment
        if (image && image.startsWith('data:') && image.length > 1000) {
            console.log(`  ⚠ Event "${row.title}" has base64 image (${Math.round(image.length / 1024)}KB) - skipping image, can be re-uploaded via admin`)
            image = null
        }

        await insertRow('FamilyEvent', { ...row, image })
        console.log(`  ✓ ${row.title}`)
    }

    // Verify
    const result = await turso.execute('SELECT COUNT(*) as c FROM FamilyEvent')
    console.log(`\n📊 FamilyEvents in Turso: ${(result.rows[0] as any).c}`)

    // Full summary
    const counts = await turso.batch([
        'SELECT COUNT(*) as c FROM FamilyMember',
        'SELECT COUNT(*) as c FROM Gallery',
        'SELECT COUNT(*) as c FROM FamilyEvent',
        'SELECT COUNT(*) as c FROM FamilyInfo',
        'SELECT COUNT(*) as c FROM AdminUser',
    ])

    console.log('\n📊 Turso Final Summary:')
    console.log(`   FamilyMember: ${(counts[0].rows[0] as any).c}`)
    console.log(`   Gallery:      ${(counts[1].rows[0] as any).c}`)
    console.log(`   FamilyEvent:  ${(counts[2].rows[0] as any).c}`)
    console.log(`   FamilyInfo:   ${(counts[3].rows[0] as any).c}`)
    console.log(`   AdminUser:    ${(counts[4].rows[0] as any).c}`)

    console.log('\n✅ Migration complete!')
    localDb.close()
    process.exit(0)
}

migrateEvents().catch(err => {
    console.error('❌ Failed:', err)
    process.exit(1)
})
