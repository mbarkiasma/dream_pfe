import type { Access, CollectionConfig, Where } from 'payload'

const canReadReactions: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin' || user.role === 'coach' || user.role === 'psy') return true

  const where: Where = {
    student: {
      equals: user.id,
    },
  }

  return where
}

export const AnnonceMotivationReactions: CollectionConfig = {
  slug: 'annonce-motivation-reactions',
  labels: {
    singular: 'Reaction motivation',
    plural: 'Reactions motivation',
  },
  admin: {
    useAsTitle: 'reaction',
    defaultColumns: ['announcement', 'student', 'reaction', 'createdAt'],
    group: 'Coaching',
  },
  access: {
    read: canReadReactions,
    create: ({ req: { user } }) => user?.role === 'etudiant',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true

      return {
        student: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'announcement',
      type: 'relationship',
      relationTo: 'annonce-motivation',
      required: true,
      index: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'reaction',
      type: 'select',
      required: true,
      options: [
        { label: "J'aime", value: 'like' },
      ],
    },
  ],
  timestamps: true,
}
