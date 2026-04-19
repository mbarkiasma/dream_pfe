import { Pool, type QueryResultRow } from 'pg'

const rawConnectionString = process.env.SQL_DATABASE_URL || process.env.DATABASE_URL

if (!rawConnectionString) {
  throw new Error('Missing SQL_DATABASE_URL or DATABASE_URL environment variable.')
}

const sanitizedConnectionString = (() => {
  try {
    const url = new URL(rawConnectionString)
    url.searchParams.delete('sslmode')
    url.searchParams.delete('ssl')
    url.searchParams.delete('sslcert')
    url.searchParams.delete('sslkey')
    url.searchParams.delete('sslrootcert')
    return url.toString()
  } catch {
    return rawConnectionString
  }
})()

const isSupabaseConnection = /supabase\.com/i.test(rawConnectionString)
const requiresSSL =
  isSupabaseConnection ||
  /sslmode=require/i.test(rawConnectionString) ||
  /[?&]ssl=true/i.test(rawConnectionString)

const globalForSQL = globalThis as typeof globalThis & {
  sqlPool?: Pool
}

export const sqlPool =
  globalForSQL.sqlPool ||
  new Pool({
    connectionString: sanitizedConnectionString,
    ssl: requiresSSL ? { rejectUnauthorized: false } : undefined,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForSQL.sqlPool = sqlPool
}

export async function querySQL<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return sqlPool.query<T>(text, params)
}

export async function getSQLHealth() {
  const [{ rows: nowRows }, { rows: usersRows }, { rows: dreamsRows }] = await Promise.all([
    querySQL<{ now: string }>('select now()::text as now'),
    querySQL<{ total: string }>('select count(*)::text as total from metier.utilisateur'),
    querySQL<{ total: string }>('select count(*)::text as total from metier.reve'),

  ])

  return {
    connectedAt: nowRows[0]?.now ?? null,
    utilisateurCount: Number(usersRows[0]?.total ?? 0),
    reveCount: Number(dreamsRows[0]?.total ?? 0),
  }
}
