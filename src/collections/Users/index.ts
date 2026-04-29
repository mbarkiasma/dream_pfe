import type { Access, CollectionConfig, FieldAccess } from 'payload'
import type { User } from '@/payload-types'
import { hasRole } from '@/access/roles'
import { authenticated } from '../../access/authenticated'
import { clerkAuthStrategy } from './clerkAuthStrategy'

const adminOnly = ({ req: { user } }: { req: { user: User | null } }): boolean =>
  hasRole(user, ['admin'])

const adminOnlyAccess: Access = ({ req: { user } }) => hasRole(user, ['admin'])

const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => hasRole(user, ['admin'])

const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, ['admin'])) return true

  return {
    id: {
      equals: user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: adminOnly,
    create: adminOnlyAccess,
    delete: adminOnlyAccess,
    read: authenticated,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['firstName', 'lastName', 'email', 'role', 'isAvailableForCoaching'],
    useAsTitle: 'email',
  },
  auth: {
    strategies: [clerkAuthStrategy],
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const userId = String(id)
        const userToDelete = await req.payload.findByID({
          collection: 'users',
          id,
          depth: 0,
          req,
        })

        await req.payload.delete({
          collection: 'coaching-messages',
          where: {
            or: [
              { senderUser: { equals: userId } },
              { 'session.student': { equals: userId } },
              { 'session.coach': { equals: userId } },
            ],
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'coach-notes',
          where: {
            or: [{ student: { equals: userId } }, { coach: { equals: userId } }],
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'coaching-sessions',
          where: {
            or: [{ student: { equals: userId } }, { coach: { equals: userId } }],
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'notifications',
          where: {
            or: [{ recipient: { equals: userId } }, { actor: { equals: userId } }],
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'rendez-vous-psy',
          where: {
            or: [{ student: { equals: userId } }, { psychologist: { equals: userId } }],
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'psy-availabilities',
          where: {
            psychologist: {
              equals: userId,
            },
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'annonce-motivation-reactions',
          where: {
            student: {
              equals: userId,
            },
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'analyse-personnalite',
          where: {
            user: {
              equals: userId,
            },
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'dreams',
          where: {
            user: {
              equals: userId,
            },
          },
          overrideAccess: true,
          req,
        })

        if (userToDelete.clerkUserId) {
          try {
            const { clerkClient } = await import('@clerk/nextjs/server')
            const clerk = await clerkClient()

            await clerk.users.deleteUser(userToDelete.clerkUserId)
          } catch (error) {
            console.error('Failed to delete Clerk user:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'clerkUserId',
      type: 'text',
      label: 'Clerk user ID',
      unique: true,
      index: true,
      access: {
        update: adminOnlyFieldAccess,
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'magic_login_token',
      type: 'text',
      access: {
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'magic_login_expires_at',
      type: 'date',
      access: {
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'onboardingStep',
      type: 'select',
      defaultValue: 'profile',
      required: true,
      options: [
        { label: 'Profil', value: 'profile' },
        { label: 'Entretien', value: 'interview' },
        { label: 'Termine', value: 'completed' },
      ],
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'etudiant',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Etudiant', value: 'etudiant' },
        { label: 'Coach', value: 'coach' },
        { label: 'Psychologue', value: 'psy' },
      ],
      required: true,
      saveToJWT: true,
      access: {
        update: adminOnlyFieldAccess,
      },
    },
    {
      name: 'isAvailableForCoaching',
      type: 'checkbox',
      defaultValue: false,
      label: 'Disponible pour le coaching humain',
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'coach',
        description:
          "Activez ce champ quand le coach peut recevoir de nouvelles sessions d'accompagnement.",
      },
    },
    {
      name: 'coachingSpecialty',
      type: 'text',
      label: 'Specialite coaching',
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'coach',
        description: 'Exemple : stress, motivation, orientation, organisation.',
      },
    },
    {
      name: 'coachingBio',
      type: 'textarea',
      label: 'Presentation coaching',
      maxLength: 280,
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'coach',
      },
    },
  ],
  timestamps: true,
}
