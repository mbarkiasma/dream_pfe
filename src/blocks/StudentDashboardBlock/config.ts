import type { Block } from 'payload'

export const StudentDashboardBlock: Block = {
  slug: 'studentDashboardBlock',
  interfaceName: 'StudentDashboardBlock',
  labels: {
    singular: 'Student Dashboard',
    plural: 'Student Dashboard Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      defaultValue: 'Dashboard Étudiant',
    },
    {
      name: 'welcomeMessage',
      type: 'text',
      label: 'Message de bienvenue',
      defaultValue: 'Bienvenue dans votre espace personnel de suivi.',
    },
  ],
}