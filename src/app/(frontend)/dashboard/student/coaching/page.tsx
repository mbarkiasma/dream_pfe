import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { StudentCoachingClient } from '@/components/dashboard/student/StudentCoachingClient'
import { StudentTopbar } from '@/components/dashboard/student/StudentTopbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuthenticatedDashboardUser } from '@/utilities/getAuthenticatedDashboardUser'

export default async function StudentCoachingPage() {
  const { user } = await getAuthenticatedDashboardUser()
  const payload = await getPayload({ config })

  const sessions = user
    ? await payload.find({
        collection: 'coaching-sessions',
        user,
        overrideAccess: false,
        where: {
          student: {
            equals: user.id,
          },
        },
        depth: 1,
        sort: '-createdAt',
        limit: 30,
      })
    : { docs: [] }

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
        depth: 0,
        sort: 'scheduledAt',
        limit: 20,
      })
    : { docs: [] }

  return (
    <div>
      <StudentTopbar
        title="Smart coaching"
        description="Choisissez un accompagnement immediat par IA ou une session classique avec un coach humain."
      />

      <Card className="mb-6 rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-dream-heading dark:text-white">
            <CalendarDays className="h-5 w-5" />
            Seances de coaching disponibles
          </CardTitle>
        </CardHeader>

        <CardContent>
          {events.docs.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {events.docs.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-border bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.06]"
                >
                  <p className="font-semibold text-dream-heading dark:text-white">
                    {event.title}
                  </p>

                  <p className="text-sm text-dream-muted dark:text-white/65">{event.theme}</p>

                  <p className="mt-2 text-sm text-dream-muted dark:text-white/65">
                    {new Intl.DateTimeFormat('fr-FR', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    }).format(new Date(event.scheduledAt))}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                    {event.description}
                  </p>

                  <Link
                    href={`/dashboard/student/coaching/events/${event.id}/register`}
                    className="mt-4 inline-flex rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-95"
                  >
                    Confirmer ma participation
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dream-muted dark:text-white/65">
              Aucune seance de coaching n&apos;est disponible pour le moment.
            </p>
          )}
        </CardContent>
      </Card>

      <StudentCoachingClient initialSessions={sessions.docs as any} />
    </div>
  )
}
