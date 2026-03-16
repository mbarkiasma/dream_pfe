import type { Block } from 'payload'

export const TroisiemeBlocAccueil: Block = {
  slug: 'troisiemeBlocAccueil',
  labels: {
    singular: 'Troisième bloc accueil',
    plural: 'Troisième bloc accueil',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Un système intelligent pour votre bien-être mental',
    },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Brain', value: 'brain' },
            { label: 'Bot', value: 'bot' },
            { label: 'Message Circle', value: 'messageCircle' },
            { label: 'Clock', value: 'clock' },
            { label: 'Heart Handshake', value: 'heartHandshake' },
            { label: 'Video', value: 'video' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { icon: 'brain', label: 'Psychologie' },
        { icon: 'bot', label: 'AI Research' },
        { icon: 'messageCircle', label: 'Interpreting Dreams' },
        { icon: 'clock', label: 'Suivi émotionnel' },
        { icon: 'heartHandshake', label: 'Accompagnement professionnel' },
        { icon: 'video', label: 'Visualisation des rêves en vidéo' },
      ],
    },
  ],
}