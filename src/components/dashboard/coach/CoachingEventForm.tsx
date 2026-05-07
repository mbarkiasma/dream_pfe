'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { CalendarPlus, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function CoachCoachingEventForm() {
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [teamsJoinUrl, setTeamsJoinUrl] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/coaching/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          theme,
          description,
          scheduledAt,
          durationMinutes: Number(durationMinutes),
          teamsJoinUrl,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de publier la séance.')
      }

      setTitle('')
      setTheme('')
      setDescription('')
      setScheduledAt('')
      setDurationMinutes('60')
      setTeamsJoinUrl('')
      setMessage('Séance publiée. Les étudiants vont recevoir une notification et un email.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mindly-feature-card">
      <CardHeader className="mindly-feature-header">
        <CardTitle className="mindly-feature-title flex items-center gap-2">
          <CalendarPlus className="h-5 w-5" />
          Planifier une séance
        </CardTitle>
      </CardHeader>

      <CardContent className="mindly-feature-content">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="event-title">Titre</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(eventChange) => setTitle(eventChange.target.value)}
              placeholder="Ex: Séance de coaching communication"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-theme">Thème</Label>
            <Input
              id="event-theme"
              value={theme}
              onChange={(eventChange) => setTheme(eventChange.target.value)}
              placeholder="Ex: Communication"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(eventChange) => setDescription(eventChange.target.value)}
              placeholder="Décrivez l’objectif de la séance..."
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="event-date">Date et heure</Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(eventChange) => setScheduledAt(eventChange.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-duration">Durée en minutes</Label>
              <Input
                id="event-duration"
                type="number"
                min={15}
                value={durationMinutes}
                onChange={(eventChange) => setDurationMinutes(eventChange.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-teams">Lien Microsoft Teams</Label>
            <Input
              id="event-teams"
              value={teamsJoinUrl}
              onChange={(eventChange) => setTeamsJoinUrl(eventChange.target.value)}
              placeholder="https://teams.microsoft.com/..."
            />
          </div>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          {message ? (
            <div className="mindly-alert-success flex items-start gap-2 rounded-2xl p-3 text-sm font-medium">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{message}</span>
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="student-dreams-submit-button w-fit">
            {isSubmitting ? 'Publication...' : 'Publier la séance'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
