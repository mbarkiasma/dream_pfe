import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type CoachForAvatar = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

function normalizeCoachKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function getKnownCoachAvatar(coach: CoachForAvatar) {
  const identity = normalizeCoachKey(
    `${coach.firstName ?? ''} ${coach.lastName ?? ''} ${coach.email ?? ''}`,
  )

  if (identity.includes('mehdi')) return '/specialistes/mehdi.png'
  if (identity.includes('nour')) return '/specialistes/nour.png'
  if (identity.includes('riim') || identity.includes('rim')) return '/specialistes/rim.png'
  if (identity.includes('sana')) return '/specialistes/sana.png'
  if (identity.includes('yassine')) return '/specialistes/yassine.png'
  if (identity.includes('amira')) return '/specialistes/amira.png'

  return null
}

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
    overrideAccess: true,
    where: {
      role: {
        equals: 'coach',
      },
    },
    sort: 'firstName',
    limit: 50,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      coachingSpecialty: true,
      coachingBio: true,
      avatar: true,
    },
    depth: 1,
  })

  return Response.json({
    coaches: coaches.docs.map((coach) => {
      const mediaAvatarUrl =
        typeof coach.avatar === 'object' && coach.avatar ? coach.avatar.url ?? null : null

      return {
        id: coach.id,
        name: `${coach.firstName ?? ''} ${coach.lastName ?? ''}`.trim() || coach.email || 'Coach',
        email: coach.email,
        specialty: coach.coachingSpecialty || 'Accompagnement general',
        bio: coach.coachingBio || '',
        avatarUrl: getKnownCoachAvatar(coach) || mediaAvatarUrl,
      }
    }),
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
