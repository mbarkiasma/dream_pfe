import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const params = await searchParams
  const rawToken = params.token
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken

  if (!token) {
    redirect('/login')
  }

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'users',
    where: {
      and: [
        {
          magicLoginToken: {
            equals: token,
          },
        },
        {
          magicLoginExpiresAt: {
            greater_than: new Date().toISOString(),
          },
        },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  const user = result.docs[0]

  if (!user) {
    redirect('/login')
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      magicLoginToken: null,
      magicLoginExpiresAt: null,
    },
    overrideAccess: true,
  })

  if (user.role === 'coach') {
    redirect('/dashboard/coach')
  }

  if (user.role === 'psy') {
    redirect('/dashboard/psy')
  }

  redirect('/dashboard/etudiant')
}