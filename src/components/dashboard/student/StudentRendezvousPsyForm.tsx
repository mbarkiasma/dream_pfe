'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MoveRight,
  Send,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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

type MonthDay = {
  date: string
  day: number
  status: DayStatus
  totalSlots: number
  availableSlots: number
  busySlots: number
}

type Slot = {
  startTime: string
  endTime: string
  available: boolean
}

type MonthResponse = {
  days?: MonthDay[]
  error?: string
}

type DayResponse = {
  status?: DayStatus
  slots?: Slot[]
  availableSlots?: number
  totalSlots?: number
  error?: string
}

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
})
const selectedDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function formatDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayValue() {
  return formatDateValue(new Date())
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthGridOffset(monthDate: Date) {
  const jsDay = monthDate.getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

function getDayButtonClass(day: MonthDay, isSelected: boolean) {
  if (isSelected) {
    return 'border-violet-500 bg-violet-500 text-white shadow-[0_12px_24px_rgba(139,92,246,0.22)] dark:border-violet-400 dark:bg-violet-500'
  }

  if (day.status === 'available') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15'
  }

  if (day.status === 'full') {
    return 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200'
  }

  if (day.status === 'weekend' || day.status === 'closed') {
    return 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200'
  }

  return 'border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-muted-foreground'
}

function getDayLabel(day: MonthDay) {
  if (day.status === 'available') return `${day.availableSlots} libres`
  if (day.status === 'full') return 'Complet'
  if (day.status === 'weekend') return 'Week-end'
  if (day.status === 'closed') return 'Ferme'
  return 'Passe'
}

function getSelectedDayMessage(status: DayStatus | undefined) {
  if (status === 'full') return 'Tous les creneaux de cette journee sont deja pris.'
  if (status === 'weekend') return 'Le psychologue ne consulte pas le week-end.'
  if (status === 'closed') return 'Le psychologue ne consulte pas ce jour-la.'
  if (status === 'past') return 'Cette date est deja passee.'

  return ''
}

function isSameMonth(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  )
}

