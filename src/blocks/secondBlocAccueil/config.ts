import type { Block } from 'payload'

export const SecondBlocAccueil: Block = {
  slug: 'secondBlocAccueil',
  labels: {
    singular: 'Second bloc accueil',
    plural: 'Second bloc accueil',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Une plateforme pour comprendre votre monde intérieur',
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 3,
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Moon', value: 'moon' },
            { label: 'Sparkles', value: 'sparkles' },
            { label: 'Message Circle', value: 'messageCircle' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
      defaultValue: [
        {
          icon: 'moon',
          title: 'Journal de rêves',
          description: 'Écrivez et organisez vos rêves dans un journal privé.',
        },
        {
          icon: 'sparkles',
          title: 'Analyse intelligente',
          description: 'L’IA analyse vos rêves et génère des insights personnalisés.',
        },
        {
          icon: 'messageCircle',
          title: 'Accompagnement',
          description: 'Échangez avec un psychologue ou un coach pour un soutien sur-mesure.',
        },
      ],
    },
  ],
}