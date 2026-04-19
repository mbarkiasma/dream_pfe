import { APIError, type CollectionConfig } from 'payload'

const WEEKLY_DREAM_LIMIT = 4

function getStartOfWeek() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const startOfWeek = new Date(now)

  startOfWeek.setDate(now.getDate() - diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  return startOfWeek
}

export const Dreams: CollectionConfig = {
  slug: 'dreams',
  labels: {
    singular: 'Dream',
    plural: 'Dreams',
  },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['user', 'videoStatus', 'createdAt'],
    group: 'Entretiens',
  },
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation !== 'create') {
          return data
        }

        const targetUser = data?.user
        const targetUserId =
          typeof targetUser === 'string'
            ? targetUser
            : targetUser && typeof targetUser === 'object' && 'id' in targetUser
              ? String(targetUser.id)
              : req.user?.id

        if (!targetUserId) {
          throw new APIError('Utilisateur introuvable pour ce reve.', 400)
        }

        const startOfWeek = getStartOfWeek()
        const dreamsThisWeek = await req.payload.find({
          collection: 'dreams',
          where: {
            and: [
              {
                user: {
                  equals: targetUserId,
                },
              },
              {
                createdAt: {
                  greater_than_equal: startOfWeek.toISOString(),
                },
              },
            ],
          },
          limit: 0,
          depth: 0,
          req,
        })

        if (dreamsThisWeek.totalDocs >= WEEKLY_DREAM_LIMIT) {
          throw new APIError(
            `Limite atteinte: ${WEEKLY_DREAM_LIMIT} reves maximum par semaine.`,
            429,
          )
        }

        return data
      },
    ],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false

      if (user.role === 'coach') {
        return true
      }

      return {
        user: {
          equals: user.id,
        },
      }
    },
    //create: ({ req: { user } }) => user?.role === 'etudiant',
    create: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: ({ req: { user } }) => {
      if (!user) return false

      return {
        user: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'analysis',
      type: 'textarea',
    },
    {
      name: 'videoStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
         { label: 'Waiting Validation', value: 'waiting_validation' },
        { label: 'Generating', value: 'generating' },
        { label: 'Ready', value: 'ready' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'videoUrl',
      type: 'text',
    },
    {
      name: 'videoAsset',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'operationName',
      type: 'text',
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
