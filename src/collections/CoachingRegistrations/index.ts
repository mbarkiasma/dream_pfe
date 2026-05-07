import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadCoachingRegistration: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  if (user.role === 'etudiant') {
    return {
      student: {
        equals: user.id,
      },
    } satisfies Where
  }

  if (user.role === 'coach') {
    return true
  }

  return false
}

const canCreateCoachingRegistration: Access = ({ req: { user } }) => {
  return user?.role === 'etudiant'
}

const canUpdateCoachingRegistration: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  if (user.role === 'etudiant') {
    return {
      student: {
        equals: user.id,
      },
    } satisfies Where
  }

  return false
}

export const CoachingRegistrations: CollectionConfig = {
  slug: 'coaching-registrations',
  labels: {
    singular: 'Inscription coaching',
    plural: 'Inscriptions coaching',
  },
  admin: {
    useAsTitle: 'event',
    defaultColumns: ['event', 'student', 'status', 'createdAt'],
    group: 'Coaching',
  },
  access: {
    read: canReadCoachingRegistration,
    create: canCreateCoachingRegistration,
    update: canUpdateCoachingRegistration,
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'coaching-events',
      label: 'Séance',
      required: true,
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
      name: 'motivation',
      type: 'textarea',
      label: 'Pourquoi voulez-vous participer ?',
      required: true,
    },
    {
      name: 'questions',
      type: 'textarea',
      label: 'Questions pour le coach',
    },
    {
      name: 'specialNeeds',
      type: 'textarea',
      label: 'Besoin particulier',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'registered',
      options: [
        { label: 'Inscrit', value: 'registered' },
        { label: 'Annulé', value: 'cancelled' },
      ],
    },
    {
      name: 'registeredAt',
      type: 'date',
      label: "Date d'inscription",
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
  ],
  timestamps: true,
}
