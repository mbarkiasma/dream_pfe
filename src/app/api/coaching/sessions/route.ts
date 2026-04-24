import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { CoachingMode } from '@/lib/coaching'
import { getDisplayName, sanitizeCoachingMessage } from '@/lib/coaching'
import { createNotification } from '@/utilities/createNotification'

type StartSessionBody = {
  coachId?: string
  mode?: CoachingMode
  title?: string
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json({ error: 'Seul un etudiant peut demarrer une session.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as StartSessionBody
  const mode: CoachingMode = body.mode === 'classic' ? 'classic' : 'smart'
  const requestedTitle = sanitizeCoachingMessage(body.title)
  let coachId: number | undefined

  if (mode === 'classic') {
    if (body.coachId) {
      const coach = await payload.findByID({
        collection: 'users',
        id: body.coachId,
        user,
        overrideAccess: false,
        depth: 0,
      })

      if (coach.role !== 'coach' || coach.isAvailableForCoaching !== true) {
        return Response.json({ error: 'Coach indisponible pour le moment.' }, { status: 409 })
      }

      coachId = Number(coach.id)
    } else {
      const coaches = await payload.find({
        collection: 'users',
        user,
        overrideAccess: false,
        where: {
          and: [
            {
              role: {
                equals: 'coach',
              },
            },
            {
              isAvailableForCoaching: {
                equals: true,
              },
            },
          ],
        },
        depth: 0,
        limit: 1,
      })

      coachId = coaches.docs[0]?.id ? Number(coaches.docs[0].id) : undefined
    }

    if (!coachId) {
      return Response.json({ error: 'Aucun coach disponible pour le moment.' }, { status: 409 })
    }
  }

  const session = await payload.create({
    collection: 'coaching-sessions',
    user,
    overrideAccess: false,
    data: {
      title:
        requestedTitle ||
        (mode === 'smart'
          ? `Smart coaching - ${getDisplayName(user)}`
          : `Coaching classique - ${getDisplayName(user)}`),
      student: user.id,
      coach: coachId,
      mode,
      status: 'open',
      startedAt: new Date().toISOString(),
    },
  })

  if (mode === 'classic' && coachId) {
    try {
      await createNotification({
        actor: user.id,
        event: 'coaching_session_created',
        link: '/dashboard/coach/coaching',
        message: `${getDisplayName(user)} a demarre une session de coaching classique.`,
        payload,
        recipient: coachId,
        sendEmail: true,
        title: 'Nouvelle session de coaching',
        type: 'coaching',
      })
    } catch (error) {
      console.error('Failed to create coaching session notification:', error)
    }
  }

  return Response.json({ session })
}
