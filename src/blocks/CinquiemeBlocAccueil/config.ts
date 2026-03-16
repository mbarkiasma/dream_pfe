import type { Block } from 'payload'

export const CinquiemeBlocAccueil: Block = {
  slug: 'cinquiemeBlocAccueil',
  labels: {
    singular: 'Cinquième bloc accueil',
    plural: 'Cinquième bloc accueil',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Développé avec des experts en psychologie',
    },
    {
      name: 'testimonials',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 3,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          required: true,
        },
        {
          name: 'review',
          type: 'textarea',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          defaultValue: 5,
        },
      ],
      defaultValue: [
        {
          name: 'Élodie B.',
          role: 'Arr images CSG',
          review:
            'DreamRêves m’a permis de mieux comprendre mes rêves et a réduit mon stress.',
          rating: 5,
        },
        {
          name: 'Marc D.',
          role: 'Arr image',
          review:
            'Les analyses de l’IA sur mes rêves m’ont offert une nouvelle perspective sur mes émotions.',
          rating: 5,
        },
        {
          name: 'Pauline A.',
          role: 'Arr images CS6',
          review:
            'Un outil intuitif et rassurant qui m’accompagne au quotidien. Je me sens moins perdue.',
          rating: 5,
        },
      ],
    },
  ],
}