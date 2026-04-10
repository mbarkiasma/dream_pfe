import type { CollectionConfig } from 'payload'

export const AnalysePersonnalite: CollectionConfig = {
  slug: 'analyse-personnalite',
  labels: {
    singular: 'Analyse de Personnalite',
    plural: 'Analyses de Personnalite',
  },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'user', 'date', 'niveauConfiance'],
    group: 'Entretiens',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false

      if (user.role === 'coach' || user.role === 'psy') {
        return true
      }

      return {
        user: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      admin: {
        description: 'Reference unique de l analyse',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'niveauConfiance',
      type: 'select',
      options: [
        { label: 'Eleve', value: 'eleve' },
        { label: 'Moyen', value: 'moyen' },
        { label: 'Modere', value: 'modere' },
      ],
      defaultValue: 'moyen',
    },
    {
      name: 'sessionId',
      type: 'text',
    },
    {
      name: 'conversation',
      type: 'array',
      label: 'Conversation',
      admin: {
        description: 'Historique complet de la conversation',
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Assistant IA', value: 'ai' },
            { label: 'Etudiant', value: 'human' },
          ],
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'time',
          type: 'text',
        },
        {
          name: 'emotion',
          type: 'select',
          options: [
            { label: 'Joie', value: 'joie' },
            { label: 'Anxiete', value: 'anxiete' },
            { label: 'Neutre', value: 'neutre' },
            { label: 'Frustration', value: 'frustration' },
            { label: 'Hesitation', value: 'hesitation' },
            { label: 'Confiance', value: 'confiance' },
            { label: 'Tristesse', value: 'tristesse' },
            { label: 'Enthousiasme', value: 'enthousiasme' },
          ],
        },
        {
          name: 'emotionScore',
          type: 'number',
          min: -1,
          max: 1,
        },
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Texte', value: 'text' },
            { label: 'Voix', value: 'voice' },
          ],
          defaultValue: 'text',
        },
      ],
    },
    {
      name: 'traits',
      type: 'array',
      label: 'Traits Big Five',
      minRows: 5,
      maxRows: 5,
      fields: [
        {
          name: 'name',
          type: 'select',
          required: true,
          options: [
            { label: 'Ouverture', value: 'Ouverture' },
            { label: 'Conscienciosite', value: 'Conscienciosite' },
            { label: 'Extraversion', value: 'Extraversion' },
            { label: 'Agreabilite', value: 'Agreabilite' },
            { label: 'Neuroticisme', value: 'Neuroticisme' },
          ],
        },
        {
          name: 'score',
          type: 'number',
          required: true,
          min: 1,
          max: 10,
        },
        {
          name: 'analysis',
          type: 'textarea',
        },
        {
          name: 'interpretation',
          type: 'textarea',
        },
        {
          name: 'confidence',
          type: 'select',
          options: [
            { label: 'Eleve', value: 'eleve' },
            { label: 'Moyen', value: 'moyen' },
            { label: 'Faible', value: 'faible' },
          ],
          defaultValue: 'moyen',
        },
        {
          name: 'confidenceReason',
          type: 'text',
        },
        {
          name: 'observedIndicators',
          type: 'array',
          label: 'Indicateurs observes',
          maxRows: 5,
          fields: [
            {
              name: 'indicator',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'profilEmotionnel',
      type: 'group',
      label: 'Profil emotionnel',
      fields: [
        {
          name: 'dominantEmotion',
          type: 'text',
        },
        {
          name: 'emotionalStability',
          type: 'number',
          min: 1,
          max: 10,
        },
        {
          name: 'emotionalSummary',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'overview',
      type: 'textarea',
      label: 'Vue d ensemble',
    },
    {
      name: 'forcesDominantes',
      type: 'textarea',
      label: 'Forces dominantes',
    },
    {
      name: 'pointsVigilance',
      type: 'textarea',
      label: 'Points de vigilance',
    },
    {
      name: 'styleRelationnel',
      type: 'textarea',
      label: 'Style relationnel',
    },
    {
      name: 'recommandations',
      type: 'array',
      label: 'Recommandations',
      maxRows: 5,
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'conclusion',
      type: 'textarea',
      label: 'Conclusion generale',
    },
  ],
}
