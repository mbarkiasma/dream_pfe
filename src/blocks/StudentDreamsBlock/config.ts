import type { Block } from 'payload'

export const StudentDreamsBlock: Block = {
  slug: 'studentDreamsBlock',
  interfaceName: 'StudentDreamsBlock',
  labels: {
    singular: 'Student Dreams',
    plural: 'Student Dreams Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      defaultValue: 'Mes rêves',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      defaultValue: 'Consulte et organise les rêves enregistrés dans votre journal.',
    },
  ],
}