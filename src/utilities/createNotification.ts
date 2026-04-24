import type { Payload, PayloadRequest } from 'payload'

type NotificationType = 'rendezvous' | 'coaching' | 'analyse' | 'system'

type CreateNotificationArgs = {
  actor?: number
  event?: string
  link?: string
  message: string
  payload: Payload
  recipient: number
  req?: PayloadRequest
  sendEmail?: boolean
  title: string
  type?: NotificationType
}

function withSiteUrl(link?: string) {
  if (!link) return undefined
  if (link.startsWith('http://') || link.startsWith('https://')) return link

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL)?.replace(
    /\/$/,
    '',
  )
  return siteUrl ? `${siteUrl}${link.startsWith('/') ? link : `/${link}`}` : link
}

export async function createNotification({
  actor,
  event = 'notification_created',
  link,
  message,
  payload,
  recipient,
  req,
  sendEmail = false,
  title,
  type = 'system',
}: CreateNotificationArgs) {
  const reqOptions = req ? { req } : {}

  const notification = await payload.create({
    collection: 'notifications',
    data: {
      actor,
      emailStatus: sendEmail ? 'pending' : 'skipped',
      link,
      message,
      recipient,
      sendEmail,
      status: 'unread',
      title,
      type,
    },
    ...reqOptions,
  })

  if (!sendEmail) {
    return notification
  }

  const webhookUrl = process.env.N8N_NOTIFICATION_WEBHOOK_URL

  if (!webhookUrl) {
    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        emailStatus: 'failed',
      },
      ...reqOptions,
    })

    return notification
  }

  try {
    const user = await payload.findByID({
      collection: 'users',
      id: recipient,
      depth: 0,
      ...reqOptions,
    })

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify({
        event,
        link: withSiteUrl(link),
        message,
        notificationId: notification.id,
        subject: title,
        title,
        to: user.email,
      }),
    })

    if (!response.ok) {
      throw new Error(`Notification webhook failed with status ${response.status}`)
    }

    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        emailStatus: 'sent',
      },
      ...reqOptions,
    })
  } catch (error) {
    console.error('Failed to send notification email:', error)

    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        emailStatus: 'failed',
      },
      ...reqOptions,
    })
  }

  return notification
}
