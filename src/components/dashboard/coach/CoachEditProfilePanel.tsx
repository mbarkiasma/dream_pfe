'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Fields = {
  firstName: string
  lastName: string
  phone: string
  location: string
  coachTagline: string
  coachingSpecialty: string
  coachingBio: string
}

export function CoachEditProfilePanel({ initial }: { initial: Fields }) {
  const t = useTranslations('dashboard.coach.profil')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Fields>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof Fields, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/profile/coach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t('errorSave')); return }
      setOpen(false)
      router.refresh()
    } catch {
      setError(t('errorSave'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--mindly-primary)] px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-90"
      >
        <Pencil className="h-3.5 w-3.5" />
        {t('edit')}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <aside className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto bg-[var(--mindly-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--mindly-border)] p-5">
              <h2 className="text-base font-bold text-[var(--mindly-text-strong)]">{t('editTitle')}</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-[var(--mindly-bg-soft)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              {([
                { key: 'firstName', label: t('firstName') },
                { key: 'lastName', label: t('lastName') },
                { key: 'phone', label: t('phone') },
                { key: 'location', label: t('location') },
                { key: 'coachTagline', label: t('tagline') },
                { key: 'coachingSpecialty', label: t('specialty') },
              ] as { key: keyof Fields; label: string }[]).map(({ key, label }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[var(--mindly-primary-muted)]">
                    {label}
                  </label>
                  <input
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full rounded-xl border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] px-3 py-2 text-sm text-[var(--mindly-text-strong)] outline-none focus:ring-2 focus:ring-[var(--mindly-primary)]/30"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[var(--mindly-primary-muted)]">
                  {t('bio')}
                </label>
                <textarea
                  value={form.coachingBio}
                  onChange={(e) => set('coachingBio', e.target.value)}
                  rows={4}
                  maxLength={280}
                  className="w-full rounded-xl border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] px-3 py-2 text-sm text-[var(--mindly-text-strong)] outline-none focus:ring-2 focus:ring-[var(--mindly-primary)]/30"
                />
              </div>

              {error ? <p className="text-xs text-red-500">{error}</p> : null}
            </div>

            <div className="border-t border-[var(--mindly-border)] p-5">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--mindly-primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('save')}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}
