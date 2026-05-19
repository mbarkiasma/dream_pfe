import config from '@payload-config'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

async function clearAuthCookies() {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const cookieNames = [
    `${cookiePrefix}-token`,
    'payload-token',
    '__session',
    '__client_uat',
    '__clerk_db_jwt',
    '__clerk_handshake',
    'clerk-db-jwt',
  ]

  for (const name of cookieNames) {
    cookieStore.delete(name)
  }
}

export async function GET(request: Request) {
  await clearAuthCookies()

  return NextResponse.redirect(new URL('/login', request.url))
}

export async function POST() {
  await clearAuthCookies()

  return Response.json({ ok: true })
}
