import { APIError, type Access, type CollectionConfig, type FieldAccess, type Where } from 'payload'
import type { User } from '@/payload-types'
import { hasRole } from '@/access/roles'
import { clerkAuthStrategy } from './clerkAuthStrategy'

const adminOnly = ({ req: { user } }: { req: { user: User | null } }): boolean =>
  hasRole(user, ['admin'])

const adminOnlyAccess: Access = ({ req: { user } }) => hasRole(user, ['admin'])

const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => hasRole(user, ['admin'])

const generatedProfileFieldAccess: FieldAccess = ({ req: { user } }) => hasRole(user, ['admin'])

const managedStaffRoles = ['coach', 'psy'] as const

const adminManagedUsersWhere: Where = {
  role: {
    in: managedStaffRoles,
  },
}

const adminVisibleUsersWhere: Where = {
  role: {
    in: ['etudiant', ...managedStaffRoles],
  },
}

function adminManagedUsersOrSelfWhere(user: User): Where {
  return {
    or: [
      adminVisibleUsersWhere,
      {
        id: {
          equals: user.id,
        },
      },
    ],
  }
}

function isManagedStaffRole(role: unknown): role is (typeof managedStaffRoles)[number] {
  return role === 'coach' || role === 'psy'
}

function assertAdminManagesOnlyStaff(data: Partial<User> | undefined) {
  if (data?.role && !isManagedStaffRole(data.role)) {
    throw new APIError("L'administrateur peut gerer uniquement les comptes coach et psy.", 403)
  }
}

