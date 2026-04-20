import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadCoachNote: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'psy') return true

  return {
    coach: {
      equals: user.id,
    },
  }
}

export const CoachNotes: CollectionConfig = {
  slug: 'coach-notes',
  labels: {
    singular: 'Note de coach',
    plural: 'Notes de coach',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'session', 'student', 'coach', 'createdAt'],
    group: 'Coaching',
  },
  access: {
    read: canReadCoachNote,
    create: ({ req: { user } }) => user?.role === 'coach',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true

      return {
        coach: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (isAdmin(user)) return true

      return {
        coach: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'session',
      type: 'relationship',
      relationTo: 'coaching-sessions',
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
      required: true,
      filterOptions: {
        role: {
          equals: 'coach',
        },
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
  timestamps: true,
}
