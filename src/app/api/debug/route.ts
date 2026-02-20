import { NextResponse } from 'next/server';

export async function GET() {
    const diagnostics: Record<string, any> = {
        timestamp: new Date().toISOString(),
        env: {
            TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? `${process.env.TURSO_DATABASE_URL.substring(0, 30)}...` : 'MISSING',
            TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? `${process.env.TURSO_AUTH_TOKEN.substring(0, 10)}...` : 'MISSING',
            DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'MISSING',
            BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? 'SET' : 'MISSING',
            NODE_ENV: process.env.NODE_ENV,
        },
    };

    // Test Turso connection
    try {
        const { createClient } = await import('@libsql/client');
        if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
            const client = createClient({
                url: process.env.TURSO_DATABASE_URL,
                authToken: process.env.TURSO_AUTH_TOKEN,
            });
            const result = await client.execute('SELECT COUNT(*) as count FROM FamilyMember');
            diagnostics.turso = {
                status: 'connected',
                memberCount: result.rows[0]?.count,
            };
        } else {
            diagnostics.turso = { status: 'skipped - missing env vars' };
        }
    } catch (err: any) {
        diagnostics.turso = { status: 'error', message: err.message, code: err.code };
    }

    // Test Prisma
    try {
        const { db } = await import('@/lib/db');
        const count = await db.familyMember.count();
        diagnostics.prisma = { status: 'connected', memberCount: count };
    } catch (err: any) {
        diagnostics.prisma = { status: 'error', message: err.message };
    }

    return NextResponse.json(diagnostics);
}
