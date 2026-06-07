import { redirect } from 'next/navigation'
import { FileText, Globe2, Mail, MapPin, Phone, Star } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { PsyTopbar } from '@/components/dashboard/psy/PsyTopbar'
import { PsyEditProfilePanel } from '@/components/dashboard/psy/PsyEditProfilePanel'
import { ProfileAvatar } from '@/components/dashboard/ProfileAvatar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email || ''
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

function formatMemberSince(createdAt: string | undefined, locale: string) {
  if (!createdAt) return ''
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(createdAt))
}

export default async function PsyProfilPage() {
  const { user: authUser } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.psy.profil')
  const locale = await getLocale()

  if (!authUser) redirect('/login')

  const payload = await getPayload({ config })
  const user = await payload.findByID({
    collection: 'users',
    id: authUser.id,
    depth: 1,
    overrideAccess: true,
  })

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)
  const memberSince = formatMemberSince((user as any).createdAt, locale)

  const avatarUrl =
    user.avatar && typeof user.avatar === 'object' && 'url' in user.avatar
      ? (user.avatar as { url?: string | null }).url ?? null
      : null

  const infoRows = [
    { icon: Mail, label: t('fullName'), value: displayName },
    { icon: Mail, label: t('email'), value: user.email ?? '' },
    { icon: Phone, label: t('phone'), value: (user as any).phone ?? '' },
    { icon: Star, label: t('role'), value: t('rolePsy') },
    { icon: FileText, label: t('tagline'), value: (user as any).coachTagline ?? '' },
  ]

  return (
    <div>
      <PsyTopbar title={t('title')} description={t('description')} />

      <div className="space-y-5">
        {/* Hero card */}
        <div className="rounded-[28px] border border-[var(--mindly-border)] bg-[var(--mindly-bg-soft)] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-[var(--mindly-primary)]/20">
                  <ProfileAvatar initials={initials} avatarUrl={avatarUrl} size="hero" />
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[var(--mindly-surface)]" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">
                    {displayName || t('notSet')}
                  </h2>
                  <span className="rounded-full bg-[var(--mindly-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--mindly-primary)]">
                    {t('psyBadge')}
                  </span>
                </div>

                {(user as any).coachTagline ? (
                  <p className="mt-1 text-sm text-[var(--mindly-text-soft)]">
                    {(user as any).coachTagline}
                  </p>
                ) : null}

                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[var(--mindly-text-soft)]">
                  {user.email ? (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[var(--mindly-primary)]" />
                      {user.email}
                    </span>
                  ) : null}
                  {(user as any).location ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--mindly-primary)]" />
                      {(user as any).location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
              <PsyEditProfilePanel
                initial={{
                  firstName: user.firstName ?? '',
                  lastName: user.lastName ?? '',
                  phone: (user as any).phone ?? '',
                  location: (user as any).location ?? '',
                  coachTagline: (user as any).coachTagline ?? '',
                }}
              />
              {memberSince ? (
                <p className="text-xs text-[var(--mindly-text-soft)]">
                  {t('memberSince', { date: memberSince })}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4 text-[var(--mindly-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--mindly-primary-muted)]">
              {t('sectionInfo')}
            </h3>
          </div>

          <div className="divide-y divide-[var(--mindly-border)]">
            {infoRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 text-sm text-[var(--mindly-text-soft)]">
                  <Icon className="h-4 w-4 shrink-0 text-[var(--mindly-primary)]" />
                  {label}
                </div>
                <span className="max-w-[220px] truncate text-right text-sm font-medium text-[var(--mindly-text-strong)]">
                  {value || t('notSet')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
