import type { CollectionConfig } from 'payload'

const isAdmin = (user: { role?: string | null } | null | undefined) => user?.role === 'admin'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'recipient', 'type', 'status', 'emailStatus', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false

      if (isAdmin(user)) {
        return true
      }

      return {
        recipient: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      return isAdmin(user)
    },
    update: ({ req: { user } }) => {
      if (!user) return false

      if (isAdmin(user)) {
        return true
      }

      return {
        recipient: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      return isAdmin(user)
    },
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'system',
      options: [
        { label: 'Rendez-vous', value: 'rendezvous' },
        { label: 'Coaching', value: 'coaching' },
        { label: 'Analyse', value: 'analyse' },
        { label: 'Système', value: 'system' },
      ],
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'unread',
      options: [
        { label: 'Non lue', value: 'unread' },
        { label: 'Lue', value: 'read' },
      ],
      index: true,
    },
    {
      name: 'link',
      type: 'text',
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'sendEmail',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'emailStatus',
      type: 'select',
      required: true,
      defaultValue: 'skipped',
      options: [
        { label: 'Ignoré', value: 'skipped' },
        { label: 'En attente', value: 'pending' },
        { label: 'Envoyé', value: 'sent' },
        { label: 'Échec', value: 'failed' },
      ],
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
    {
      name: 'readAt',
      type: 'date',
    },
  ],
  timestamps: true,
}
