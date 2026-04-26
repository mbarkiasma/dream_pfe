import type { Access, CollectionConfig, Where } from 'payload'

const isAdminOrCoach = (user: any) => user?.role === 'admin' || user?.role === 'coach'

const canReadAnnouncements: Access = ({ req: { user } }) => {
  if (!user) return false

  if (user.role === 'admin' || user.role === 'coach' || user.role === 'psy') {
    return true
  }

  const where: Where = {
    status: {
      equals: 'published',
    },
  }

  return where
}

const canUpdateAnnouncements: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  if (user.role === 'coach') {
    return {
      author: {
        equals: user.id,
      },
    }
  }

  return false
}

export const AnnonceMotivation: CollectionConfig = {
  slug: 'annonce-motivation',
  labels: {
    singular: 'Annonce de motivation',
    plural: 'Annonces de motivation',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedAt', 'createdAt'],
    group: 'Coaching',
  },
  access: {
    read: canReadAnnouncements,
    create: ({ req: { user } }) => isAdminOrCoach(user),
    update: canUpdateAnnouncements,
    delete: canUpdateAnnouncements,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user) {
          data.author = req.user.id
        }

        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Contenu',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Coach',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publiée', value: 'published' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date de publication',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
