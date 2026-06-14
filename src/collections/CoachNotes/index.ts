import type { Access, CollectionConfig, Where } from 'payload'

import { getRelationId } from '@/lib/coaching'

const canReadCoachNote: Access = async ({ req: { payload, user } }) => {
  if (!user) return false
  if (user.role === 'psy') return true

  if (user.role !== 'coach') return false

  const sessions = await payload.find({
    collection: 'coaching-sessions',
    user,
    overrideAccess: false,
    where: {
      and: [
        {
          coach: {
            equals: user.id,
          },
        },
        {
          mode: {
            equals: 'classic',
          },
        },
      ],
    },
    depth: 0,
    limit: 100,
  })

  const assignedStudentIds = sessions.docs
    .map((session) => getRelationId(session.student))
    .filter((studentId): studentId is string | number => studentId !== null)

  const where: Where = {
    or: [
      {
        coach: {
          equals: user.id,
        },
      },
      {
        student: {
          in: assignedStudentIds,
        },
      },
    ],
  }

  return where
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

      return {
        coach: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false

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
