import type { Block } from 'payload'

export const ContactHero: Block = {
  slug: 'contactHero',
  labels: {
    singular: 'Contact hero',
    plural: 'Contact hero',
  },
  admin: {
    disableBlockName: true,
    group: 'Contact',
  },
  fields: [
    {
      name: 'brand',
      type: 'text',
      label: 'Marque',
      defaultValue: 'MindBloom',
      required: true,
    },
    {
      name: 'titleFr',
      type: 'text',
      label: 'Titre FR',
      defaultValue: 'contactez notre equipe',
      required: true,
    },
    {
      name: 'titleEn',
      type: 'text',
      label: 'Titre EN',
      defaultValue: 'contact our team',
      required: true,
    },
    {
      name: 'descriptionFr',
      type: 'textarea',
      label: 'Description FR',
      defaultValue:
        'Une question, un bug, un partenariat ? Notre equipe vous repond personnellement sous 24h.',
      required: true,
    },
    {
      name: 'descriptionEn',
      type: 'textarea',
      label: 'Description EN',
      defaultValue:
        'A question, bug, or partnership request? Our team replies personally within 24h.',
      required: true,
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistiques',
      minRows: 1,
      defaultValue: [
        {
          icon: 'sparkles',
          value: '<24h',
          labelFr: 'Temps de reponse',
          labelEn: 'Response time',
        },
        {
          icon: 'shieldCheck',
          value: '100%',
          labelFr: 'Chiffrement total',
          labelEn: 'End-to-end encryption',
        },
        {
          icon: 'star',
          value: '4.9',
          labelFr: 'Satisfaction client',
          labelEn: 'Customer satisfaction',
        },
        {
          icon: 'users',
          value: '12 400+',
          labelFr: 'Etudiants aides',
          labelEn: 'Students helped',
        },
      ],
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Sparkles', value: 'sparkles' },
            { label: 'Shield check', value: 'shieldCheck' },
            { label: 'Star', value: 'star' },
            { label: 'Users', value: 'users' },
          ],
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'labelFr',
          type: 'text',
          label: 'Label FR',
          required: true,
        },
        {
          name: 'labelEn',
          type: 'text',
          label: 'Label EN',
          required: true,
        },
      ],
    },
  ],
}

