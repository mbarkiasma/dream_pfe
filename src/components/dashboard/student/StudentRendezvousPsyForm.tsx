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
  if (isSelected) {
    return 'border-violet-500 bg-dream-accent text-white shadow-[0_16px_34px_rgba(109,40,217,0.26)]'
  }

  if (day.status === 'available') {
    return 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100'
  }

  if (day.status === 'full') {
    return 'border-red-100 bg-red-50 text-red-700'
  }

  return 'border-slate-100 bg-slate-50 text-slate-500'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
        <section className="overflow-hidden rounded-[22px] border border-border bg-card/85 shadow-[0_14px_40px_rgba(109,40,217,0.08)] dark:border-white/10 dark:bg-white/[0.05]">
          <div className="dream-brand-bg p-3.5 text-white">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/18 p-2">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/75">
                  Agenda
                </p>
                <p className="mt-0.5 text-xl font-bold">Prochains jours</p>
              </div>
            </div>
          </div>

          <div className="p-3.5">
            <div className="grid grid-cols-3 gap-2">
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
                    variant={isSelected ? 'slotActive' : 'slot'}
                    size="cardSm"
                  >
                    <span className="block text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">
                      {day.dayName}
                    </span>
                    <span className="mt-1 block text-2xl font-black leading-none">
                      {day.dayNumber}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold uppercase opacity-70">
                      {day.monthName}
                    </span>
                    <span
                      className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : day.status === 'available'
                            ? 'bg-card/70 text-emerald-700'
                            : 'bg-card/70 text-slate-500'
                      }`}
                    >
                      {getAgendaStatusLabel(day)}
                    </span>
                  </Button>
                )
              })}
            </div>

            <div className="mt-3 space-y-2">
              <Label htmlFor="appointment-date" className="text-dream-heading dark:text-foreground">
                Autre date
              </Label>
              <Input
                id="appointment-date"
                min={today}
                onChange={(event) => setSelectedDate(event.target.value)}
                type="date"
                value={selectedDate}
                className="h-10 rounded-xl border-border bg-white text-dream-heading shadow-inner dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-border bg-card/85 p-3.5 shadow-[0_14px_40px_rgba(109,40,217,0.08)] dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-500/15">
                <Clock className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold capitalize text-dream-heading dark:text-foreground">
                  {getDateLabel(selectedDate)}
                </p>
                <p className="text-[15px] text-[#7A6A99] dark:text-muted-foreground">
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
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-dream-muted dark:bg-white/[0.05] dark:text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-dream-accent" />
              Chargement des horaires...
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="relative space-y-3 before:absolute before:bottom-4 before:left-[22px] before:top-4 before:w-px before:bg-dream-highlight dark:before:bg-white/10">
              {availableSlots.map((slot) => {
                const active = startTime === slot.startTime

                return (
                  <Button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    onClick={() => setStartTime(slot.startTime)}
                    variant={active ? 'slotActive' : 'slot'}
                    size="cardSm"
                  >
                    <span
                      className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {active ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${active ? 'text-white/75' : 'text-dream-muted'}`}
                      >
                        Consultation disponible
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {active ? 'Choisi' : 'Libre'}
                    </span>
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-border bg-card/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-dream-highlight text-dream-accent dark:bg-dream-softer0/15 dark:text-violet-100">
                <Clock className="h-4 w-4" />
              </div>
              <p className="mt-3 font-semibold text-dream-heading dark:text-foreground">
                Aucun horaire disponible
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-dream-muted dark:text-muted-foreground">
                {getSelectedDayMessage(selectedDayStatus)}
              </p>
            </div>
          )}

          {hiddenUnavailableSlots > 0 && availableSlots.length > 0 ? (
            <p className="mt-4 text-center text-xs font-medium text-[#7A6A99] dark:text-muted-foreground">
              Les horaires passes ou deja reserves ne sont pas affiches.
            </p>
          ) : null}
        </section>
      </div>

      {selectedSlot ? (
        <div className="rounded-[24px] border border-border bg-dream-softer/80 px-4 py-3 text-sm font-medium text-dream-heading dark:border-violet-400/20 dark:bg-dream-softer0/10 dark:text-violet-100">
          Rendez-vous selectionne : {getDateLabel(selectedDate)} de {selectedSlot.startTime} a{' '}
          {selectedSlot.endTime}.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          <Label className="text-dream-heading dark:text-foreground">Urgence</Label>
          <Select
            value={urgency}
            onValueChange={(value) => setUrgency(value as 'normal' | 'urgent')}
          >
            <SelectTrigger className="h-12 rounded-2xl border-border bg-card/90 text-dream-heading dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground">
              <SelectValue placeholder="Niveau d'urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment-reason" className="text-dream-heading dark:text-foreground">
            Motif de la demande
          </Label>
          <Textarea
            id="appointment-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explique brievement pourquoi tu souhaites rencontrer le psychologue."
            className="min-h-32 rounded-2xl border-border bg-card/90 text-dream-heading dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting || isLoadingDay || !startTime || !reason.trim()}
        className="h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-5 text-white shadow-md transition hover:opacity-95"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Envoyer la demande
      </Button>
    </form>
  )
}
