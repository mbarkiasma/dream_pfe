import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/roles'

const canReadRendezVousPsy: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true

  if (user.role === 'psy') {
    const where: Where = {
      psychologist: {
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

  return user.role === 'etudiant' ? where : false
}

export const RendezvousPsy: CollectionConfig = {
  slug: 'rendez-vous-psy',
  labels: {
    singular: 'Rendez-vous psy',
    plural: 'Rendez-vous psy',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'student', 'psychologist', 'date', 'startTime', 'status'],
    group: 'Rendez-vous psy',
  },
  access: {
    read: canReadRendezVousPsy,
    create: ({ req: { user } }) => user?.role === 'etudiant' || isAdmin(user),
    update: ({ req: { user } }) => user?.role === 'psy' || isAdmin(user),
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
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
    },
    {
      name: 'reason',
      type: 'textarea',
      label: 'Motif',
      required: true,
    },
    {
      name: 'urgency',
      type: 'select',
      label: 'Urgence',
      defaultValue: 'normal',
      required: true,
      options: [
        { label: 'Normale', value: 'normal' },
        { label: 'Urgente', value: 'urgent' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Confirme', value: 'confirmed' },
        { label: 'Refuse', value: 'rejected' },
        { label: 'Annule', value: 'cancelled' },
        { label: 'Termine', value: 'completed' },
      ],
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      label: 'Cause du refus',
      admin: {
        condition: (_, siblingData) => siblingData?.status === 'rejected',
        description: "Expliquez pourquoi le rendez-vous est refuse afin d'orienter l'etudiant.",
      },
    },
  ],
  timestamps: true,
}
