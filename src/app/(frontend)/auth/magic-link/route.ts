import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function toBase64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signPayloadToken({
  payload,
  secret,
  tokenExpiration,
}: {
  payload: Record<string, unknown>
  secret: string
  tokenExpiration: number
}): string {
  const now = Math.floor(Date.now() / 1000)
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + tokenExpiration,
    }),
  )
  const signature = toBase64Url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  )

  return `${header}.${body}.${signature}`
}

function getRedirectPath(role: string | null | undefined): string {
  switch (role) {
    case 'coach':
      return '/dashboard/coach'
    case 'psy':
      return '/dashboard/psy'
    case 'etudiant':
    default:
      return '/dashboard/student'
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const rawToken = searchParams.get('token')?.trim()

  if (!rawToken) {
    return NextResponse.redirect(new URL('/login?error=invalid-link', origin))
  }

  const payload = await getPayload({ config })
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  const now = new Date().toISOString()

  // 1. Trouver l'utilisateur avec le token
  const matchingUsers = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    where: {
      and: [
        { magicLoginToken: { equals: hashedToken } },
        { magicLoginExpiresAt: { greater_than_equal: now } },
      ],
    },
  })

  const user = matchingUsers.docs[0]

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid-or-expired-link', origin))
  }

  // 2. Nettoyer le token (Usage unique)
  // On utilise overrideAccess pour être sûr que Payload autorise la modif
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      magicLoginToken: null,
      magicLoginExpiresAt: null,
    },
    overrideAccess: true,
  })

  // 3. Configuration de l'authentification
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    console.error("❌ ERREUR: PAYLOAD_SECRET manquant dans le .env")
    return NextResponse.redirect(new URL('/login?error=server-error', origin))
  }

  const cookiePrefix = payload.config.cookiePrefix || 'payload'
  const cookieName = `${cookiePrefix}-token`
  
  const usersCollection = payload.collections['users']
  const authConfig: any = typeof usersCollection.config.auth === 'object' ? usersCollection.config.auth : {}
  const tokenExpiration = authConfig.tokenExpiration ?? 7200

  // 4. Générer le JWT compatible Payload
  const token = signPayloadToken({
    secret,
    tokenExpiration,
    payload: {
      id: user.id,
      collection: 'users',
      email: user.email,
    },
  })

  // 5. Préparer la réponse et poser le cookie
  const targetPath = getRedirectPath(user.role as string)
  const response = NextResponse.redirect(new URL(targetPath, origin))

  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax', // Très important pour les redirections externes
    secure: process.env.NODE_ENV === 'production',
    maxAge: tokenExpiration,
  })

  console.log(`✅ Magic Link validé pour : ${user.email}`)
  
  return response
}
