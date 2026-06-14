import type { Payload, PayloadRequest } from 'payload'

import { buildEmailHtml } from './emailHtml'

type NotificationType = 'rendezvous' | 'coaching' | 'analyse' | 'motivation' | 'system'

type CreateNotificationArgs = {
  actor?: number
  event?: string
  link?: string
  linkLabel?: string
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
  linkLabel,
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
    const safeLabel = escapeHtml(linkLabel ?? 'Ouvrir la plateforme')

    const emailResult = buildEmailHtml({
      title: safeTitle,
      body: safeMessage,
      ctaHref: safeLink || undefined,
      ctaLabel: safeLabel,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (payload.sendEmail as any)({
      to: user.email,
      subject: title,
      html: emailResult.html,
      text: fullLink ? `${message}\n\n${fullLink}` : message,
      attachments: emailResult.attachments,
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
