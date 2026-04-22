import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canManageAvailability: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  return user.role === 'psy'
}

const canUpdateOwnAvailability: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  const where: Where = {
    psychologist: {
      equals: user.id,
    },
  }

  return user.role === 'psy' ? where : false
}

export const PsyAvailabilities: CollectionConfig = {
  slug: 'psy-availabilities',
  labels: {
    singular: 'Disponibilite psy',
    plural: 'Disponibilites psy',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'psychologist', 'dayOfWeek', 'startTime', 'endTime', 'isActive'],
    group: 'Rendez-vous psy',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: canManageAvailability,
    update: canUpdateOwnAvailability,
    delete: canUpdateOwnAvailability,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Disponibilite psychologue',
      required: true,
    },
    {
      name: 'psychologist',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: {
          equals: 'psy',
        },
      },
    },
    {
      name: 'dayOfWeek',
      type: 'select',
      label: 'Jour',
      required: true,
      options: [
        { label: 'Lundi', value: 'monday' },
        { label: 'Mardi', value: 'tuesday' },
        { label: 'Mercredi', value: 'wednesday' },
        { label: 'Jeudi', value: 'thursday' },
        { label: 'Vendredi', value: 'friday' },
        { label: 'Samedi', value: 'saturday' },
        { label: 'Dimanche', value: 'sunday' },
      ],
    },
    {
      name: 'startTime',
      type: 'text',
      label: 'Heure de debut',
      required: true,
      admin: {
        description: 'Format HH:mm, exemple 09:00',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      label: 'Heure de fin',
      required: true,
      admin: {
        description: 'Format HH:mm, exemple 12:00',
      },
    },
    {
      name: 'slotDuration',
      type: 'number',
      label: 'Duree du creneau en minutes',
      defaultValue: 30,
      required: true,
      min: 15,
      max: 120,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
