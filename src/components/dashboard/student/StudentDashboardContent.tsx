'use client'

import { BarChart3, CalendarDays, ChevronRight, MoonStar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { StudentStatsCards } from '@/components/dashboard/student/StudentStatsCards'

type DreamSummary = {
  id: string
  summary?: string
  description?: string
  videoStatus?: string
}

type AnalysisSummary = {
  id: string
  reference?: string
  overview?: string
  niveauConfiance?: string
}

type StudentDashboardContentProps = {
  analysesCount: number
  appointmentsCount: number
  dreamsCount: number
  latestDream?: DreamSummary
  latestAnalysis?: AnalysisSummary
}

export function StudentDashboardContent({
  analysesCount,
  appointmentsCount,
  dreamsCount,
  latestDream,
  latestAnalysis,
}: StudentDashboardContentProps) {
  const t = useTranslations('dashboard.student')

  const getTranslatedVideoStatus = (status?: string) => {
    switch (status) {
      case 'pending':
        return t('home.latestDreamStatusPending')
      case 'waiting_validation':
        return t('home.latestDreamStatusWaitingValidation')
      case 'generating':
        return t('home.latestDreamStatusGenerating')
      case 'ready':
        return t('home.latestDreamStatusReady')
      case 'failed':
        return t('home.latestDreamStatusFailed')
      default:
        return t('home.latestDreamStatusUnknown')
    }
  }

  const getTranslatedConfidence = (confidence?: string) => {
    switch (confidence) {
      case 'eleve':
        return t('home.analysisConfidenceHigh')
      case 'moyen':
        return t('home.analysisConfidenceMedium')
      case 'faible':
        return t('home.analysisConfidenceLow')
      default:
        return t('home.analysisConfidenceUnknown')
    }
  }

  return (
    <div>
      <StudentTopbar />

      <StudentStatsCards
        analysesCount={analysesCount}
        appointmentsCount={appointmentsCount}
        dreamsCount={dreamsCount}
      />

      <div className="mindly-dashboard-grid">
        <div className="xl:col-span-2">
          <Link href="/dashboard/student/dreams" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <MoonStar />
                  </span>
                  <h2 className="mindly-feature-title">{t('home.latestDream.title')}</h2>
                </div>

                <span className="mindly-feature-action">
                  {t('home.see')}
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {latestDream ? (
                  <div className="mindly-stack-md">
                    <p className="mindly-feature-text">
                      {latestDream.summary || latestDream.description}
                    </p>
                    <span className="mindly-ui-badge">
                      {t('home.latestDream.videoLabel', {
                        status: getTranslatedVideoStatus(latestDream.videoStatus),
                      })}
                    </span>
                  </div>
                ) : (
                  <p className="mindly-feature-text">{t('home.latestDream.empty')}</p>
                )}
              </div>
            </article>
          </Link>
        </div>

        <div className="mindly-stack-lg">
          <Link href="/dashboard/student/analyses" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <BarChart3 />
                  </span>
                  <h2 className="mindly-feature-title">{t('home.analysis.title')}</h2>
                </div>

                <span className="mindly-feature-action">
                  {t('home.see')}
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                {latestAnalysis ? (
                  <div className="mindly-stack-sm">
                    <p className="mindly-feature-reference">{latestAnalysis.reference}</p>
                    <p className="mindly-feature-text">
                      {latestAnalysis.overview || t('home.analysis.overview')}
                    </p>
                    <span className="mindly-ui-badge">
                      {t('home.analysis.confidence', {
                        value: getTranslatedConfidence(latestAnalysis.niveauConfiance),
                      })}
                    </span>
                  </div>
                ) : (
                  <p className="mindly-feature-text">{t('home.analysis.empty')}</p>
                )}
              </div>
            </article>
          </Link>

          <Link href="/dashboard/student/rendez_vous" className="mindly-feature-link">
            <article className="mindly-feature-card">
              <div className="mindly-feature-header">
                <div className="mindly-feature-heading">
                  <span className="mindly-feature-icon">
                    <CalendarDays />
                  </span>
                  <h2 className="mindly-feature-title">{t('home.appointment.title')}</h2>
                </div>

                <span className="mindly-feature-action">
                  {t('home.see')}
                  <ChevronRight />
                </span>
              </div>

              <div className="mindly-feature-content">
                <p className="mindly-feature-text">{t('home.appointment.empty')}</p>
              </div>
            </article>
          </Link>
        </div>
      </div>
    </div>
  )
}
