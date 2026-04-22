'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Loader2, Send } from 'lucide-react'

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
    return 'border-violet-500 bg-violet-500 text-white shadow-[0_12px_24px_rgba(139,92,246,0.22)]'
  }

  if (day.status === 'available') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
  }

  if (day.status === 'full') {
    return 'border-red-200 bg-red-50 text-red-700 hover:border-red-300'
  }

  if (day.status === 'weekend' || day.status === 'closed') {
    return 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300'
  }

  return 'border-slate-200 bg-slate-100 text-slate-400'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-violet-100 bg-white/80 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-white text-[#2d1068] transition hover:bg-violet-50"
              title="Mois precedent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="text-lg font-bold capitalize text-[#2d1068]">
                {monthFormatter.format(monthDate)}
              </p>
              <p className="text-xs text-[#7A6A99]">Choisis une journee dans le mois</p>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-100 bg-white text-[#2d1068] transition hover:bg-violet-50"
              title="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#7A6A99]">
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: gridOffset }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {isLoadingMonth ? (
              <div className="col-span-7 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-6 text-sm text-[#6E628F]">
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
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Vert: libre</span>
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Rouge: complet</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              Jaune: indisponible
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
              Gris: passe
            </span>
          </div>
        </div>

        <div className="rounded-[24px] border border-violet-100 bg-white/80 p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-2xl bg-violet-100 p-3">
              <CalendarDays className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-bold capitalize text-[#2d1068]">{selectedDateLabel}</p>
              <p className="text-sm text-[#7A6A99]">Horaires de consultation</p>
            </div>
          </div>

          {isLoadingDay ? (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-[#6E628F]">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              Chargement des horaires...
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot) => {
                const active = startTime === slot.startTime

                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setStartTime(slot.startTime)}
                    className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition disabled:cursor-not-allowed ${
                      active
                        ? 'border-violet-400 bg-violet-500 text-white shadow-[0_12px_24px_rgba(139,92,246,0.22)]'
                        : slot.available
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
                          : 'border-red-100 bg-red-50 text-red-400 opacity-80'
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
            <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-700">
              {selectedDayMessage || 'Aucun horaire disponible pour cette date.'}
            </div>
          )}

          {selectedDayMessage && slots.length > 0 ? (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {selectedDayMessage}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          <Label className="text-[#2d1068]">Urgence</Label>
          <Select value={urgency} onValueChange={(value) => setUrgency(value as 'normal' | 'urgent')}>
            <SelectTrigger className="h-12 rounded-2xl border-violet-100 bg-white/90 text-[#2d1068]">
              <SelectValue placeholder="Niveau d'urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointment-reason" className="text-[#2d1068]">
            Motif de la demande
          </Label>
          <Textarea
            id="appointment-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explique brievement pourquoi tu souhaites rencontrer le psychologue."
            className="min-h-32 rounded-2xl border-violet-100 bg-white/90 text-[#2d1068]"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
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
