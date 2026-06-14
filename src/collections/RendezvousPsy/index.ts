import type { Access, CollectionConfig, Where } from 'payload'


const canReadRendezVousPsy: Access = ({ req: { user } }) => {
  if (!user) return false

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
    create: ({ req: { user } }) => user?.role === 'etudiant',
    update: ({ req: { user } }) => user?.role === 'psy',
    delete: () => false,
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
      name: 'orientation',
      type: 'relationship',
      relationTo: 'psy-orientations',
      label: 'Orientation coach',
      admin: {
        description: "Renseigne si ce rendez-vous vient d'une orientation creee par un coach.",
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
    {
      name: 'modality',
      type: 'select',
      label: 'Modalite',
      options: [
        { label: 'Presentiel', value: 'presentiel' },
        { label: 'En ligne', value: 'en_ligne' },
      ],
      admin: {
        description: 'Choisie par le psy lors de la confirmation.',
      },
    },
    {
      name: 'teamsJoinUrl',
      type: 'text',
      label: 'Lien Microsoft Teams',
      admin: {
        condition: (_, siblingData) => siblingData?.modality === 'en_ligne',
        description: 'Lien de la reunion Microsoft Teams pour le rendez-vous en ligne.',
      },
    },
    {
      name: 'reminderSentAt',
      type: 'date',
      label: 'Rappel 10 min envoye le',
      admin: {
        readOnly: true,
        description: 'Rempli automatiquement apres envoi du rappel pre-seance.',
      },
    },
  ],
  timestamps: true,
}
