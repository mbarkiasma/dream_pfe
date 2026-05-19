'use client'
import { useState } from 'react'
import type { ComponentType } from 'react'
import { Handshake, LifeBuoy, Mail } from 'lucide-react'
import { TEAM_AVATARS as DEFAULT_TEAM_AVATARS } from './contactData'
import { AppBadge, appBadgeCtaCompactClass } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'

function EmailCard({
  entry,
  copiedLabel,
  copyLabel,
}: {
  entry: { icon: string; tag: string; address: string; desc: string }
  copiedLabel: string
  copyLabel: string
}) {
  const [copied, setCopied] = useState(false)
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    mail: Mail,
    lifebuoy: LifeBuoy,
    handshake: Handshake,
  }
  const Icon = iconMap[entry.icon] ?? Mail

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.address).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card
      variant={copied ? 'gradient' : 'soft'}
      radius="md"
      padding="sm"
      onClick={handleCopy}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'all .2s',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--mindly-gradient-cta)',
          border: '1.5px solid rgb(255 255 255 / 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: copied ? 'rgb(255 255 255 / 0.78)' : 'var(--mindly-purple-muted)',
            marginBottom: 2,
          }}
        >
          {entry.tag}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: copied ? 'var(--mindly-white)' : 'var(--mindly-purple-muted)', marginBottom: 1 }}>{entry.address}</div>
        <div style={{ fontSize: 11.5, color: copied ? 'rgb(255 255 255 / 0.82)' : 'var(--mindly-purple-muted)' }}>{entry.desc}</div>
      </div>
      <div className={`${appBadgeCtaCompactClass} shrink-0`}>
        {copied ? copiedLabel : copyLabel}
      </div>
    </Card>
  )
}

function FaqItem({
  item,
  index,
  open,
  onToggle,
}: {
  item: { q: string; a: string }
  index: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--mindly-border)' }}>
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          border: 'none',
          background: 'none',
          padding: '13px 0',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--mindly-purple-muted)', letterSpacing: '0.08em', minWidth: 20 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--mindly-purple-muted)', flex: 1, lineHeight: 1.4 }}>{item.q}</span>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: open ? 'var(--mindly-primary)' : 'var(--mindly-surface-soft)',
            color: open ? 'var(--mindly-white)' : 'var(--mindly-purple-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
            flexShrink: 0,
            transition: 'background .2s, transform .3s',
            transform: open ? 'rotate(45deg)' : 'none',
          }}
        >
          +
        </div>
      </Button>
      <div
        style={{
          maxHeight: open ? 120 : 0,
          overflow: 'hidden',
          opacity: open ? 1 : 0,
          paddingLeft: 24,
          paddingBottom: open ? 12 : 0,
          fontSize: 12,
          color: 'var(--mindly-purple-muted)',
          lineHeight: 1.7,
          transition: 'max-height .35s ease, opacity .3s, padding .3s',
        }}
      >
        {item.a}
      </div>
    </div>
  )
}

type ContactInfosBlockProps = {
  emailsTitleFr?: string
  emailsTitleEn?: string
  emails?: {
    icon?: string | null
    tagFr?: string | null
    tagEn?: string | null
    address?: string | null
    descFr?: string | null
    descEn?: string | null
  }[]
  teamTextFr?: string
  teamTextEn?: string
  teamAvatars?: { initials?: string | null }[]
  faqTitleFr?: string
  faqTitleEn?: string
  faqItems?: {
    qFr?: string | null
    qEn?: string | null
    aFr?: string | null
    aEn?: string | null
  }[]
}

