import type { Access, GlobalConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin } from '@/access/roles'

const adminOnly: Access = ({ req: { user } }) => isAdmin(user as User | null)

export const AccountRetentionSettings: GlobalConfig = {
  slug: 'account-retention-settings',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    description:
      'Paramètres de rétention des comptes. Le cron lit ces paramètres pour désactiver ou supprimer les comptes expirés.',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Activer le traitement des comptes expirés',
      defaultValue: true,
    },
    {
      name: 'action',
      type: 'select',
      label: 'Action après expiration',
      defaultValue: 'deactivate',
      options: [
        { label: 'Désactiver', value: 'deactivate' },
        { label: 'Supprimer définitivement', value: 'delete' },
      ],
      required: true,
    },
    {
      name: 'targetRoles',
      type: 'select',
      label: 'Rôles concernés',
      hasMany: true,
      options: [
        { label: 'Étudiant', value: 'etudiant' },
        { label: 'Coach', value: 'coach' },
        { label: 'Psychologue', value: 'psy' },
        { label: 'Administrateur', value: 'admin' },
      ],
      defaultValue: ['etudiant'],
      required: true,
    },
  ],
}
