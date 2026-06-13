import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

export async function PATCH(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'coach') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))

  const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  await payload.update({
    collection: 'users',
    id: user.id,
    user,
    overrideAccess: false,
    data: {
      firstName: clean(body.firstName) || undefined,
      lastName: clean(body.lastName) || undefined,
      phone: clean(body.phone) || null,
      location: clean(body.location) || null,
coachingSpecialty: clean(body.coachingSpecialty) || null,
      coachingBio: clean(body.coachingBio) || null,
    },
  })

  return Response.json({ success: true })
}
