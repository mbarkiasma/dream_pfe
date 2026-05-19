import type { Block } from 'payload'

export const AboutTeam: Block = {
  slug: 'aboutTeam',
  labels: {
    singular: 'A propos equipe',
    plural: 'A propos equipe',
  },
  admin: {
    disableBlockName: true,
    group: 'A propos',
  },
  fields: [],
}
