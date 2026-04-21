import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { clerkAuthStrategy } from './clerkAuthStrategy'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: () => true, // Permet l'inscription
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['firstName', 'lastName', 'email', 'role', 'isAvailableForCoaching'],
    useAsTitle: 'email',
  },
  auth: {
    strategies: [clerkAuthStrategy],
  },
  fields: [
    {
      name: 'clerkUserId',
      type: 'text',
      label: 'Clerk user ID',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'etudiant',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Etudiant', value: 'etudiant' },
        { label: 'Coach', value: 'coach' },
        { label: 'Psychologue', value: 'psy' },
      ],
      required: true,
      saveToJWT: true, // Très important : permet à getAuthenticatedDashboardUser de voir le rôle
    },
    {
      name: 'isAvailableForCoaching',
      type: 'checkbox',
      defaultValue: false,
      label: 'Disponible pour le coaching humain',
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'coach',
        description:
          "Activez ce champ quand le coach peut recevoir de nouvelles sessions d'accompagnement.",
      },
    },
    {
      name: 'coachingSpecialty',
      type: 'text',
      label: 'Specialite coaching',
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'coach',
        description: 'Exemple : stress, motivation, orientation, organisation.',
      },
    },
    {
      name: 'coachingBio',
      type: 'textarea',
      label: 'Presentation coaching',
      maxLength: 280,
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'coach',
      },
    },
    {
      name: 'magicLoginToken',
      type: 'text',
      admin: {
        hidden: true,
      },
      access: {
        create: () => false,
        read: () => false,
        update: () => false, // Reste bloqué pour les utilisateurs, mais le serveur (payload.update) passe outre avec overrideAccess: true
      },
    },
    {
      name: 'magicLoginExpiresAt',
      type: 'date',
      admin: {
        hidden: true,
      },
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
    },
  ],
  timestamps: true,
}
