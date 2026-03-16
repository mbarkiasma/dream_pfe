import type { Block } from 'payload'

export const LandingHeroBlock: Block = {
  slug: 'landingHero',
  labels: {
    singular: 'Landing Hero',
    plural: 'Landing Heroes',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titre principal',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
    {
      name: 'primaryButton',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'href',
          type: 'text',
        },
      ],
    },
    {
      name: 'badges',
      type: 'array',
      label: 'Badges',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'mockupTitle',
      type: 'text',
      label: 'Titre mockup',
    },
    {
      name: 'mockupMessage',
      type: 'textarea',
      label: 'Message mockup',
    },
  ],
}