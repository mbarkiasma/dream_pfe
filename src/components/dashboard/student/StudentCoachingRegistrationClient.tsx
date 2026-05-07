'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { CalendarDays, CheckCircle2 } from 'lucide-react'

import type { CoachingEvent, CoachingRegistration } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function formatDate(value: string | null | undefined) {
  if (!value) return 'Date non renseignee'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

type StudentCoachingRegistrationClientProps = {
  event: CoachingEvent
  existingRegistration?: CoachingRegistration | null
}

export function StudentCoachingRegistrationClient({
  event,
  existingRegistration,
}: StudentCoachingRegistrationClientProps) {
  const [motivation, setMotivation] = useState('')
  const [questions, setQuestions] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/coaching/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivation,
          questions,
          specialNeeds,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer votre inscription.")
      }

      setMessage('Votre participation est confirmee. Vous recevrez le lien Teams avant la seance.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-xl text-dream-heading dark:text-white">
              {event.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.06]">
              <CalendarDays className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-200" />
              <div>
                <p className="font-medium text-dream-heading dark:text-white">{event.theme}</p>
                <p className="text-sm text-dream-muted dark:text-white/65">
                  {formatDate(event.scheduledAt)}
                </p>
                <p className="text-sm text-dream-muted dark:text-white/65">
                  Duree: {event.durationMinutes} minutes
                </p>
              </div>
            </div>

            <p className="leading-7 text-dream-muted dark:text-white/65">{event.description}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="rounded-[28px] border border-border bg-card/80 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-xl text-dream-heading dark:text-white">
              {existingRegistration ? 'Participation confirmee' : 'Formulaire'}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {existingRegistration ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Votre participation a deja ete confirmee.</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-dream-heading dark:text-white">
                    Pourquoi voulez-vous participer ?
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-dream-muted dark:bg-white/[0.06] dark:text-white/65">
                    {existingRegistration.motivation}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-dream-heading dark:text-white">
                    Questions pour le coach
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-dream-muted dark:bg-white/[0.06] dark:text-white/65">
                    {existingRegistration.questions || 'Aucune question renseignee.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-dream-heading dark:text-white">
                    Besoin particulier
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-dream-muted dark:bg-white/[0.06] dark:text-white/65">
                    {existingRegistration.specialNeeds || 'Aucun besoin particulier renseigne.'}
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="motivation">Pourquoi voulez-vous participer ?</Label>
                <Textarea
                  id="motivation"
                  value={motivation}
                  onChange={(eventChange) => setMotivation(eventChange.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">Questions pour le coach</Label>
                <Textarea
                  id="questions"
                  value={questions}
                  onChange={(eventChange) => setQuestions(eventChange.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Besoin particulier</Label>
                <Textarea
                  id="specialNeeds"
                  value={specialNeeds}
                  onChange={(eventChange) => setSpecialNeeds(eventChange.target.value)}
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

              {message ? (
                <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Confirmation...' : 'Confirmer ma participation'}
              </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
