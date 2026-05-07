import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadPsyOrientation: Access = ({ req: { user } }) => {
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

  if (user.role === 'psy') {
    const where: Where = {
      status: {
        in: ['appointment_requested', 'student_accepted'],
      },
    }

    return where
  }

  return false
}

const canCreatePsyOrientation: Access = ({ req: { user } }) => {
  return Boolean(user && (isAdmin(user) || user.role === 'coach'))
}

const canUpdatePsyOrientation: Access = ({ req: { user } }) => {
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

export const PsyOrientations: CollectionConfig = {
  slug: 'psy-orientations',
  labels: {
    singular: 'Orientation psy',
    plural: 'Orientations psy',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'coach', 'status', 'createdAt'],
    group: 'Rendez-vous psy',
  },
  access: {
    read: canReadPsyOrientation,
    create: canCreatePsyOrientation,
    update: canUpdatePsyOrientation,
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Orientation vers psychologue',
    },
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      label: 'Étudiant',
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
      label: "Motif d'orientation",
      required: true,
    },
    {
      name: 'observation',
      type: 'textarea',
      label: 'Observation du coach',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'pending_student_response',
      options: [
        { label: 'En attente de réponse étudiant', value: 'pending_student_response' },
        { label: 'Refusée par étudiant', value: 'student_refused' },
        { label: 'Acceptée par étudiant', value: 'student_accepted' },
        { label: 'Rendez-vous demandé', value: 'appointment_requested' },
        { label: 'Annulée', value: 'cancelled' },
      ],
    },
    {
      name: 'studentRefusalReason',
      type: 'textarea',
      label: 'Raison du refus étudiant',
      admin: {
        condition: (_, siblingData) => siblingData?.status === 'student_refused',
      },
    },
    {
      name: 'studentRespondedAt',
      type: 'date',
      label: "Date de réponse de l'étudiant",
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'rendez-vous-psy',
      label: 'Rendez-vous associé',
    },
  ],
  timestamps: true,
}
