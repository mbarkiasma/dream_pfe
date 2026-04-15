import crypto from 'crypto'
import { getPayload } from 'payload'

import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    const body = (await request.json()) as {
      email?: string
      firstName?: string
      lastName?: string
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''

    if (!email || !firstName || !lastName) {
      return Response.json(
        {
          success: false,
          message: 'Veuillez remplir tous les champs.',
        },
        { status: 400 },
      )
    }

    const webhookURL = process.env.N8N_MAGIC_LINK_WEBHOOK_URL?.trim()

    if (!webhookURL) {
      return Response.json(
        {
          success: false,
          message: 'N8N_MAGIC_LINK_WEBHOOK_URL manquante.',
        },
        { status: 500 },
      )
    }

    const existingUsers = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        email: {
          equals: email,
        },
      },
    })

    const user =
      existingUsers.docs[0] ??
      (await payload.create({
        collection: 'users',
        data: {
          email,
          firstName,
          lastName,
          password: crypto.randomBytes(24).toString('hex'),
          role: 'etudiant',
        },
      }))

    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString()

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        firstName,
        lastName,
        role: user.role || 'etudiant',
        magicLoginToken: hashedToken,
        magicLoginExpiresAt: expiresAt,
      },
    })

    const magicLink = `${getServerSideURL()}/auth/magic-link?token=${encodeURIComponent(rawToken)}`

    const n8nResponse = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        magicLink,
      }),
    })

    if (!n8nResponse.ok) {
      return Response.json(
        {
          success: false,
          message: `Erreur n8n (${n8nResponse.status}).`,
        },
        { status: 502 },
      )
    }

    return Response.json({
      success: true,
      message: 'Lien magique envoyé.',
    })
  } catch (error) {
    console.error('magic-link-request error:', error)

    const message =
      error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi."

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    )
  }
}
