import crypto from 'node:crypto'
import dns from 'node:dns'
import nodemailer from 'nodemailer'
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

dns.setDefaultResultOrder('ipv4first')

const ROLE_REDIRECTS: Record<string, string> = {
  etudiant: '/dashboard/student',
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
        { label: 'Etudiant', value: 'etudiant' },
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
          const body = await (req as Request).json()

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
            process.env.NEXT_PUBLIC_SERVER_URL ||
            process.env.PAYLOAD_PUBLIC_SERVER_URL ||
            'http://localhost:3000'

          const magicLink = `${appUrl}/auth/magic-link?email=${encodeURIComponent(normalizedEmail)}`
          const gmailUser = process.env.GMAIL_USER?.trim()
          const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim()

          if (!gmailUser || !gmailAppPassword) {
            return Response.json(
              {
                success: false,
                message: 'Configuration email manquante.',
              },
              { status: 500 },
            )
          }

          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: gmailUser,
              pass: gmailAppPassword,
            },
            tls: {
              rejectUnauthorized: false,
              servername: 'smtp.gmail.com',
            },
          })

          await transporter.sendMail({
            from: `"DreamReves" <${gmailUser}>`,
            to: normalizedEmail,
            subject: 'Connexion a DreamReves',
            html: `
              <div style="margin:0;padding:0;background:#f3f0ff;font-family:Arial,sans-serif;">
                <div style="padding:40px 20px;">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(79,70,229,0.12);">
                    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 24px;text-align:center;">
                      <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:rgba(255,255,255,0.18);line-height:64px;font-size:28px;">🌙</div>
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">DreamReves</h1>
                      <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Votre lien de connexion securise</p>
                    </div>
                    <div style="padding:36px 32px;text-align:center;">
                      <h2 style="margin:0 0 14px;color:#2f2a44;font-size:24px;">Bonjour ${firstName} 👋</h2>
                      <p style="margin:0 0 12px;color:#6b7280;font-size:15px;line-height:1.7;">Vous avez demande a vous connecter a votre espace DreamReves.</p>
                      <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.7;">Cliquez sur le bouton ci-dessous pour acceder directement a votre plateforme.</p>
                      <a
                        href="${magicLink}"
                        style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:700;box-shadow:0 8px 20px rgba(79,70,229,0.25);"
                      >
                        Se connecter maintenant
                      </a>
                      <p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.6;">Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email en toute securite.</p>
                    </div>
                    <div style="padding:18px 24px;background:#faf8ff;text-align:center;border-top:1px solid #ede9fe;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">Role detecte: ${role} | Redirection: ${redirectTo}</p>
                    </div>
                  </div>
                </div>
              </div>
            `,
          })

          return Response.json(
            {
              success: true,
              message: 'Lien magique envoye',
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
