import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>
}) {
  const params = await searchParams
  const rawEmail = params.email
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail

  if (!email) {
    redirect('/login')
  }

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email.toLowerCase().trim(),
      },
    },
    limit: 1,
    overrideAccess: true,
  })

  const user = result.docs[0]

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'coach') {
    redirect('/dashboard/coach')
  }

  if (user.role === 'psy') {
    redirect('/dashboard/psy')
  }

  if (user.role === 'etudiant') {
    redirect('/dashboard/student')
  }
}