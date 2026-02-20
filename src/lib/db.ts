import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Production: use Turso via LibSQL adapter
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    // Prisma requires DATABASE_URL even when using adapter — set a dummy if missing
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'file:./placeholder.db'
    }

    const { createClient } = require('@libsql/client')
    const { PrismaLibSql } = require('@prisma/adapter-libsql')

    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Development: use local SQLite
  return new PrismaClient({
    log: ['query'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db