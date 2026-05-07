'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { CalendarDays, CheckCircle2, Pencil, XCircle } from 'lucide-react'

import type { CoachingEvent } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function toDateTimeLocal(value: string) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)

  return local.toISOString().slice(0, 16)
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getStatusLabel(status: string | null | undefined) {
  if (status === 'published') return 'Publiee'
  if (status === 'cancelled') return 'Annulee'
  if (status === 'completed') return 'Terminee'
  return 'Brouillon'
}

type EditableEvent = Pick<
  CoachingEvent,
  'description' | 'durationMinutes' | 'id' | 'scheduledAt' | 'status' | 'teamsJoinUrl' | 'theme' | 'title'
>

export function CoachCoachingEventManager({ initialEvents }: { initialEvents: CoachingEvent[] }) {
  const [events, setEvents] = useState<EditableEvent[]>(initialEvents)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function updateEvent(formEvent: FormEvent<HTMLFormElement>, event: EditableEvent) {
    formEvent.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    const formData = new FormData(formEvent.currentTarget)

    try {
      const response = await fetch(`/api/coaching/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          description: String(formData.get('description') || ''),
          durationMinutes: Number(formData.get('durationMinutes') || 60),
          scheduledAt: String(formData.get('scheduledAt') || ''),
          teamsJoinUrl: String(formData.get('teamsJoinUrl') || ''),
          theme: String(formData.get('theme') || ''),
          title: String(formData.get('title') || ''),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de mettre a jour la seance.')
      }

      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) =>
          currentEvent.id === event.id ? data.event : currentEvent,
        ),
      )
      setEditingId(null)
      setMessage('Seance mise a jour. Les etudiants inscrits ont ete notifies.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function cancelEvent(event: EditableEvent) {
    const confirmed = window.confirm('Voulez-vous vraiment annuler cette seance ?')

    if (!confirmed) return

    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/coaching/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'annuler la seance.")
      }

      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) =>
          currentEvent.id === event.id ? data.event : currentEvent,
        ),
      )
      setMessage('Seance annulee. Les etudiants inscrits ont ete notifies.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (events.length === 0) {
    return (
      <div className="student-dreams-latest-box flex items-center gap-3">
        <div className="mindly-feature-icon">
          <CalendarDays />
        </div>

        <div>
          <p className="mindly-feature-reference">Aucune seance</p>
          <p className="mindly-feature-text">
            Les seances publiees apparaitront ici automatiquement.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mindly-stack-sm">
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {message ? (
        <div className="mindly-alert-success flex items-start gap-2 rounded-2xl p-3 text-sm font-medium">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <span>{message}</span>
        </div>
      ) : null}

      {events.map((event) => {
        const isEditing = editingId === event.id
        const isCancelled = event.status === 'cancelled'

        return (
          <div key={event.id} className="student-dreams-latest-box">
            {isEditing ? (
              <form className="grid gap-4" onSubmit={(formEvent) => updateEvent(formEvent, event)}>
                <div className="grid gap-2">
                  <Label htmlFor={`title-${event.id}`}>Titre</Label>
                  <Input id={`title-${event.id}`} name="title" defaultValue={event.title} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`theme-${event.id}`}>Theme</Label>
                  <Input id={`theme-${event.id}`} name="theme" defaultValue={event.theme} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`description-${event.id}`}>Description</Label>
                  <Textarea
                    id={`description-${event.id}`}
                    name="description"
                    defaultValue={event.description}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor={`scheduledAt-${event.id}`}>Date et heure</Label>
                    <Input
                      id={`scheduledAt-${event.id}`}
                      name="scheduledAt"
                      type="datetime-local"
                      defaultValue={toDateTimeLocal(event.scheduledAt)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`duration-${event.id}`}>Duree en minutes</Label>
                    <Input
                      id={`duration-${event.id}`}
                      name="durationMinutes"
                      type="number"
                      min={15}
                      defaultValue={event.durationMinutes}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`teams-${event.id}`}>Lien Microsoft Teams</Label>
                  <Input
                    id={`teams-${event.id}`}
                    name="teamsJoinUrl"
                    defaultValue={event.teamsJoinUrl || ''}
                    placeholder="https://teams.microsoft.com/..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    Enregistrer
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="student-dreams-latest-header">
                  <div>
                    <p className="mindly-feature-reference">{event.title}</p>
                    <p className="student-dreams-latest-text mt-1">{event.theme}</p>
                    <p className="mindly-feature-text mt-2">{formatEventDate(event.scheduledAt)}</p>
                  </div>

                  <span className="mindly-ui-badge">{getStatusLabel(event.status)}</span>
                </div>

                <p className="mindly-feature-text mt-3 line-clamp-2">{event.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCancelled || isSubmitting}
                    onClick={() => setEditingId(event.id)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCancelled || isSubmitting}
                    onClick={() => cancelEvent(event)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Annuler la seance
                  </Button>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
