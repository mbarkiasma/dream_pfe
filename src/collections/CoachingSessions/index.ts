import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadCoachingSession: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'psy') return true

  if (user.role === 'coach') {
    const where: Where = {
      coach: {
        equals: user.id,
      },
    }

    return where
  }

  const where: Where = {
    student: {
      equals: user.id,
    },
  }

  return where
}

const canCreateCoachingSession: Access = ({ req: { user } }) => {
  if (!user) return false

  return isAdmin(user) || user.role === 'etudiant'
}

const canUpdateCoachingSession: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'psy') return true

  if (user.role === 'coach') {
    const where: Where = {
      coach: {
        equals: user.id,
      },
    }

    return where
  }

  const where: Where = {
    student: {
      equals: user.id,
    },
  }

  return where
}

export const CoachingSessions: CollectionConfig = {
  slug: 'coaching-sessions',
  labels: {
    singular: 'Session de coaching',
    plural: 'Sessions de coaching',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'coach', 'mode', 'status', 'createdAt'],
    group: 'Coaching',
  },
  access: {
    read: canReadCoachingSession,
    create: canCreateCoachingSession,
    update: canUpdateCoachingSession,
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: {
          equals: 'etudiant',
        },
      },
    },
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: {
          equals: 'coach',
        },
      },
      admin: {
        condition: (_, siblingData) => siblingData?.mode === 'classic',
      },
    },
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'smart',
      options: [
        { label: 'Smart coach IA', value: 'smart' },
        { label: 'Coaching classique', value: 'classic' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Ouverte', value: 'open' },
        { label: 'Cloturee', value: 'closed' },
      ],
      required: true,
    },
    {
      name: 'startedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'endedAt',
      type: 'date',
      admin: {
        condition: (_, siblingData) => siblingData?.status === 'closed',
      },
    },
  ],
  timestamps: true,
}
