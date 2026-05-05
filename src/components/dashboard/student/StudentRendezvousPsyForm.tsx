'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CheckCircle2, Clock, Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type DayStatus = 'available' | 'full' | 'weekend' | 'closed' | 'past'

type Slot = {
  startTime: string
  endTime: string
  available: boolean
}

type DayResponse = {
  availableSlots?: number
  busySlots?: number
  error?: string
  slots?: Slot[]
  status?: DayStatus
  totalSlots?: number
}

type AgendaDay = {
  availableSlots: number
  date: string
  dayName: string
  dayNumber: string
  monthName: string
  status: DayStatus
}

const selectedDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const agendaDayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
const agendaMonthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function buildAgendaDays(startDate: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = addDays(startDate, index)

    return {
      date: formatDateValue(date),
      dayName: agendaDayFormatter.format(date).replace('.', ''),
      dayNumber: String(date.getDate()).padStart(2, '0'),
      monthName: agendaMonthFormatter.format(date).replace('.', ''),
    }
  })
}

function getSelectedDayMessage(status: DayStatus | undefined) {
  if (status === 'full') return 'Tous les creneaux de cette journee sont deja pris.'
  if (status === 'weekend') return 'Le psychologue ne consulte pas le week-end.'
  if (status === 'closed') return 'Le psychologue ne consulte pas ce jour-la.'
  if (status === 'past') return 'Cette date est deja passee.'

  return 'Aucun horaire disponible pour cette date.'
}

function getDateLabel(dateValue: string) {
  return selectedDateFormatter.format(new Date(`${dateValue}T00:00:00`))
}

function getAgendaStatusLabel(day: AgendaDay) {
  if (day.status === 'available')
    return `${day.availableSlots} libre${day.availableSlots > 1 ? 's' : ''}`
  if (day.status === 'full') return 'Complet'
  if (day.status === 'weekend') return 'Week-end'
  if (day.status === 'closed') return 'Ferme'
  return 'Passe'
}

function getAgendaStatusClass(day: AgendaDay, isSelected: boolean) {
  if (isSelected) return 'student-psy-day-active'
  if (day.status === 'available') return 'student-psy-day-available'
  if (day.status === 'full') return 'student-psy-day-full'

  return 'student-psy-day-closed'
}

