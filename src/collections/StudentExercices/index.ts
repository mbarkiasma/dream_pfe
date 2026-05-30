import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'
import { getRelationId } from '@/lib/coaching'


const canReadStudentExercice: Access = async ({ req: { payload, user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  if (user.role === 'coach') {
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

  if (user.role === 'etudiant') {
    const where: Where = {
      student: {
        equals: user.id,
      },
    }

    return where
  }

  return false
}
const canCreateStudentExercice: Access = ({ req: { user } }) => {
  return Boolean(user && (isAdmin(user) || user.role === 'coach'))
}

const canUpdateStudentExercice: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  if (user.role === 'coach') {
    const where: Where = {
      coach: {
        equals: user.id,
      },
    }

    return where
  }

  if (user.role === 'etudiant') {
    const where: Where = {
      student: {
        equals: user.id,
      },
    }

    return where
  }

  return false
}

const canDeleteStudentExercice: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  if (user.role === 'coach') {
    const where: Where = {
      coach: {
        equals: user.id,
      },
    }

    return where
  }

  return false
}

export const StudentExercices: CollectionConfig = {
  slug: 'student-exercices',
  labels: {
    singular: 'Exercice etudiant',
    plural: 'Exercices etudiants',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'coach', 'status', 'dueDate'],
    group: 'Coaching',
  },
  access: {
    read: canReadStudentExercice,
    create: canCreateStudentExercice,
    update: canUpdateStudentExercice,
    delete: canDeleteStudentExercice,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
      localized: true,
    },
    {
      name: 'instructions',
      type: 'textarea',
      label: 'Consignes',
      required: true,
      localized: true,
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      label: 'Etudiant',
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
      label: 'Coach',
      required: true,
      filterOptions: {
        role: {
          equals: 'coach',
        },
      },
    },
    {
      name: 'reason',
      type: 'textarea',
      label: "Pourquoi cet exercice est attribue",
      localized: true,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'assigned',
      options: [
        { label: 'Attribue', value: 'assigned' },
        { label: 'En cours', value: 'in_progress' },
        { label: 'Termine', value: 'completed' },
        { label: 'Corrige', value: 'reviewed' },
        { label: 'Non fait', value: 'missed' },
      ],
    },
    {
      name: 'dueDate',
      type: 'date',
      label: 'Echeance',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'studentResponse',
      type: 'textarea',
      label: "Reponse de l'etudiant",
    },
    {
      name: 'coachFeedback',
      type: 'textarea',
      label: 'Feedback du coach',
      localized: true,
    },
    {
      name: 'assignedAt',
      type: 'date',
      label: "Date d'attribution",
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Date de completion',
    },
  ],
  timestamps: true,
}
