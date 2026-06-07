import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { BookOpen, Download, Eye, FileText, GraduationCap, Mail, User, UserRound } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { ProfileAvatar } from '@/components/dashboard/ProfileAvatar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getDisplayName(
  user: { firstName?: string | null; lastName?: string | null; email?: string | null } | null | undefined,
  fallback: string,
) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email || fallback
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default async function StudentProfilePage() {
  const payload = await getPayload({ config })
  const { user: authUser } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.profile')
  const locale = await getLocale()

  const user = authUser
    ? await payload.findByID({ collection: 'users', id: authUser.id, depth: 1, overrideAccess: true })
    : null

  const notProvided = t('notProvided')
  const displayName = getDisplayName(user, notProvided)
  const initials = getInitials(displayName)

  const avatarUrl =
    user?.avatar && typeof user.avatar === 'object' && 'url' in user.avatar
      ? (user.avatar as { url?: string | null }).url ?? null
      : null

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const analyses = user
    ? await payload.find({
        collection: 'analyse-personnalite',
        where: { user: { equals: user.id } },
        sort: '-date',
        limit: 1,
        overrideAccess: true,
      })
    : { docs: [] }

  const activeReport = analyses.docs[0]

  const infoRows = [
    { icon: UserRound, label: t('fullName'), value: displayName },
    { icon: Mail, label: t('email'), value: user?.email ?? notProvided },
    { icon: BookOpen, label: t('branch'), value: (user as any)?.studentBranch ?? notProvided },
    { icon: GraduationCap, label: t('level'), value: (user as any)?.studentLevel ?? notProvided },
  ]

  return (
    <div>
      <StudentTopbar title={t('topbar.title')} description={t('topbar.description')} />

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
                    {displayName || notProvided}
                  </h2>
                  <span className="rounded-full bg-[var(--mindly-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--mindly-primary)]">
                    {t('profileLabel')}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[var(--mindly-text-soft)]">
                  {user?.email ? (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[var(--mindly-primary)]" />
                      {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mindly-border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--mindly-text-strong)] dark:bg-white/10">
                {t('activeAccount')}
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--mindly-primary)]" />
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
                  {value || notProvided}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mon rapport en PDF */}
        <div className="mx-auto max-w-xl rounded-[28px] border border-[var(--mindly-border)] bg-[var(--mindly-surface)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--mindly-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--mindly-primary-muted)]">
              {t('reportCard')}
            </h3>
          </div>

          {activeReport ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--mindly-text-strong)]">
                  {activeReport.reference}
                </p>
                <p className="mt-0.5 text-xs text-[var(--mindly-text-soft)]">
                  {t('generatedOn', { date: formatDate(activeReport.date) })}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/dashboard/student/analyses/${activeReport.id}/pdf`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mindly-border)] bg-white px-4 py-1.5 text-xs font-semibold text-[var(--mindly-text-strong)] transition hover:bg-[var(--mindly-bg-soft)] dark:bg-white/10 dark:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('viewReport')}
                </Link>

                <Link
                  href={`/dashboard/student/analyses/${activeReport.id}/pdf`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mindly-primary)] px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t('downloadPdf')}
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--mindly-text-soft)]">{t('reportEmpty')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
