import crypto from 'node:crypto'
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

const ROLE_REDIRECTS: Record<string, string> = {
  etudiant: '/dashboard/etudiant',
  coach: '/dashboard/coach',
  psy: '/dashboard/psy',
}

export const Users: CollectionConfig = {
  slug: 'users',

  access: {
    admin: authenticated,
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },

  admin: {
    defaultColumns: ['firstName', 'lastName', 'email', 'role'],
    useAsTitle: 'email',
  },

  auth: true,

  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'etudiant',
      saveToJWT: true,
      options: [
        { label: 'Étudiant', value: 'etudiant' },
        { label: 'Coach', value: 'coach' },
        { label: 'Psychologue', value: 'psy' },
      ],
    },
    {
      name: 'magicLoginToken',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'magicLoginExpiresAt',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
  ],

  endpoints: [
    {
      path: '/magic-link-request',
      method: 'post',
      handler: async (req) => {
        try {
          const body = await req.json()

          const { firstName, lastName, email } = body as {
            firstName?: string
            lastName?: string
            email?: string
          }

          if (!firstName || !lastName || !email) {
            return Response.json(
              {
                success: false,
                message: 'firstName, lastName et email sont obligatoires',
              },
              { status: 400 },
            )
          }

          const normalizedEmail = email.trim().toLowerCase()

          const existingUsers = await req.payload.find({
            collection: 'users',
            where: {
              email: {
                equals: normalizedEmail,
              },
            },
            limit: 1,
          })

          let user = existingUsers.docs[0]

          if (!user) {
            const randomPassword = crypto.randomBytes(24).toString('hex')

            user = await req.payload.create({
              collection: 'users',
              data: {
                firstName,
                lastName,
                email: normalizedEmail,
                password: randomPassword,
                role: 'etudiant',
              },
            })
          }

          const role = user.role || 'etudiant'
          const redirectTo = ROLE_REDIRECTS[role] || ROLE_REDIRECTS.etudiant

          const magicLoginToken = crypto.randomBytes(32).toString('hex')
          const magicLoginExpiresAt = new Date(Date.now() + 1000 * 60 * 10)

          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
              magicLoginToken,
              magicLoginExpiresAt: magicLoginExpiresAt.toISOString(),
            },
          })

          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.PAYLOAD_PUBLIC_SERVER_URL ||
            'http://localhost:3000'

            const magicLink = `${appUrl}/auth_magic-link?token=${encodeURIComponent(
            magicLoginToken,
          )}&redirectTo=${encodeURIComponent(redirectTo)} `

          await fetch('http://localhost:5678/webhook/magic-link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: normalizedEmail,
              firstName,
              lastName,
              role,
              redirectTo,
              magicLink,
            }),
          })

          return Response.json(
            {
              success: true,
              message: 'Lien magique envoyé',
              role,
              redirectTo,
            },
            { status: 200 },
          )
        } catch (error) {
          console.error('magic-link-request error:', error)

          return Response.json(
            {
              success: false,
              message: 'Erreur serveur',
            },
            { status: 500 },
          )
        }
      },
    },
  ],

  timestamps: true,
}