export function StudentRendezvousPsyForm() {
  const router = useRouter()
  const today = useMemo(() => getTodayValue(), [])
  const initialMonth = useMemo(() => getMonthStart(new Date()), [])

  const [monthDate, setMonthDate] = useState(initialMonth)
  const [days, setDays] = useState<MonthDay[]>([])
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedDayStatus, setSelectedDayStatus] = useState<DayStatus>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [startTime, setStartTime] = useState('')
  const [reason, setReason] = useState('')
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal')
  const [isLoadingMonth, setIsLoadingMonth] = useState(false)
  const [isLoadingDay, setIsLoadingDay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadMonth() {
      setIsLoadingMonth(true)
      setError('')

      try {
        const response = await fetch(
          `/api/disponibilitespsy?year=${monthDate.getFullYear()}&month=${monthDate.getMonth() + 1}`,
        )
        const data = (await response.json()) as MonthResponse

        if (!isActive) return

        if (!response.ok) {
          setDays([])
          setError(data.error || 'Impossible de charger le calendrier.')
          return
        }

        const monthDays = data.days || []
        setDays(monthDays)

        const selectedInMonth = monthDays.find((day) => day.date === selectedDate)
        if (!selectedInMonth) {
          const firstSelectableDay =
            monthDays.find((day) => day.status === 'available') ||
            monthDays.find((day) => day.status !== 'past') ||
            monthDays[0]

          if (firstSelectableDay) {
            setSelectedDate(firstSelectableDay.date)
          }
        }
      } catch {
        if (isActive) {
          setDays([])
          setError('Impossible de charger le calendrier.')
        }
      } finally {
        if (isActive) {
          setIsLoadingMonth(false)
        }
      }
    }

    void loadMonth()

    return () => {
      isActive = false
    }
  }, [monthDate, selectedDate])

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

  function changeMonth(direction: -1 | 1) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1))
  }

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
      setMonthDate((current) => new Date(current))
    } catch {
      setError("Impossible d'envoyer la demande.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDateLabel = selectedDateFormatter.format(new Date(`${selectedDate}T00:00:00`))
  const selectedDayMessage = getSelectedDayMessage(selectedDayStatus)
  const gridOffset = getMonthGridOffset(monthDate)
  const availableSlots = slots.filter((slot) => slot.available)
  const hiddenUnavailableSlots = slots.length - availableSlots.length
  const selectedSlot = slots.find((slot) => slot.startTime === startTime)
  const canGoPreviousMonth = !isSameMonth(monthDate, initialMonth)
  const nextAvailableDay = days.find((day) => day.status === 'available' && day.date > selectedDate)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-violet-100 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={!canGoPreviousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-white text-[#2d1068] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10"
              title="Mois precedent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="text-lg font-bold capitalize text-[#2d1068] dark:text-foreground">
                {monthFormatter.format(monthDate)}
              </p>
              <p className="text-xs text-[#7A6A99] dark:text-muted-foreground">
                Choisis une journee dans le mois
              </p>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-white text-[#2d1068] transition hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10"
              title="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#7A6A99] dark:text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: gridOffset }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {isLoadingMonth ? (
              <div className="col-span-7 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-6 text-sm text-[#6E628F] dark:bg-white/[0.05] dark:text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                Chargement du calendrier...
              </div>
            ) : (
              days.map((day) => {
                const isSelected = selectedDate === day.date
                const disabled = day.status === 'past'

                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(day.date)}
                    className={`aspect-square rounded-2xl border p-1 text-center transition disabled:cursor-not-allowed ${getDayButtonClass(
                      day,
                      isSelected,
                    )}`}
                  >
                    <span className="block text-sm font-bold">{day.day}</span>
                    <span className="mt-1 block truncate text-[10px] leading-3">
                      {getDayLabel(day)}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
              Vert: libre
            </span>
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-700 dark:bg-red-500/10 dark:text-red-200">
              Rouge: complet
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
              Jaune: indisponible
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-white/10 dark:text-muted-foreground">
              Gris: passe
            </span>
          </div>
        </div>

        <div className="rounded-[24px] border border-violet-100 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-500/15">
              <CalendarDays className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-bold capitalize text-[#2d1068] dark:text-foreground">
                {selectedDateLabel}
              </p>
              <p className="text-sm text-[#7A6A99] dark:text-muted-foreground">
                {availableSlots.length > 0
                  ? `${availableSlots.length} horaire${availableSlots.length > 1 ? 's' : ''} restant${availableSlots.length > 1 ? 's' : ''}`
                  : 'Aucun horaire restant'}
              </p>
            </div>
          </div>

          {selectedDate === today ? (
            <div className="mb-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs font-medium leading-5 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-100">
              Journée passée
            </div>
          ) : null}

          {isLoadingDay ? (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-[#6E628F] dark:bg-white/[0.05] dark:text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              Chargement des horaires...
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {availableSlots.map((slot) => {
                const active = startTime === slot.startTime

                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    onClick={() => setStartTime(slot.startTime)}
                    className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition disabled:cursor-not-allowed ${
                      active
                        ? 'border-violet-400 bg-violet-500 text-white shadow-[0_12px_24px_rgba(139,92,246,0.22)]'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/15'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {slot.startTime}
                    </span>
                    <span className="mt-1 text-[11px]">
                      {slot.available ? 'Disponible' : 'Indisponible'}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-violet-200 bg-white/70 p-5 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-100">
                <Clock className="h-5 w-5" />
              </div>
              <p className="mt-4 font-semibold text-[#2d1068] dark:text-foreground">
                Aucun horaire disponible
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#6E628F] dark:text-muted-foreground">
                {selectedDayMessage ||
                  "Tous les horaires restants sont deja reserves ou la journee est terminee."}
              </p>
              {nextAvailableDay ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(nextAvailableDay.date)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Prochain jour libre
                  <MoveRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          )}

          {hiddenUnavailableSlots > 0 && availableSlots.length > 0 ? (
            <p className="mt-4 text-center text-xs font-medium text-[#7A6A99] dark:text-muted-foreground">
              Les horaires passes ou deja reserves ne sont pas affiches.
            </p>
          ) : null}
        </div>
      </div>

      {selectedSlot ? (
        <div className="rounded-[24px] border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm font-medium text-[#2d1068] dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-100">
          Rendez-vous selectionne : {selectedDateLabel} de {selectedSlot.startTime} a{' '}
          {selectedSlot.endTime}.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          <Label className="text-[#2d1068] dark:text-foreground">Urgence</Label>
          <Select
            value={urgency}
            onValueChange={(value) => setUrgency(value as 'normal' | 'urgent')}
          >
            <SelectTrigger className="h-12 rounded-2xl border-violet-100 bg-white/90 text-[#2d1068] dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground">
              <SelectValue placeholder="Niveau d'urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment-reason" className="text-[#2d1068] dark:text-foreground">
            Motif de la demande
          </Label>
          <Textarea
            id="appointment-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explique brievement pourquoi tu souhaites rencontrer le psychologue."
            className="min-h-32 rounded-2xl border-violet-100 bg-white/90 text-[#2d1068] dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:placeholder:text-muted-foreground"
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
