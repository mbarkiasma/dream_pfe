import type { CollectionConfig } from 'payload'

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
