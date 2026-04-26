import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload, type Where } from 'payload'

import { createNotification } from '@/utilities/createNotification'

type CreateAnnouncementBody = {
  content?: string
  id?: string | number
  status?: 'draft' | 'published'
  title?: string
}

function getUserName(user: {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()

  return fullName || user.email || 'Un coach'
}

async function notifyStudentsAboutMotivation({
  payload,
  title,
  user,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  title: string
  user: {
    email?: string | null
    firstName?: string | null
    id: number
    lastName?: string | null
  }
}) {
  const students = await payload.find({
    collection: 'users',
    where: {
      role: {
        equals: 'etudiant',
      },
    },
    depth: 0,
    limit: 1000,
  })

  await Promise.all(
    students.docs.map((student) =>
      createNotification({
        actor: user.id,
        event: 'motivation_announcement_published',
        link: '/dashboard/student/motivation',
        message: `${getUserName(user)} a publie une nouvelle motivation : ${title}.`,
        payload,
        recipient: student.id,
        sendEmail: true,
        title: 'Nouvelle motivation publiee',
        type: 'motivation',
      }),
    ),
  )
}

export async function GET() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const where: Where =
    user.role === 'coach'
      ? {
          author: {
            equals: user.id,
          },
        }
      : {
          status: {
            equals: 'published',
          },
        }

  const announcements = await payload.find({
    collection: 'annonce-motivation',
    user,
    overrideAccess: false,
    where,
    depth: 1,
    sort: '-publishedAt',
    limit: 50,
  })

  return Response.json({ announcements: announcements.docs })
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach' && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as CreateAnnouncementBody
  const title = body.title?.trim()
  const content = body.content?.trim()
  const status = body.status === 'draft' ? 'draft' : 'published'

  if (!title || !content) {
    return Response.json({ error: 'Titre et contenu requis.' }, { status: 400 })
  }

  const announcement = await payload.create({
    collection: 'annonce-motivation',
    user,
    overrideAccess: false,
    data: {
      title,
      content,
      status,
      author: user.id,
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
    },
  })

  if (status === 'published') {
    try {
      await notifyStudentsAboutMotivation({ payload, title, user })
    } catch (error) {
      console.error('Failed to create motivation notifications:', error)
    }
  }

  return Response.json({ announcement })
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach' && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as CreateAnnouncementBody
  const id = body.id
  const title = body.title?.trim()
  const content = body.content?.trim()
  const status = body.status === 'draft' ? 'draft' : 'published'

  if (!id || !title || !content) {
    return Response.json({ error: 'Annonce, titre et contenu requis.' }, { status: 400 })
  }

  const announcement = await payload.update({
    collection: 'annonce-motivation',
    id,
    user,
    overrideAccess: false,
    data: {
      title,
      content,
      status,
      publishedAt: status === 'published' ? new Date().toISOString() : undefined,
    },
  })

  return Response.json({ announcement })
}

export async function DELETE(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'coach' && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Annonce requise.' }, { status: 400 })
  }

  const announcement = await payload.findByID({
    collection: 'annonce-motivation',
    id,
    user,
    overrideAccess: false,
    depth: 0,
  })

  await payload.delete({
    collection: 'annonce-motivation-reactions',
    where: {
      announcement: {
        equals: announcement.id,
      },
    },
  })

  await payload.delete({
    collection: 'annonce-motivation',
    id: announcement.id,
    user,
    overrideAccess: false,
  })

  return Response.json({ success: true })
}
