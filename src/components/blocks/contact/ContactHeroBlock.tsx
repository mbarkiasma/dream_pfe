'use client'

import { ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { AppBadge } from '@/components/ui/badge'
import { TextAnimate } from '@/components/ui/text-animate'

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

type MessageStat = {
  icon?: string | null
  value?: string | null
  label?: string | null
}

type CmsStat = NonNullable<ContactHeroBlockProps['stats']>[number]

export default function ContactHeroBlock({
  brand = 'MindBloom',
  titleFr,
  titleEn,
  descriptionFr,
  descriptionEn,
  stats,
}: ContactHeroBlockProps) {
  const locale = useLocale()
  const isFr = locale === 'fr'
  const t = useTranslations('contactPage.hero')

  const iconMap = {
    sparkles: Sparkles,
    shieldCheck: ShieldCheck,
    star: Star,
    users: Users,
  }

  const defaultStats = t.raw('stats') as MessageStat[]
  const isMessageStat = (stat: CmsStat | MessageStat): stat is MessageStat =>
    'label' in stat

  const getStatLabel = (stat: CmsStat | MessageStat) => {
    if (isMessageStat(stat)) return stat.label || ''
    return locale === 'fr' ? stat.labelFr || '' : stat.labelEn || ''
  }

  const title = locale === 'fr' ? titleFr || t('title') : titleEn || t('title')
  const description = locale === 'fr' ? descriptionFr || t('description') : descriptionEn || t('description')

  const STATS = (
    stats?.length
      ? stats
      : defaultStats
  ).map((stat) => ({
    Icon: iconMap[(stat.icon || 'sparkles') as keyof typeof iconMap] ?? Sparkles,
    value: stat.value || '',
    label: getStatLabel(stat),
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
          {isFr ? titleFr || t('title') : titleEn || t('title')}
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
        {isFr ? descriptionFr || t('description') : descriptionEn || t('description')}
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

