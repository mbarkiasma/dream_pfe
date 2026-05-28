import Link from 'next/link'
import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale, getTranslations } from 'next-intl/server'

import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'
import { translateCoachingEventToEnglish } from '@/utilities/translateCoachingEvent'

function getRelationId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object' && 'id' in value) {
    return String(value.id)
  }

  return null
}

function getCoachName(coach: unknown) {
  if (!coach || typeof coach !== 'object') return ''

  const data = coach as {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  }

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || ''
}

export default async function StudentSeancesPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })
  const t = await getTranslations('dashboard.student.seances')
  const locale = await getLocale()
  const now = Date.now()

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(value))
  }

  const events = user
    ? await payload.find({
        collection: 'coaching-events',
        user,
        overrideAccess: false,
        where: {
          status: {
            equals: 'published',
          },
        },
        depth: 1,
        sort: 'scheduledAt',
        limit: 100,
      })
    : { docs: [] }

  const registrations = user
    ? await payload.find({
        collection: 'coaching-registrations',
        user,
        overrideAccess: false,
        where: {
          student: {
            equals: user.id,
          },
        },
        depth: 0,
        limit: 1000,
      })
    : { docs: [] }

  const registeredEventIds = new Set(
    registrations.docs
      .filter((registration) => registration.status === 'registered')
      .map((registration) => getRelationId(registration.event))
      .filter(Boolean),
  )

  const eventTranslationsMap = locale === 'en' && events.docs.length > 0
    ? new Map(
        await Promise.all(
          events.docs.map(async (event) => {
            const tx = await translateCoachingEventToEnglish(event.id, {
              title: event.title,
              theme: event.theme,
              description: event.description,
            })
            return [String(event.id), tx] as const
          }),
        ),
      )
    : null

  return (
    <div>
      <StudentTopbar
        title={t('topbar.title')}
        description={t('topbar.description')}
      />

      <Card className="mindly-feature-card">
        <CardHeader className="mindly-feature-header">
          <CardTitle className="mindly-feature-title flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t('allSessions')}
          </CardTitle>
        </CardHeader>

        <CardContent className="mindly-feature-content">
          {events.docs.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {events.docs.map((event) => {
                const eventTime = new Date(event.scheduledAt).getTime()
                const isPast = Number.isFinite(eventTime) && eventTime <= now
                const isRegistered = registeredEventIds.has(String(event.id))
                const coachName = getCoachName(event.coach)
                const tx = eventTranslationsMap?.get(String(event.id))

                return (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-border bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-dream-heading dark:text-white">
                          {tx?.title ?? event.title}
                        </h2>
                        <p className="mt-1 text-sm text-dream-muted dark:text-white/65">
                          {tx?.theme ?? event.theme}
                        </p>
                      </div>

                      <span className="mindly-ui-badge">
                        {isPast ? t('statusPast') : t('statusUpcoming')}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-dream-muted dark:text-white/65">
                      {formatDate(event.scheduledAt)}
                    </p>

                    {coachName ? (
                      <p className="mt-1 text-sm text-dream-muted dark:text-white/65">
                        {t('coachLabel', { name: coachName })}
                      </p>
                    ) : null}

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-dream-muted dark:text-white/65">
                      {tx?.description ?? event.description}
                    </p>

                    <div className="mt-5">
                      {isPast ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500 dark:bg-white/10 dark:text-white/45"
                        >
                          <Clock3 className="h-4 w-4" />
                          {t('btnEnded')}
                        </button>
                      ) : isRegistered ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {t('btnConfirmed')}
                        </button>
                      ) : (
                        <Link
                          href={`/dashboard/student/coaching/events/${event.id}/register`}
                          className="inline-flex rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-95"
                        >
                          {t('btnConfirm')}
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-dream-muted dark:text-white/65">
              {t('empty')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
