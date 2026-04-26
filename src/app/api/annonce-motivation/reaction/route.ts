import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

import { createNotification } from '@/utilities/createNotification'

type ReactionBody = {
  announcementId?: string | number
  reaction?: 'like'
}

const reactionLabels: Record<NonNullable<ReactionBody['reaction']>, string> = {
  like: "J'aime",
}

function getUserName(user: {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()

  return fullName || user.email || 'Un etudiant'
}

function getRelationId(relation: unknown): number | string | null {
  if (typeof relation === 'number' || typeof relation === 'string') return relation
  if (relation && typeof relation === 'object' && 'id' in relation) {
    const id = (relation as { id?: number | string }).id
    return id ?? null
  }

  return null
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'etudiant') {
    return Response.json({ error: 'Seul un etudiant peut reagir.' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as ReactionBody
  const announcementId = body.announcementId
  const reaction = body.reaction

  if (!announcementId || !reaction || !reactionLabels[reaction]) {
    return Response.json({ error: 'Annonce et reaction requises.' }, { status: 400 })
  }

  const announcement = await payload.findByID({
    collection: 'annonce-motivation',
    id: announcementId,
    user,
    overrideAccess: false,
    depth: 1,
  })

  if (announcement.status !== 'published') {
    return Response.json({ error: 'Annonce non disponible.' }, { status: 403 })
  }

  const existingReaction = await payload.find({
    collection: 'annonce-motivation-reactions',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          announcement: {
            equals: announcement.id,
          },
        },
        {
          student: {
            equals: user.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const savedReaction = existingReaction.docs[0]
    ? await payload.update({
        collection: 'annonce-motivation-reactions',
        id: existingReaction.docs[0].id,
        user,
        overrideAccess: false,
        data: {
          reaction,
        },
      })
    : await payload.create({
        collection: 'annonce-motivation-reactions',
        user,
        overrideAccess: false,
        data: {
          announcement: announcement.id,
          reaction,
          student: user.id,
        },
      })

  const coachId = getRelationId(announcement.author)

  if (coachId && String(coachId) !== String(user.id)) {
    try {
      await createNotification({
        actor: user.id,
        event: 'motivation_announcement_reacted',
        link: '/dashboard/coach/annonces',
        message: `${getUserName(user)} a reagi a votre motivation "${announcement.title}" : ${reactionLabels[reaction]}.`,
        payload,
        recipient: Number(coachId),
        sendEmail: true,
        title: 'Nouvelle reaction a une motivation',
        type: 'motivation',
      })
    } catch (error) {
      console.error('Failed to create motivation reaction notification:', error)
    }
  }

  return Response.json({ reaction: savedReaction })
}
