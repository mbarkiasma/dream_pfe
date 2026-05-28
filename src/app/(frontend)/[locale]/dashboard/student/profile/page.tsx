import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Mail, UserRound } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

function getDisplayName(
  user:
    | { firstName?: string | null; lastName?: string | null; email?: string | null }
    | null
    | undefined,
  fallback: string,
) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()

  return fullName || user?.email || fallback
}

export default async function StudentProfilePage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.profile')
  const locale = await getLocale()

  const notProvided = t('notProvided')
  const displayName = getDisplayName(user, notProvided)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  function formatAnalysisDate(value: string) {
    return new Date(value).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const analyses = user
    ? await payload.find({
        collection: 'analyse-personnalite',
        user,
        overrideAccess: false,
        where: {
          user: {
            equals: user.id,
          },
        },
        sort: '-date',
        limit: 1,
      })
    : { docs: [] }
  const activeReport = analyses.docs[0]

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <div className="student-profile-grid">
        <div className="student-profile-main">
          <Card className="student-profile-card overflow-hidden border-white/80 shadow-dream-card-lg dark:border-white/10">
            <CardHeader className="student-profile-card-header border-b border-border/70 bg-white/80 backdrop-blur dark:bg-white/[0.04]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--mindly-primary)] text-lg font-black text-white shadow-dream-card ring-4 ring-violet-100/70 dark:ring-white/10">
                    {initials || <UserRound className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="student-profile-label">{t('profileLabel')}</p>
                    <CardTitle className="mt-1 text-xl font-black text-dream-heading dark:text-white">
                      {displayName}
                    </CardTitle>
                    <p className="mt-1 flex items-center gap-2 text-sm text-dream-muted dark:text-white/65">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="break-all">{user?.email || notProvided}</span>
                    </p>
                  </div>
                </div>

                <span className="student-profile-badge self-start md:self-center">
                  {t('activeAccount')}
                </span>
              </div>
            </CardHeader>

            <CardContent className="student-profile-card-content">
              <div className="student-profile-stack">
                <div className="student-profile-info-grid">
                  <div className="student-profile-info-box">
                    <p className="student-profile-label">{t('fullName')}</p>
                    <p className="student-profile-value">{displayName}</p>
                  </div>

                  <div className="student-profile-info-box">
                    <p className="student-profile-label">{t('email')}</p>
                    <p className="student-profile-value">{user?.email || notProvided}</p>
                  </div>

                  <div className="student-profile-info-box">
                    <p className="student-profile-label">{t('branch')}</p>
                    <p className="student-profile-value">
                      {user?.studentBranch || notProvided}
                    </p>
                  </div>

                  <div className="student-profile-info-box">
                    <p className="student-profile-label">{t('level')}</p>
                    <p className="student-profile-value">{user?.studentLevel || notProvided}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="student-profile-card">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title">{t('reportCard')}</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content">
              <div className="student-profile-stack">
                {activeReport ? (
                  <div className="student-profile-analysis-row">
                    <div>
                      <p className="student-profile-analysis-title">{activeReport.reference}</p>
                      <p className="student-profile-analysis-date">
                        {t('generatedOn', { date: formatAnalysisDate(activeReport.date) })}
                      </p>
                    </div>

                    <div className="student-profile-actions">
                      <Link
                        href={`/dashboard/student/analyses/${activeReport.id}/pdf`}
                        className="student-profile-link-secondary"
                      >
                        {t('viewReport')}
                      </Link>

                      <Link
                        href={`/dashboard/student/analyses/${activeReport.id}/pdf`}
                        target="_blank"
                        className="student-profile-link-primary"
                      >
                        {t('downloadPdf')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="student-profile-empty">
                    <p className="student-profile-text">{t('reportEmpty')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="student-profile-side">
          <Card className="student-profile-card">
            <CardHeader className="student-profile-card-header">
              <CardTitle className="student-profile-title">{t('reportSideTitle')}</CardTitle>
            </CardHeader>

            <CardContent className="student-profile-card-content-compact">
              <p className="student-profile-text">{t('reportSideText')}</p>

              <div className="mt-4">
                <span className="student-profile-badge">
                  {activeReport ? t('reportCount') : t('noReport')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
