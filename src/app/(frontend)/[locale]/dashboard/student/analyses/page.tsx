import Link from 'next/link'
import { ArrowRight, Download, FileText } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { getReportWellbeingTheme } from '@/utilities/getReportWellbeingTheme'
import { translateAnalysisToEnglish } from '@/utilities/translateAnalysis'

export default async function StudentAnalysesPage() {
  const payload = await getPayload({ config })
  const { user } = await getAuthenticatedDashboardUser()
  const t = await getTranslations('dashboard.student.analyses')
  const locale = await getLocale()

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
        limit: 20,
      })
    : { docs: [], totalDocs: 0 }

  const latestAnalysis = analyses.docs[0]
  const reportWellbeing = getReportWellbeingTheme(latestAnalysis?.traits)

  const tx = locale === 'en' && latestAnalysis
    ? await translateAnalysisToEnglish(latestAnalysis.id, latestAnalysis)
    : null

  const wellbeingKeyMap = {
    pending: { label: t('wellbeing.pending.label'), description: t('wellbeing.pending.description') },
    balanced: { label: t('wellbeing.balanced.label'), description: t('wellbeing.balanced.description') },
    toSupport: { label: t('wellbeing.toSupport.label'), description: t('wellbeing.toSupport.description') },
    sensitive: { label: t('wellbeing.sensitive.label'), description: t('wellbeing.sensitive.description') },
  }
  const wellbeingLabel = wellbeingKeyMap[reportWellbeing.key].label
  const wellbeingDescription = wellbeingKeyMap[reportWellbeing.key].description

  const formattedDate = latestAnalysis
    ? new Date(latestAnalysis.date).toLocaleDateString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <div className="mindly-stack-lg">
        <section
          className={`mindly-card report-theme-card report-overview-card report-theme-${reportWellbeing.theme} p-6`}
        >
          <div className="report-overview-head">
            <div>
              <p className="report-overview-kicker">{t('kicker')}</p>
              <h2 className="report-overview-title">
                {latestAnalysis ? t('reportAvailable') : t('reportPending')}
              </h2>
            </div>

            <div className="report-overview-badges">
              <span
                className={
                  latestAnalysis ? 'mindly-ui-badge mindly-ui-badge-success' : 'mindly-ui-badge'
                }
              >
                {latestAnalysis ? t('statusDone') : t('statusPending')}
              </span>

              <span className="mindly-ui-badge">{t('uniqueReport')}</span>
            </div>
          </div>

          {latestAnalysis ? (
            <div className="report-overview-body">
              <div className="report-summary-card">
                <div className="report-summary-top">
                  <div>
                    <p className="report-reference">{latestAnalysis.reference}</p>
                    <p className="report-date">{t('generatedOn', { date: formattedDate })}</p>
                  </div>

                  <div className="report-wellbeing-pill">
                    <span>{wellbeingLabel}</span>
                    {reportWellbeing.score !== null ? (
                      <strong>{reportWellbeing.score.toFixed(1)}/10</strong>
                    ) : null}
                  </div>
                </div>

                <div className="report-summary-grid">
                  <div>
                    <p className="report-mini-label">{t('overviewLabel')}</p>
                    <p className="report-summary-text">
                      {tx?.overview ?? tx?.conclusion ?? latestAnalysis.overview ?? latestAnalysis.conclusion ?? t('overviewEmpty')}
                    </p>
                  </div>

                  <div>
                    <p className="report-mini-label">{t('balanceLabel')}</p>
                    <p className="report-summary-text">{wellbeingDescription}</p>
                  </div>
                </div>
              </div>

              <div className="report-action-row">
                <Link
                  href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                  className="report-action-secondary"
                >
                  <FileText className="h-4 w-4" />
                  {t('seeReport')}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href={`/dashboard/student/analyses/${latestAnalysis.id}/pdf`}
                  target="_blank"
                  className="report-action-primary"
                >
                  <Download className="h-4 w-4" />
                  {t('downloadPdf')}
                </Link>
              </div>
            </div>
          ) : (
            <p className="leading-7 text-[var(--mindly-text-soft)]">
              {t('reportEmpty')}
            </p>
          )}
        </section>

        <section className="mindly-card-soft p-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--mindly-text-strong)]">
              {t('aboutTitle')}
            </h2>
            <p className="mt-4 leading-7 text-[var(--mindly-text-soft)]">
              {t('aboutDescription')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
