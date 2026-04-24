import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

type PatchBody = {
  id?: string | number
  action?: 'mark-read' | 'mark-all-read'
}

export async function GET() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notifications = await payload.find({
    collection: 'notifications',
    user,
    overrideAccess: false,
    where: {
      recipient: {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    depth: 1,
    limit: 30,
  })

  const unread = await payload.count({
    collection: 'notifications',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          recipient: {
            equals: user.id,
          },
        },
        {
          status: {
            equals: 'unread',
          },
        },
      ],
    },
  })

  return Response.json({
    notifications: notifications.docs,
    unreadCount: unread.totalDocs,
  })
}

export async function PATCH(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as PatchBody

  if (body.action === 'mark-all-read') {
    try {
      await payload.update({
        collection: 'notifications',
        user,
        overrideAccess: false,
        where: {
          and: [
            {
              recipient: {
                equals: user.id,
              },
            },
            {
              status: {
                equals: 'unread',
              },
            },
          ],
        },
        data: {
          status: 'read',
          readAt: new Date().toISOString(),
        },
      })

      return Response.json({ success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur notifications.'

      return Response.json({ error: message }, { status: 500 })
    }
  }

  if (body.action === 'mark-read' && body.id) {
    try {
      const notification = await payload.findByID({
        collection: 'notifications',
        id: body.id,
        user,
        overrideAccess: false,
        depth: 0,
      })

      const recipientId =
        typeof notification.recipient === 'object'
          ? notification.recipient.id
          : notification.recipient

      if (String(recipientId) !== String(user.id)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      await payload.update({
        collection: 'notifications',
        id: body.id,
        user,
        overrideAccess: false,
        data: {
          status: 'read',
          readAt: new Date().toISOString(),
        },
      })

      return Response.json({ success: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Notification introuvable.'

      return Response.json({ error: message }, { status: 404 })
    }
  }

  return Response.json({ error: 'Action invalide.' }, { status: 400 })
}
