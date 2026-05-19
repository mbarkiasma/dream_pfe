import type { Block } from 'payload'

export const ContactContent: Block = {
  slug: 'contactContent',
  labels: {
    singular: 'Contact infos et formulaire',
    plural: 'Contact infos et formulaire',
  },
  admin: {
    disableBlockName: true,
    group: 'Contact',
  },
  fields: [
    {
      name: 'emailsTitleFr',
      type: 'text',
      label: 'Titre emails FR',
      defaultValue: 'Adresses email',
      required: true,
    },
    {
      name: 'emailsTitleEn',
      type: 'text',
      label: 'Titre emails EN',
      defaultValue: 'Email addresses',
      required: true,
    },
    {
      name: 'emails',
      type: 'array',
      label: 'Emails',
      minRows: 1,
      defaultValue: [
        {
          icon: 'mail',
          tagFr: 'Email direct',
          tagEn: 'Direct email',
          address: 'contact@mindbloom.app',
          descFr: 'Reponse sous 24h ouvrables',
          descEn: 'Reply within 24 business hours',
        },
        {
          icon: 'lifebuoy',
          tagFr: 'Support technique',
          tagEn: 'Tech support',
          address: 'support@mindbloom.app',
          descFr: 'Priorite haute - sous 4h',
          descEn: 'High priority - within 4h',
        },
        {
          icon: 'handshake',
          tagFr: 'Partenariats',
          tagEn: 'Partnerships',
          address: 'partners@mindbloom.app',
          descFr: 'Universites & etablissements',
          descEn: 'Universities & institutions',
        },
      ],
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          options: [
            { label: 'Mail', value: 'mail' },
            { label: 'Support', value: 'lifebuoy' },
            { label: 'Partenariat', value: 'handshake' },
          ],
        },
        { name: 'tagFr', type: 'text', label: 'Tag FR', required: true },
        { name: 'tagEn', type: 'text', label: 'Tag EN', required: true },
        { name: 'address', type: 'text', label: 'Adresse', required: true },
        { name: 'descFr', type: 'text', label: 'Description FR', required: true },
        { name: 'descEn', type: 'text', label: 'Description EN', required: true },
      ],
    },
    {
      name: 'teamTextFr',
      type: 'text',
      label: 'Texte equipe FR',
      defaultValue: 'Notre equipe lit chaque message personnellement',
      required: true,
    },
    {
      name: 'teamTextEn',
      type: 'text',
      label: 'Texte equipe EN',
      defaultValue: 'Our team reads each message personally',
      required: true,
    },
    {
      name: 'teamAvatars',
      type: 'array',
      label: 'Initiales equipe',
      minRows: 1,
      defaultValue: [{ initials: 'SA' }, { initials: 'ML' }, { initials: 'KD' }],
      fields: [{ name: 'initials', type: 'text', label: 'Initiales', required: true }],
    },
    {
      name: 'faqTitleFr',
      type: 'text',
      label: 'Titre FAQ FR',
      defaultValue: 'FAQ rapide',
      required: true,
    },
    {
      name: 'faqTitleEn',
      type: 'text',
      label: 'Titre FAQ EN',
      defaultValue: 'Quick FAQ',
      required: true,
    },
    {
      name: 'faqItems',
      type: 'array',
      label: 'FAQ',
      minRows: 1,
      defaultValue: [
        {
          qFr: 'Comment puis-je contacter MindBloom ?',
          qEn: 'How can I contact MindBloom?',
          aFr: 'Via le formulaire, par email ou par telephone. Nous repondons rapidement.',
          aEn: 'Via the form, email, or phone. We reply quickly.',
        },
        {
          qFr: 'Mes donnees sont-elles securisees ?',
          qEn: 'Is my data secure?',
          aFr: 'Oui, vos donnees sont chiffrees de bout en bout et jamais revendues.',
          aEn: 'Yes, your data is end-to-end encrypted and never resold.',
        },
      ],
      fields: [
        { name: 'qFr', type: 'text', label: 'Question FR', required: true },
        { name: 'qEn', type: 'text', label: 'Question EN', required: true },
        { name: 'aFr', type: 'textarea', label: 'Reponse FR', required: true },
        { name: 'aEn', type: 'textarea', label: 'Reponse EN', required: true },
      ],
    },
  ],
}

