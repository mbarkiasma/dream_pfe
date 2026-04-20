import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json(
      { error: 'Seul un etudiant peut consulter les coachs disponibles.' },
      { status: 403 },
    )
  }

  const coaches = await payload.find({
    collection: 'users',
    user,
    overrideAccess: false,
    where: {
      role: {
        equals: 'coach',
      },
    },
    depth: 0,
    sort: 'firstName',
    limit: 50,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      coachingSpecialty: true,
      coachingBio: true,
      isAvailableForCoaching: true,
    },
  })

  const availableCoaches = coaches.docs.filter((coach) => coach.isAvailableForCoaching === true)

  return Response.json({
    coaches: availableCoaches.map((coach) => ({
      id: coach.id,
      name: `${coach.firstName ?? ''} ${coach.lastName ?? ''}`.trim() || coach.email || 'Coach',
      email: coach.email,
      specialty: coach.coachingSpecialty || 'Accompagnement general',
      bio: coach.coachingBio || '',
    })),
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
