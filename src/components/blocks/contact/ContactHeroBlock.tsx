'use client'

import { ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import { AppBadge } from '@/components/ui/badge'
import { TextAnimate } from '@/components/ui/text-animate'
import { useLanguage } from '@/contexts/LanguageContext'

type ContactHeroBlockProps = {
  brand?: string
  titleFr?: string
  titleEn?: string
  descriptionFr?: string
  descriptionEn?: string
  stats?: {
    icon?: string | null
    value?: string | null
    labelFr?: string | null
    labelEn?: string | null
  }[]
}

export default function ContactHeroBlock({
  brand = 'MindBloom',
  titleFr = 'contactez notre equipe',
  titleEn = 'contact our team',
  descriptionFr = 'Une question, un bug, un partenariat ? Notre equipe vous repond personnellement sous 24h.',
  descriptionEn = 'A question, bug, or partnership request? Our team replies personally within 24h.',
  stats,
}: ContactHeroBlockProps) {
  const { lang } = useLanguage()
  const isFr = lang === 'fr'

  const iconMap = {
    sparkles: Sparkles,
    shieldCheck: ShieldCheck,
    star: Star,
    users: Users,
  }

  const STATS = (
    stats?.length
      ? stats
      : [
          { icon: 'sparkles', value: '<24h', labelFr: 'Temps de reponse', labelEn: 'Response time' },
          { icon: 'shieldCheck', value: '100%', labelFr: 'Chiffrement total', labelEn: 'End-to-end encryption' },
          { icon: 'star', value: '4.9', labelFr: 'Satisfaction client', labelEn: 'Customer satisfaction' },
          { icon: 'users', value: '12 400+', labelFr: 'Etudiants aides', labelEn: 'Students helped' },
        ]
  ).map((stat) => ({
    Icon: iconMap[(stat.icon || 'sparkles') as keyof typeof iconMap] ?? Sparkles,
    value: stat.value || '',
    label: isFr ? stat.labelFr || '' : stat.labelEn || '',
  }))

  return (
    <div style={{ textAlign: 'center', marginBottom: 34 }}>
      <h1 className="mx-auto mb-3.5 font-serif text-[34px] leading-[1.08] tracking-[-0.012em] text-[var(--mindly-text)] sm:text-[40px] lg:text-[46px]">
        <TextAnimate
          as="span"
          animation="slideUp"
          by="word"
          className="inline bg-gradient-to-r from-[var(--mindly-primary)] to-[var(--mindly-primary-light)] bg-clip-text text-transparent"
        >
          {brand}
        </TextAnimate>{' '}
        <TextAnimate as="span" animation="slideUp" by="word" className="inline">
          {isFr ? titleFr : titleEn}
        </TextAnimate>
      </h1>

      <p
        style={{
          fontSize: 15.5,
          color: 'var(--mindly-purple-muted)',
          maxWidth: 530,
          margin: '0 auto 22px',
          lineHeight: 1.75,
        }}
      >
        {isFr ? descriptionFr : descriptionEn}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 10,
          maxWidth: 820,
          margin: '0 auto',
        }}
      >
        {STATS.map((s, i) => (
          <AppBadge
            key={i}
            icon={<s.Icon size={14} />}
            className="min-w-[205px] justify-center gap-2"
            style={{ minWidth: i === 3 ? 205 : 0 }}
          >
            {s.value} {s.label}
          </AppBadge>
        ))}
      </div>
    </div>
  )
}

