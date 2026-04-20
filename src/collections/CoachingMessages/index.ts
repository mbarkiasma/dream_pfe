import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadMessage: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'psy') return true

  if (user.role === 'coach') {
    const where: Where = {
      'session.coach': {
        equals: user.id,
      },
    }

    return where
  }

  const where: Where = {
    'session.student': {
      equals: user.id,
    },
  }

  return where
}

export const CoachingMessages: CollectionConfig = {
  slug: 'coaching-messages',
  labels: {
    singular: 'Message de coaching',
    plural: 'Messages de coaching',
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['session', 'senderRole', 'senderUser', 'createdAt'],
    group: 'Coaching',
  },
  access: {
    read: canReadMessage,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => isAdmin(user),
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: 'session',
      type: 'relationship',
      relationTo: 'coaching-sessions',
      required: true,
      index: true,
    },
    {
      name: 'senderRole',
      type: 'select',
      options: [
        { label: 'Etudiant', value: 'student' },
        { label: 'Coach', value: 'coach' },
        { label: 'IA', value: 'ai' },
      ],
      required: true,
    },
    {
      name: 'senderUser',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'audioUrl',
      type: 'text',
    },
    {
      name: 'transcription',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
