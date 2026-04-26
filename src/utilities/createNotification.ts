import type { Payload, PayloadRequest } from 'payload'

type NotificationType = 'rendezvous' | 'coaching' | 'analyse' | 'motivation' | 'system'

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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

  try {
    const user = await payload.findByID({
      collection: 'users',
      id: recipient,
      depth: 0,
      ...reqOptions,
    })

    const fullLink = withSiteUrl(link)
    const safeTitle = escapeHtml(title)
    const safeMessage = escapeHtml(message)
    const safeLink = fullLink ? escapeHtml(fullLink) : ''

    await payload.sendEmail({
      to: user.email,
      subject: title,
      html: [
        '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #24114f; line-height: 1.6;">',
        '<div style="padding: 24px; border: 1px solid #eee7ff; border-radius: 16px; background: #fbf8ff;">',
        '<p style="font-size: 12px; margin: 0 0 10px; color: #7b6b9a; text-transform: uppercase; letter-spacing: .08em;">Dream PFE</p>',
        `<h2 style="margin: 0 0 12px; color: #2d1068; font-size: 22px;">${safeTitle}</h2>`,
        `<p style="font-size: 15px; margin: 0 0 20px;">${safeMessage}</p>`,
        safeLink
          ? `<a href="${safeLink}" style="display: inline-block; background: #6d28d9; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700;">Ouvrir la plateforme</a>`
          : '',
        '</div>',
        '<p style="font-size: 12px; color: #7b6b9a; margin-top: 16px;">Cet email a ete envoye automatiquement par Dream PFE.</p>',
        '</div>',
      ].join(''),
      text: fullLink ? `${message}\n\n${fullLink}` : message,
    })

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