const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user, ['admin'])) return adminManagedUsersWhere

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
    read: ({ req: { user } }) => {
      if (!user) return false
      if (hasRole(user, ['admin'])) return adminManagedUsersOrSelfWhere(user as User)

      return {
        id: {
          equals: user.id,
        },
      }
    },
    update: adminOrSelf,
  },
  admin: {
    baseListFilter: ({ req }) => {
      if (hasRole(req.user as User | null, ['admin'])) return adminVisibleUsersWhere

      return null
    },
    defaultColumns: ['firstName', 'lastName', 'email', 'role', 'isAvailableForCoaching'],
    useAsTitle: 'email',
  },
  auth: {
    strategies: [clerkAuthStrategy],
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && hasRole(req.user as User | null, ['admin'])) {
          if (!data?.role) {
            data = {
              ...data,
              role: 'coach',
            }
          }

          assertAdminManagesOnlyStaff(data as Partial<User> | undefined)
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (!hasRole(req.user as User | null, ['admin'])) {
          return data
        }

        const targetRole = data?.role || originalDoc?.role

        if (operation === 'create') {
          assertAdminManagesOnlyStaff(data as Partial<User> | undefined)
        }

        if (operation === 'update' && !isManagedStaffRole(targetRole)) {
          throw new APIError("L'administrateur peut modifier uniquement les comptes coach et psy.", 403)
        }

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const userId = String(id)
        const userToDelete = await req.payload.findByID({
          collection: 'users',
          id,
          depth: 0,
          req,
        })

        if (hasRole(req.user as User | null, ['admin']) && !isManagedStaffRole(userToDelete.role)) {
          throw new APIError("L'administrateur peut supprimer uniquement les comptes coach et psy.", 403)
        }

        const coachingEvents = await req.payload.find({
          collection: 'coaching-events',
          where: {
            coach: {
              equals: userId,
            },
          },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          req,
        })
        const coachingEventIds = coachingEvents.docs.map((event) => event.id)

        if (coachingEventIds.length > 0) {
          await req.payload.delete({
            collection: 'coaching-registrations',
            where: {
              event: {
                in: coachingEventIds,
              },
            },
            overrideAccess: true,
            req,
          })
        }

        const motivationAnnouncements = await req.payload.find({
          collection: 'annonce-motivation',
          where: {
            author: {
              equals: userId,
            },
          },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          req,
        })
        const motivationAnnouncementIds = motivationAnnouncements.docs.map(
          (announcement) => announcement.id,
        )

        if (motivationAnnouncementIds.length > 0) {
          await req.payload.delete({
            collection: 'annonce-motivation-reactions',
            where: {
              announcement: {
                in: motivationAnnouncementIds,
              },
            },
            overrideAccess: true,
            req,
          })
        }

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
          collection: 'psy-orientations',
          where: {
            or: [{ student: { equals: userId } }, { coach: { equals: userId } }],
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
          collection: 'coaching-registrations',
          where: {
            student: {
              equals: userId,
            },
          },
          overrideAccess: true,
          req,
        })

        await req.payload.delete({
          collection: 'coaching-events',
          where: {
            coach: {
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
          collection: 'annonce-motivation',
          where: {
            author: {
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

        const dreams = await req.payload.find({
          collection: 'dreams',
          where: {
            user: {
              equals: userId,
            },
          },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          req,
        })

        for (const dream of dreams.docs) {
          await req.payload.update({
            collection: 'dreams',
            id: dream.id,
            overrideAccess: true,
            req,
            data: {
              videoAsset: null,
            },
          })
        }

        await req.payload.delete({
          collection: 'media',
          where: {
            owner: {
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
      name: 'studentBranch',
      type: 'select',
      label: 'Branche',
      options: [
        { label: 'LI', value: 'LI' },
        { label: 'LEA', value: 'LEA' },
        { label: 'LPE', value: 'LPE' },
        { label: 'PC', value: 'PC' },
        { label: 'MP', value: 'MP' },
        { label: 'LM', value: 'LM' },
        { label: 'LSE', value: 'LSE' },
        { label: 'Master', value: 'master' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'etudiant',
      },
    },
    {
      name: 'studentLevel',
      type: 'select',
      label: 'Niveau',
      options: [
        { label: 'MP1', value: 'MP1' },
        { label: 'MP2', value: 'MP2' },
        { label: 'PC1', value: 'PC1' },
        { label: 'PC2', value: 'PC2' },
        { label: 'LMI1', value: 'LMI1' },
        { label: 'LMI2', value: 'LMI2' },
        { label: 'LMI3', value: 'LMI3' },
        { label: 'LI1', value: 'LI1' },
        { label: 'LI2', value: 'LI2' },
        { label: 'LI3', value: 'LI3' },
        { label: 'LEA1', value: 'LEA1' },
        { label: 'LEE2', value: 'LEE2' },
        { label: 'LEE3', value: 'LEE3' },
        { label: 'LSE1', value: 'LSE1' },
        { label: 'LSE2', value: 'LSE2' },
        { label: 'LSE3', value: 'LSE3' },
        { label: 'LPE1', value: 'LPE1' },
        { label: 'LPE2', value: 'LPE2' },
        { label: 'LPE3', value: 'LPE3' },
        { label: 'MR1PHY', value: 'MR1PHY' },
        { label: 'MP1IASER', value: 'MP1IASER' },
        { label: 'MP1BIO', value: 'MP1BIO' },
        { label: 'MR1MATH', value: 'MR1MATH' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'etudiant',
      },
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
    {
      name: 'bigFiveProfile',
      type: 'group',
      label: 'Profil Big Five',
      access: {
        update: generatedProfileFieldAccess,
      },
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'etudiant',
        description:
          "Derniers traits Big Five enregistres automatiquement apres l'entretien de personnalite.",
      },
      fields: [
        {
          name: 'analysisId',
          type: 'number',
          label: 'ID analyse',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            readOnly: true,
          },
        },
        {
          name: 'traits',
          type: 'array',
          label: 'Traits Big Five',
          minRows: 5,
          maxRows: 5,
          admin: {
            readOnly: true,
          },
          fields: [
            {
              name: 'name',
              type: 'select',
              required: true,
              options: [
                { label: 'Ouverture', value: 'Ouverture' },
                { label: 'Conscienciosite', value: 'Conscienciosite' },
                { label: 'Extraversion', value: 'Extraversion' },
                { label: 'Agreabilite', value: 'Agreabilite' },
                { label: 'Neuroticisme', value: 'Neuroticisme' },
              ],
            },
            {
              name: 'score',
              type: 'number',
              required: true,
              min: 1,
              max: 10,
            },
            {
              name: 'confidence',
              type: 'select',
              options: [
                { label: 'Eleve', value: 'eleve' },
                { label: 'Moyen', value: 'moyen' },
                { label: 'Faible', value: 'faible' },
              ],
              defaultValue: 'moyen',
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