export default function ContactInfosBlock({
  emailsTitleFr = 'Adresses email',
  emailsTitleEn = 'Email addresses',
  emails,
  teamTextFr = 'Notre equipe lit chaque message personnellement',
  teamTextEn = 'Our team reads each message personally',
  teamAvatars,
  faqTitleFr = 'FAQ rapide',
  faqTitleEn = 'Quick FAQ',
  faqItems,
}: ContactInfosBlockProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { lang } = useLanguage()
  const isFr = lang === 'fr'
  const TEAM_AVATARS = teamAvatars?.length
    ? teamAvatars.map((avatar) => avatar.initials || '').filter(Boolean)
    : DEFAULT_TEAM_AVATARS

  const EMAILS = isFr
    ? [
        { icon: 'mail', tag: 'Email direct', address: 'contact@mindbloom.app', desc: 'Reponse sous 24h ouvrables' },
        { icon: 'lifebuoy', tag: 'Support technique', address: 'support@mindbloom.app', desc: 'Priorite haute — sous 4h' },
        { icon: 'handshake', tag: 'Partenariats', address: 'partners@mindbloom.app', desc: 'Universites & etablissements' },
      ]
    : [
        { icon: 'mail', tag: 'Direct email', address: 'contact@mindbloom.app', desc: 'Reply within 24 business hours' },
        { icon: 'lifebuoy', tag: 'Tech support', address: 'support@mindbloom.app', desc: 'High priority — within 4h' },
        { icon: 'handshake', tag: 'Partnerships', address: 'partners@mindbloom.app', desc: 'Universities & institutions' },
      ]

  const FAQ_ITEMS = isFr
    ? [
        { q: 'Comment puis-je contacter MindBloom ?', a: 'Via le formulaire, par email ou par telephone. Nous repondons rapidement.' },
        { q: 'Mes donnees sont-elles securisees ?', a: 'Oui, vos donnees sont chiffrees de bout en bout et jamais revendues.' },
        { q: 'Probleme technique : que faire ?', a: 'Ecrivez a support@mindbloom.app : priorite haute, reponse sous 4h.' },
        { q: 'Comment contacter un coach ou psy ?', a: "La plateforme vous oriente automatiquement vers l'accompagnement adapte." },
        { q: 'Delai de reponse moyen ?', a: 'Nous repondons en general sous 24h ouvrables.' },
      ]
    : [
        { q: 'How can I contact MindBloom?', a: 'Via the form, email, or phone. We reply quickly.' },
        { q: 'Is my data secure?', a: 'Yes, your data is end-to-end encrypted and never resold.' },
        { q: 'Technical issue: what should I do?', a: 'Write to support@mindbloom.app: high priority, reply within 4h.' },
        { q: 'How can I contact a coach or psychologist?', a: 'The platform automatically routes you to the right support.' },
        { q: 'Average response time?', a: 'We usually reply within 24 business hours.' },
      ]

  return (
    <div>
      <Card variant="surface" radius="lg" padding="md" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mindly-purple-muted)', marginBottom: 16 }}>
          {isFr ? emailsTitleFr : emailsTitleEn}
        </p>
        {EMAILS.map((e, i) => (
          <EmailCard
            key={i}
            entry={e}
            copyLabel={isFr ? 'Copier' : 'Copy'}
            copiedLabel={isFr ? '? Copie' : '? Copied'}
          />
        ))}
      </Card>

      <Card
        variant="soft"
        radius="lg"
        padding="md"
        style={{
          color: 'var(--mindly-purple-muted)',
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6, marginBottom: 14 }}>
          {isFr ? teamTextFr : teamTextEn}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          {TEAM_AVATARS.map((initials, i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '2.5px solid var(--mindly-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--mindly-white)',
                textShadow: '0 1px 4px rgba(31, 10, 78, 0.28)',
                marginLeft: i === 0 ? 0 : -8,
                background: ['var(--mindly-primary)', 'var(--mindly-primary)', 'var(--mindly-primary)'][i],
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          ))}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '2.5px solid var(--mindly-surface)',
              marginLeft: -8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--mindly-primary-dark)',
              background: 'var(--mindly-surface)',
              flexShrink: 0,
            }}
          >
            +5
          </div>
        </div>
        <AppBadge
          variant="outline"
          size="md"
          radius="pill"
          casing="normal"
          className="border-[var(--mindly-border-violet)] bg-[var(--mindly-surface)] text-[var(--mindly-purple-muted)]"
          dot
          dotClassName="bg-[var(--mindly-success)]"
        >
          {isFr ? 'En ligne maintenant' : 'Online now'}
        </AppBadge>
      </Card>

      <Card variant="surface" radius="lg" padding="md">
        <div style={{ marginBottom: 14 }}>
          <AppBadge variant="outline" size="sm" className="border-[var(--mindly-border-violet)] bg-[var(--mindly-surface-soft)] text-[var(--mindly-purple-muted)] tracking-[0.14em]">
            {isFr ? faqTitleFr : faqTitleEn}
          </AppBadge>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem key={i} item={item} index={i} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
        ))}
      </Card>
    </div>
  )
}

