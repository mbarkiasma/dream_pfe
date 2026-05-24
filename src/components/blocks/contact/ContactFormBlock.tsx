'use client'
import { useState } from 'react'
import { Bug, CircleHelp, Eye, KeyRound, Lock, Mail, MailCheck, MessageSquare, User, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLocale } from 'next-intl'
import type { ComponentType, ReactNode } from 'react'

interface FormState {
  prenom: string
  nom: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  prenom?: string
  nom?: string
  email?: string
  message?: string
}

function ProgressBar({ form, label }: { form: FormState; label: string }) {
  let score = 10
  if (form.prenom.trim()) score += 25
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) score += 25
  if (form.message.trim().length >= 10) score += 40

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--mindly-purple-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--mindly-purple-muted)', transform: 'scale(.6)', transformOrigin: 'center right' }}>{score}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: 'var(--mindly-primary-soft-3)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            borderRadius: 999,
            background: 'var(--mindly-gradient-primary)',
            transition: 'width .4s cubic-bezier(.34,1.2,.64,1)',
          }}
        />
      </div>
    </div>
  )
}

function InputField({
  label,
  id,
  icon,
  placeholder,
  type = 'text',
  value,
  error,
  hint,
  onChange,
}: {
  label: string
  id: string
  icon: ReactNode
  placeholder: string
  type?: string
  value: string
  error?: string
  hint?: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--mindly-purple-muted)', marginBottom: 6 }}>
        {label} <span style={{ color: 'var(--mindly-danger)' }}>*</span>
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 12, pointerEvents: 'none', zIndex: 1 }}>{icon}</span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            borderRadius: 12,
            border: `1.5px solid ${error ? 'var(--mindly-danger)' : focused ? 'var(--mindly-primary)' : 'var(--mindly-primary)'}`,
            padding: '11px 14px 11px 38px',
            fontSize: 13.5,
            color: 'var(--mindly-purple-muted)',
            background: 'var(--mindly-primary-soft-3)',
            outline: 'none',
            fontFamily: 'inherit',
            boxShadow: error ? '0 0 0 3px rgba(220,38,38,.1)' : focused ? '0 0 0 3px rgba(124,58,237,.13)' : 'none',
            transition: 'border-color .2s, box-shadow .2s',
          }}
        />
      </div>
      {error && <p style={{ fontSize: 11, color: 'var(--mindly-danger)', marginTop: 4, fontWeight: 600 }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--mindly-purple-muted)', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function SubjectSelector({
  value,
  onChange,
  title,
  subjects,
}: {
  value: string
  onChange: (v: string) => void
  title: string
  subjects: { val: string; icon: string; name: string; desc: string }[]
}) {
  const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    'circle-help': CircleHelp,
    bug: Bug,
    'building-2': Building2,
    'key-round': KeyRound,
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--mindly-purple-muted)', marginBottom: 6 }}>{title}</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 9 }}>
        {subjects.map(s => {
          const active = value === s.val
          return (
            <button
              key={s.val}
              type="button"
              onClick={() => onChange(s.val)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 9,
                minHeight: 58,
                height: 'auto',
                padding: '11px 13px',
                borderRadius: 13,
                fontFamily: 'inherit',
                border: `1.5px solid ${active ? 'var(--mindly-primary)' : 'var(--mindly-primary)'}`,
                background: active
                  ? 'linear-gradient(90deg, #895ef8, #a987ff)'
                  : 'var(--mindly-primary-soft-3)',
                color: active ? 'var(--mindly-white)' : 'var(--mindly-purple-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: 1.25,
                boxShadow: active ? '0 0 0 3px rgba(124,58,237,.1)' : 'none',
                transition: 'all .2s',
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>
                {(() => {
                  const Icon = iconMap[s.icon] ?? CircleHelp
                  return (
                    <Icon
                      className={`h-4 w-4 ${active ? 'text-white' : 'text-[var(--mindly-purple-icon)]'}`}
                    />
                  )
                })()}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: active ? 'var(--mindly-white)' : 'var(--mindly-purple-muted)', marginBottom: 3, lineHeight: 1.15 }}>{s.name}</span>
                <span style={{ display: 'block', fontSize: 11, lineHeight: 1.25, color: active ? 'rgb(255 255 255 / 0.82)' : 'var(--mindly-purple-muted)' }}>{s.desc}</span>
              </div>
              {active && (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'rgb(255 255 255 / 0.22)',
                    color: 'var(--mindly-white)',
                    fontSize: 9,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MessageField({
  value,
  error,
  onChange,
  label,
  placeholder,
}: {
  value: string
  error?: string
  onChange: (v: string) => void
  label: string
  placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  const pct = Math.round((value.length / 500) * 100)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mindly-purple-muted)' }}>
          {label} <span style={{ color: 'var(--mindly-danger)' }}>*</span>
        </label>
        <span style={{ fontSize: 11, fontWeight: 600, color: value.length > 450 ? 'var(--mindly-danger)' : 'var(--mindly-purple-muted)' }}>{value.length} / 500</span>
      </div>
      <textarea
        placeholder={placeholder}
        value={value}
        maxLength={500}
        rows={5}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          borderRadius: 12,
          fontFamily: 'inherit',
          border: `1.5px solid ${error ? 'var(--mindly-danger)' : focused ? 'var(--mindly-primary)' : 'var(--mindly-primary)'}`,
          padding: '11px 14px',
          fontSize: 13.5,
          color: 'var(--mindly-purple-muted)',
          background: 'var(--mindly-primary-soft-3)',
          outline: 'none',
          resize: 'vertical',
          boxShadow: error ? '0 0 0 3px rgba(220,38,38,.1)' : focused ? '0 0 0 3px rgba(124,58,237,.13)' : 'none',
          transition: 'border-color .2s, box-shadow .2s',
        }}
      />
      <div style={{ height: 2, borderRadius: 999, background: 'var(--mindly-gradient-primary)', marginTop: 5, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 999,
            background: value.length > 450 ? 'var(--mindly-danger)' : value.length > 300 ? 'var(--mindly-orange)' : 'var(--mindly-gradient-primary)',
            transition: 'width .2s, background .2s',
          }}
        />
      </div>
      {error && <p style={{ fontSize: 11, color: 'var(--mindly-danger)', marginTop: 4, fontWeight: 600 }}>{error}</p>}
    </div>
  )
}

function SuccessScreen({
  email,
  onReset,
  copy,
}: {
  email: string
  onReset: () => void
  copy: {
    successTitle: string
    successLine1: string
    successLine2: string
    confirm: string
    read: string
    reply: string
    confirmDesc: string
    readDesc: string
    replyDesc: string
    newMessage: string
  }
}) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <svg viewBox='0 0 72 72' fill='none' style={{ width: 72, height: 72, margin: '0 auto 18px', display: 'block' }}>
        <circle cx='36' cy='36' r='25' stroke='var(--mindly-primary)' strokeWidth='3' fill='var(--mindly-bg-strong)' />
        <circle cx='36' cy='36' r='25' stroke='var(--mindly-primary)' strokeWidth='3' fill='none' />
        <polyline points='24,37 32,45 48,28' stroke='var(--mindly-primary)' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      </svg>
      <h3 style={{ fontSize: 21, fontWeight: 800, color: 'var(--mindly-purple-muted)', marginBottom: 8 }}>{copy.successTitle}</h3>
      <p style={{ fontSize: 13.5, color: 'var(--mindly-purple-muted)', lineHeight: 1.7, marginBottom: 20 }}>
        {copy.successLine1} <strong style={{ color: 'var(--mindly-purple-muted)' }}>{email}</strong>
        <br />
        {copy.successLine2}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 22 }}>
        {[
          { Icon: MailCheck, title: copy.confirm, desc: copy.confirmDesc },
          { Icon: Eye, title: copy.read, desc: copy.readDesc },
          { Icon: MessageSquare, title: copy.reply, desc: copy.replyDesc },
        ].map((step, i) => (
          <Card key={i} variant="surface" radius="md" padding="sm" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: 6 }}><step.Icon className="h-4 w-4 text-[var(--mindly-purple-icon)]" /></div>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--mindly-purple-muted)', marginBottom: 3 }}>{step.title}</div>
            <div style={{ fontSize: 11, color: 'var(--mindly-purple-muted)', lineHeight: 1.5 }}>{step.desc}</div>
          </Card>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReset}
        style={{
          border: '1.5px solid var(--mindly-border)',
          background: 'var(--mindly-surface)',
          borderRadius: 12,
          padding: '10px 22px',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--mindly-purple-muted)',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ← {copy.newMessage}
      </Button>
    </div>
  )
}

