export interface EmailEntry {
  icon: string
  tag: string
  address: string
  desc: string
}

export interface FaqEntry {
  q: string
  a: string
}

export interface SubjectOption {
  val: string
  icon: string
  name: string
  desc: string
}

export const EMAILS: EmailEntry[] = [
  {
    icon: 'mail',
    tag: 'Email direct',
    address: 'contact@mindbloom.app',
    desc: 'Réponse sous 24h ouvrables',
  },
  {
    icon: 'lifebuoy',
    tag: 'Support technique',
    address: 'support@mindbloom.app',
    desc: 'Priorité haute — sous 4h',
  },
  {
    icon: 'handshake',
    tag: 'Partenariats',
    address: 'partners@mindbloom.app',
    desc: 'Universités & établissements',
  },
]

export const TEAM_AVATARS = ['SA', 'ML', 'KD']

export const FAQ_ITEMS: FaqEntry[] = [
  {
    q: 'Comment puis-je contacter MindBloom ?',
    a: 'Via le formulaire, par email ou par téléphone. Nous répondons dans les plus brefs délais.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Oui, toutes vos données sont chiffrées de bout en bout et ne sont jamais revendues.',
  },
  {
    q: 'Problème technique : que faire ?',
    a: 'Écrivez à support@mindbloom.app : priorité haute, réponse sous 4h maximum.',
  },
  {
    q: 'Comment contacter un coach ou psy ?',
    a: "La plateforme vous oriente automatiquement selon votre situation vers l'accompagnement adapté.",
  },
  {
    q: 'Délai de réponse moyen ?',
    a: 'Nous répondons généralement sous 24h ouvrables pour toutes les demandes.',
  },
]

export const SUBJECTS: SubjectOption[] = [
  {
    val: 'general',
    icon: 'circle-help',
    name: 'Question générale',
    desc: 'Informations, fonctionnalités',
  },
  {
    val: 'bug',
    icon: 'bug',
    name: 'Bug technique',
    desc: 'Erreur, dysfonctionnement',
  },
  {
    val: 'partner',
    icon: 'building-2',
    name: 'Partenariat',
    desc: 'Université, institution',
  },
  {
    val: 'access',
    icon: 'key-round',
    name: "Problème d'accès",
    desc: 'Connexion, compte bloqué',
  },
]

export const CONTACT_STYLES = `
  .contact-page {
    font-family: 'Plus Jakarta Sans', 'Poppins', 'Segoe UI', sans-serif;
    color: var(--mindly-primary);
  }

  .contact-grid {
    display: grid;
    grid-template-columns: minmax(300px, .9fr) minmax(360px, 1.35fr);
    gap: 18px;
    align-items: start;
  }

  @media (max-width: 960px) {
    .contact-grid {
      grid-template-columns: 1fr;
    }
  }
`

