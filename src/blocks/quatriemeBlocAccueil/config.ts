import type { Block } from 'payload'

export const QuatriemeBlocAccueil: Block = {
  slug: 'quatriemeBlocAccueil',
  labels: {
    singular: 'Quatrième bloc accueil',
    plural: 'Quatrième bloc accueil',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Comment fonctionne la plateforme',
    },
    {
      name: 'steps',
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
            { label: 'User Plus', value: 'userPlus' },
            { label: 'Bot', value: 'bot' },
            { label: 'Book Open', value: 'bookOpen' },
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
          icon: 'userPlus',
          title: 'Créez votre compte',
          description: 'Inscrivez-vous gratuitement et complétez votre profil.',
        },
        {
          icon: 'bot',
          title: 'Réalisez l’entretien initial',
          description: 'Une IA vous pose des questions pour comprendre votre personnalité.',
        },
        {
          icon: 'bookOpen',
          title: 'Explorez vos rêves',
          description: 'Analysez, revisitez et suivez votre évolution.',
        },
      ],
    },
    {
      name: 'testimonialName',
      type: 'text',
      required: true,
      defaultValue: 'Thomas L.',
    },
    {
      name: 'testimonialRole',
      type: 'text',
      required: true,
      defaultValue: 'Utilisateur, 21 ans',
    },
    {
      name: 'testimonialText',
      type: 'textarea',
      required: true,
      defaultValue:
        'Cette plateforme m’a aidé à mieux comprendre mes rêves et à gérer mon stress, tout en me sentant en sécurité.',
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
}