export default function ContactFormBlock() {
  const isFr = useLocale() !== 'en'
  const [form, setForm] = useState<FormState>({ prenom: '', nom: '', email: '', subject: 'general', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const copy = isFr
    ? {
        progress: 'Progression du formulaire',
        required: 'Champ requis',
        invalidEmail: 'Adresse email invalide',
        shortMessage: 'Message trop court (min. 10 caracteres)',
        firstName: 'Prenom',
        lastName: 'Nom',
        yourFirstName: 'Votre prenom',
        yourLastName: 'Votre nom',
        emailLabel: 'Email',
        emailHint: 'Nous vous repondrons a cette adresse',
        subject: 'Sujet',
        message: 'Message',
        messagePlaceholder: 'Decrivez votre demande avec le plus de details possible…',
        privacy: 'Votre message est confidentiel. Vos donnees ne sont utilisees que pour vous repondre et ne sont jamais partagees avec des tiers.',
        submitError: "Impossible d'envoyer le message. Veuillez reessayer.",
        successTitle: 'Message envoye !',
        successLine1: 'Merci ! Notre equipe vous repondra a',
        successLine2: 'sous 24 heures ouvrables.',
        confirm: 'Confirmation',
        read: 'Lecture',
        reply: 'Reponse',
        confirmDesc: 'Email de confirmation envoye',
        readDesc: 'Message lu personnellement',
        replyDesc: 'Sous 24h ouvrables',
        newMessage: 'Nouveau message',
      }
    : {
        progress: 'Form progress',
        required: 'Required field',
        invalidEmail: 'Invalid email address',
        shortMessage: 'Message too short (min. 10 characters)',
        firstName: 'First name',
        lastName: 'Last name',
        yourFirstName: 'Your first name',
        yourLastName: 'Your last name',
        emailLabel: 'Email',
        emailHint: 'We will reply to this address',
        subject: 'Subject',
        message: 'Message',
        messagePlaceholder: 'Describe your request with as much detail as possible…',
        privacy: 'Your message is confidential. Your data is only used to reply and is never shared with third parties.',
        submitError: 'Unable to send the message. Please try again.',
        successTitle: 'Message sent!',
        successLine1: 'Thanks! Our team will reply to',
        successLine2: 'within 24 business hours.',
        confirm: 'Confirmation',
        read: 'Read',
        reply: 'Reply',
        confirmDesc: 'Confirmation email sent',
        readDesc: 'Message personally reviewed',
        replyDesc: 'Within 24 business hours',
        newMessage: 'New message',
      }

  const subjects = isFr
    ? [
        { val: 'general', icon: 'circle-help', name: 'Question generale', desc: 'Informations, fonctionnalites' },
        { val: 'bug', icon: 'bug', name: 'Bug technique', desc: 'Erreur, dysfonctionnement' },
        { val: 'partner', icon: 'building-2', name: 'Partenariat', desc: 'Universite, institution' },
        { val: 'access', icon: 'key-round', name: "Probleme d'acces", desc: 'Connexion, compte bloque' },
      ]
    : [
        { val: 'general', icon: 'circle-help', name: 'General question', desc: 'Information, features' },
        { val: 'bug', icon: 'bug', name: 'Technical bug', desc: 'Error, malfunction' },
        { val: 'partner', icon: 'building-2', name: 'Partnership', desc: 'University, institution' },
        { val: 'access', icon: 'key-round', name: 'Access issue', desc: 'Login, locked account' },
      ]

  const set = (key: keyof FormState) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.prenom.trim()) e.prenom = copy.required
    if (!form.nom.trim()) e.nom = copy.required
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = copy.invalidEmail
    if (form.message.trim().length < 10) e.message = copy.shortMessage
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || copy.submitError)
      }

      setLoading(false)
      setSubmitted(true)
    } catch (error) {
      setLoading(false)
      setSubmitError(error instanceof Error ? error.message : copy.submitError)
    }
  }

  const handleReset = () => {
    setForm({ prenom: '', nom: '', email: '', subject: 'general', message: '' })
    setErrors({})
    setSubmitError(null)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <Card variant="surface" radius="lg" padding="md">
        <SuccessScreen email={form.email} onReset={handleReset} copy={copy} />
      </Card>
    )
  }

  return (
    <Card variant="surface" radius="lg" padding="md">
      <ProgressBar form={form} label={copy.progress} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <InputField label={copy.firstName} id='prenom' icon={<User className="h-4 w-4 text-[var(--mindly-purple-icon)]" />} placeholder={copy.yourFirstName} value={form.prenom} error={errors.prenom} onChange={set('prenom')} />
        <InputField label={copy.lastName} id='nom' icon={<User className="h-4 w-4 text-[var(--mindly-purple-icon)]" />} placeholder={copy.yourLastName} value={form.nom} error={errors.nom} onChange={set('nom')} />
      </div>

      <InputField
        label={copy.emailLabel}
        id='email'
        icon={<Mail className="h-4 w-4 text-[var(--mindly-purple-icon)]" />}
        type='email'
        placeholder='your@email.com'
        value={form.email}
        error={errors.email}
        hint={copy.emailHint}
        onChange={set('email')}
      />

      <SubjectSelector value={form.subject} onChange={set('subject')} title={copy.subject} subjects={subjects} />

      <MessageField value={form.message} error={errors.message} onChange={set('message')} label={copy.message} placeholder={copy.messagePlaceholder} />

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          background: 'var(--mindly-lavender-150)',
          border: '1px solid var(--mindly-border)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 16,
        }}
      >
        <span style={{ flexShrink: 0, marginTop: 1 }}><Lock className="h-4 w-4 text-[var(--mindly-purple-icon)]" /></span>
        <p style={{ fontSize: 12, color: 'var(--mindly-purple-muted)', lineHeight: 1.6 }}>
          {copy.privacy}
        </p>
      </div>

      {submitError && (
        <p style={{ color: 'var(--mindly-danger)', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
          {submitError}
        </p>
      )}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
        className={loading ? 'from-[var(--mindly-primary-light)] to-[var(--mindly-primary)] opacity-80' : ''}
      >
        {loading ? 'Envoi en cours…' : 'Envoyer le message'}
      </Button>
    </Card>
  )
}

