'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CheckCircle2, Loader2, XCircle } from 'lucide-react'

import type { PsyOrientation } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

function getPersonName(value: unknown, fallback: string) {
  if (!value || typeof value !== 'object') return fallback

  const data = value as {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  }

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()

  return fullName || data.email || fallback
}

const statusLabels: Record<string, string> = {
  appointment_requested: 'Rendez-vous demande',
  cancelled: 'Annulee',
  pending_student_response: 'En attente de votre reponse',
  student_accepted: 'Acceptee',
  student_refused: 'Refusee',
}

export function StudentPsyOrientationClient({ orientation }: { orientation: PsyOrientation }) {
  const router = useRouter()
  const [status, setStatus] = useState(orientation.status)
  const [refusalReason, setRefusalReason] = useState('')
  const [isRefusing, setIsRefusing] = useState(false)
  const [loadingAction, setLoadingAction] = useState<'accept' | 'refuse' | null>(null)
  const [error, setError] = useState('')

  async function respond(action: 'accept' | 'refuse') {
    setError('')
    setLoadingAction(action)

    try {
      const response = await fetch(`/api/psy-orientation/${orientation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          refusalReason,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de traiter votre reponse.')
      }

      setStatus(data.orientation.status)

      if (action === 'accept') {
        router.push(`/dashboard/student/rendez_vous?orientationId=${orientation.id}`)
        return
      }

      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.')
    } finally {
      setLoadingAction(null)
    }
  }

  const isPending = status === 'pending_student_response'
  const canChooseAppointment = status === 'student_accepted'

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">
              Recommandation du coach
            </CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            <div className="mindly-stack-sm">
              <div className="student-dreams-latest-box">
                <p className="mindly-feature-reference">
                  Coach: {getPersonName(orientation.coach, 'Coach')}
                </p>

                <p className="mindly-feature-text mt-3">{orientation.reason}</p>

                {orientation.observation ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
                    <p className="text-sm font-semibold text-dream-heading dark:text-white">
                      Observation du coach
                    </p>
                    <p className="mt-2 text-sm leading-6 text-dream-muted dark:text-white/65">
                      {orientation.observation}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4">
                  <span className="mindly-ui-badge">
                    {statusLabels[status] || status}
                  </span>
                </div>
              </div>

              <p className="mindly-feature-text">
                Si vous acceptez, vous serez redirige vers la page de prise de rendez-vous avec le
                psychologue. Cette demande sera traitee comme urgente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="mindly-feature-card">
          <CardHeader className="mindly-feature-header">
            <CardTitle className="mindly-feature-title">Votre reponse</CardTitle>
          </CardHeader>

          <CardContent className="mindly-feature-content">
            {isPending ? (
              <div className="mindly-stack-sm">
                {isRefusing ? (
                  <div className="mindly-stack-sm">
                    <Textarea
                      value={refusalReason}
                      onChange={(event) => setRefusalReason(event.target.value)}
                      placeholder="Raison du refus (optionnelle)"
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={loadingAction !== null}
                        onClick={() => respond('refuse')}
                      >
                        {loadingAction === 'refuse' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Confirmer le refus
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={loadingAction !== null}
                        onClick={() => setIsRefusing(false)}
                      >
                        Retour
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mindly-stack-sm">
                    <Button
                      type="button"
                      disabled={loadingAction !== null}
                      onClick={() => respond('accept')}
                    >
                      {loadingAction === 'accept' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Accepter et choisir un rendez-vous
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={loadingAction !== null}
                      onClick={() => setIsRefusing(true)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                )}

                {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
              </div>
            ) : canChooseAppointment ? (
              <div className="mindly-stack-sm">
                <div className="mindly-alert-success flex items-start gap-2 rounded-2xl p-3 text-sm font-medium">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  <span>Orientation acceptee. Vous pouvez maintenant choisir un rendez-vous.</span>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/student/rendez_vous?orientationId=${orientation.id}`)
                  }
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Choisir un rendez-vous
                </Button>
              </div>
            ) : (
              <div className="mindly-alert-success flex items-start gap-2 rounded-2xl p-3 text-sm font-medium">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <span>Votre reponse a deja ete enregistree.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
