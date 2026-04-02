// src/blocks/RoleCards/config.ts
import type { Block } from 'payload'

export const RoleCards: Block = {
  slug: 'roleCards',
  labels: {
    singular: 'Role Cards',
    plural: 'Role Cards',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Choisissez votre profil',
    },
    {
      name: 'subtitle',
      type: 'textarea',
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
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
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}