export function StudentRendezvousPsyForm() {
  const router = useRouter()
  const today = useMemo(() => formatDateValue(new Date()), [])
  const tomorrow = useMemo(() => formatDateValue(addDays(new Date(), 1)), [])
  const agendaDates = useMemo(() => buildAgendaDays(new Date(), 6), [])

  const [agendaDays, setAgendaDays] = useState<AgendaDay[]>([])
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedDayStatus, setSelectedDayStatus] = useState<DayStatus>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [startTime, setStartTime] = useState('')
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal')
  const [isLoadingDay, setIsLoadingDay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadAgenda() {
      try {
        const days = await Promise.all(
          agendaDates.map(async (day) => {
            const response = await fetch(
              `/api/disponibilitespsy?date=${encodeURIComponent(day.date)}`,
            )
            const data = (await response.json().catch(() => ({}))) as DayResponse

            return {
              ...day,
              availableSlots: data.availableSlots || 0,
              status: response.ok && data.status ? data.status : 'closed',
            }
          }),
        )

        if (isActive) {
          setAgendaDays(days)
        }
      } catch {
        if (isActive) {
          setAgendaDays(
            agendaDates.map((day) => ({
              ...day,
              availableSlots: 0,
              status: 'closed',
            })),
          )
        }
      }
    }

    void loadAgenda()

    return () => {
      isActive = false
    }
  }, [agendaDates])

  useEffect(() => {
    let isActive = true

    async function loadDay() {
      setIsLoadingDay(true)
      setStartTime('')
      setMessage('')
      setError('')

      try {
        const response = await fetch(
          `/api/disponibilitespsy?date=${encodeURIComponent(selectedDate)}`,
        )
        const data = (await response.json()) as DayResponse

        if (!isActive) return

        if (!response.ok) {
          setSlots([])
          setSelectedDayStatus(undefined)
          setError(data.error || 'Impossible de charger les creneaux.')
          return
        }

        setSlots(data.slots || [])
        setSelectedDayStatus(data.status)
      } catch {
        if (isActive) {
          setSlots([])
          setSelectedDayStatus(undefined)
          setError('Impossible de charger les creneaux.')
        }
      } finally {
        if (isActive) {
          setIsLoadingDay(false)
        }
      }
    }

    if (selectedDate) {
      void loadDay()
    }

    return () => {
      isActive = false
    }
  }, [selectedDate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!startTime || !reason.trim()) {
      setError('Choisis un creneau disponible et indique le motif de ta demande.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/rendezvouspsy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          startTime,
          reason,
          urgency,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(data.error || "Impossible d'envoyer la demande.")
        return
      }

      setMessage('Demande envoyee. Le psychologue pourra la confirmer depuis son espace.')
      setReason('')
      setStartTime('')
      router.refresh()
    } catch {
      setError("Impossible d'envoyer la demande.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableSlots = slots.filter((slot) => slot.available)
  const selectedSlot = slots.find((slot) => slot.startTime === startTime)
  const hiddenUnavailableSlots = slots.length - availableSlots.length
  const selectedAgendaDay = agendaDays.find((day) => day.date === selectedDate)

  return (
    <form onSubmit={handleSubmit} className="student-psy-form">
      <div className="student-psy-grid">
        <section className="student-psy-card">
          <div className="student-psy-card-header">
            <div className="student-psy-card-header-row">
              <div className="student-psy-card-header-icon">
                <CalendarDays />
              </div>
              <div>
                <p className="student-psy-card-label">Agenda</p>
                <p className="student-psy-card-title">Prochains jours</p>
              </div>
            </div>
          </div>

          <div className="student-psy-card-body">
            <div className="student-psy-days-grid">
              {(agendaDays.length > 0
                ? agendaDays
                : agendaDates.map((day) => ({
                    ...day,
                    availableSlots: 0,
                    status: 'closed' as DayStatus,
                  }))
              ).map((day) => {
                const isSelected = selectedDate === day.date

                return (
                  <Button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={`student-psy-day-button ${getAgendaStatusClass(day, isSelected)}`}
                  >
                    <span className="student-psy-day-name">{day.dayName}</span>
                    <span className="student-psy-day-number">{day.dayNumber}</span>
                    <span className="student-psy-day-month">{day.monthName}</span>
                    <span className="student-psy-day-badge">{getAgendaStatusLabel(day)}</span>
                  </Button>
                )
              })}
            </div>

            <div className="student-psy-field student-psy-field-spaced">
              <Label htmlFor="appointment-date" className="student-psy-label">
                Autre date
              </Label>
              <Input
                id="appointment-date"
                min={today}
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
                className="student-psy-input"
              />
            </div>
          </div>
        </section>

        <section className="student-psy-slots-card">
          <div className="student-psy-slots-header">
            <div className="student-psy-slots-title-row">
              <div className="student-psy-slots-icon">
                <Clock />
              </div>
              <div>
                <p className="student-psy-selected-date">{getDateLabel(selectedDate)}</p>
                <p className="student-psy-selected-count">
                  {selectedAgendaDay
                    ? getAgendaStatusLabel(selectedAgendaDay)
                    : availableSlots.length > 0
                      ? `${availableSlots.length} creneau${availableSlots.length > 1 ? 'x' : ''} restant${availableSlots.length > 1 ? 's' : ''}`
                      : 'Aucun creneau restant'}
                </p>
              </div>
            </div>
          </div>

          {isLoadingDay ? (
            <div className="student-psy-loading">
              <Loader2 className="animate-spin" />
              Chargement des horaires...
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="student-psy-slots-list">
              {availableSlots.map((slot) => {
                const active = startTime === slot.startTime

                return (
                  <Button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    onClick={() => setStartTime(slot.startTime)}
                    className={`student-psy-slot-button ${active ? 'student-psy-slot-active' : ''}`}
                  >
                    <span className="student-psy-slot-icon">
                      {active ? <CheckCircle2 /> : <Clock />}
                    </span>

                    <span className="student-psy-slot-content">
                      <span className="student-psy-slot-time">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="student-psy-slot-caption">Consultation disponible</span>
                    </span>

                    <span className="student-psy-slot-badge">{active ? 'Choisi' : 'Libre'}</span>
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="student-psy-empty-slots">
              <div className="student-psy-empty-icon">
                <Clock />
              </div>
              <p className="student-psy-empty-title">Aucun horaire disponible</p>
              <p className="student-psy-empty-text">
                {getSelectedDayMessage(selectedDayStatus)}
              </p>
            </div>
          )}

          {hiddenUnavailableSlots > 0 && availableSlots.length > 0 ? (
            <p className="student-psy-hidden-note">
              Les horaires passes ou deja reserves ne sont pas affiches.
            </p>
          ) : null}
        </section>
      </div>

      {selectedSlot ? (
        <div className="student-psy-selected-box">
          Rendez-vous selectionne : {getDateLabel(selectedDate)} de {selectedSlot.startTime} a{' '}
          {selectedSlot.endTime}.
        </div>
      ) : null}

      <div className="student-psy-details-grid">
        <div className="student-psy-field">
          <Label className="student-psy-label">Urgence</Label>
          <Select
            value={urgency}
            onValueChange={(value) => setUrgency(value as 'normal' | 'urgent')}
          >
            <SelectTrigger className="student-psy-select-trigger">
              <SelectValue placeholder="Niveau d'urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="student-psy-field">
          <Label htmlFor="appointment-reason" className="student-psy-label">
            Motif de la demande
          </Label>
          <Textarea
            id="appointment-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explique brievement pourquoi tu souhaites rencontrer le psychologue."
            className="student-psy-textarea"
          />
        </div>
      </div>

      {error ? <div className="student-psy-error">{error}</div> : null}

      {message ? <div className="student-psy-success">{message}</div> : null}

      <Button
        type="submit"
        disabled={isSubmitting || isLoadingDay || !startTime || !reason.trim()}
        className="student-psy-submit"
      >
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        Envoyer la demande
      </Button>
    </form>
  )
}