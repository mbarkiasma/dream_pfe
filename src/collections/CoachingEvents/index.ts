import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadCoachingEvent: Access = ({ req: { user } }) => {
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
      status: {
        equals: 'published',
      },
    }

    return where
  }

  return false
}


const canCreateCoachingEvent: Access = ({ req: { user } }) => {
  return Boolean(user && (isAdmin(user) || user.role === 'coach'))
}

const canUpdateCoachingEvent: Access = ({ req: { user } }) => {
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


export const CoachingEvents: CollectionConfig = {
  slug: 'coaching-events',
  labels: {
    singular: 'Séance de coaching',
    plural: 'Séances de coaching',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'theme', 'coach', 'scheduledAt', 'status'],
    group: 'Coaching',
  },
  access: {
    read: canReadCoachingEvent,
    create: canCreateCoachingEvent,
    update: canUpdateCoachingEvent,
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      required: true,
    },
    {
      name: 'theme',
      type: 'text',
      label: 'Thème',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
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
      name: 'scheduledAt',
      type: 'date',
      label: 'Date et heure de la séance',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      label: 'Durée en minutes',
      required: true,
      defaultValue: 60,
      min: 15,
    },
    {
      name: 'teamsJoinUrl',
      type: 'text',
      label: 'Lien Microsoft Teams',
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
        { label: 'Annulée', value: 'cancelled' },
        { label: 'Terminée', value: 'completed' },
      ],
    },
    {
      name: 'announcementSentAt',
      type: 'date',
      label: "Date d'envoi de l'annonce",
    },
    {
      name: 'reminderSentAt',
      type: 'date',
      label: "Date d'envoi du rappel",
    },
  ],
  timestamps: true,
}
