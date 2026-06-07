'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, Send } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

function buildAgendaDays(startDate: Date, count: number, locale: string) {
  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'short' })

  return Array.from({ length: count }, (_, index) => {
    const date = addDays(startDate, index)

    return {
      date: formatDateValue(date),
      dayName: dayFormatter.format(date).replace('.', ''),
      dayNumber: String(date.getDate()).padStart(2, '0'),
      monthName: monthFormatter.format(date).replace('.', ''),
    }
  })
}

function getDateLabel(dateValue: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`))
}

function getDateInputLabel(dateValue: string) {
  const [year, month, day] = dateValue.split('-')

  if (!year || !month || !day) return dateValue

  return `${day}/${month}/${year}`
}

function getAgendaStatusClass(day: AgendaDay, isSelected: boolean) {
  const classes = ['student-psy-day-button-status']

  if (day.status === 'available') classes.push('student-psy-day-available')
  else if (day.status === 'full') classes.push('student-psy-day-full')
  else if (day.status === 'weekend') classes.push('student-psy-day-weekend')
  else if (day.status === 'past') classes.push('student-psy-day-past')
  else classes.push('student-psy-day-closed')

  if (isSelected) classes.push('student-psy-day-active')

  return classes.join(' ')
}

export function StudentRendezvousPsyForm() {
  const t = useTranslations('dashboard.student.appointments.form')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orientationId = searchParams.get('orientationId')
  const isCoachReferral = Boolean(orientationId)
  const agendaScrollRef = useRef<HTMLDivElement>(null)
  const today = useMemo(() => formatDateValue(new Date()), [])
  const agendaDates = useMemo(() => buildAgendaDays(new Date(), 14, locale), [locale])

  const [agendaDays, setAgendaDays] = useState<AgendaDay[]>([])
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedDayStatus, setSelectedDayStatus] = useState<DayStatus>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [startTime, setStartTime] = useState('')
  const [reason, setReason] = useState('')
  const [isLoadingDay, setIsLoadingDay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function getAgendaStatusLabel(day: AgendaDay) {
    if (day.status === 'available') return t('agendaStatusAvailable', { count: day.availableSlots })
    if (day.status === 'full') return t('agendaStatusFull')
    if (day.status === 'weekend') return t('agendaStatusWeekend')
    if (day.status === 'closed') return t('agendaStatusClosed')
    return t('agendaStatusPast')
  }

  function getSelectedDayMessage(status: DayStatus | undefined) {
    if (status === 'full') return t('dayMessageFull')
    if (status === 'weekend') return t('dayMessageWeekend')
    if (status === 'closed') return t('dayMessageClosed')
    if (status === 'past') return t('dayMessagePast')
    return t('dayMessageDefault')
  }

  useEffect(() => {
    let isActive = true

    async function loadOrientation() {
      if (!orientationId) return

      try {
        const response = await fetch(`/api/psy-orientation/${orientationId}`)
        const data = await response.json().catch(() => ({}))

        if (!isActive || !response.ok) return

        setReason(data.orientation.reason || '')
      } catch {
        // Keep the standard appointment form if the orientation cannot be loaded.
      }
    }

    void loadOrientation()

    return () => {
      isActive = false
    }
  }, [orientationId])

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
          setError(data.error || t('errorLoadSlots'))
          return
        }

        setSlots(data.slots || [])
        setSelectedDayStatus(data.status)
      } catch {
        if (isActive) {
          setSlots([])
          setSelectedDayStatus(undefined)
          setError(t('errorLoadSlots'))
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
  }, [selectedDate, t])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!startTime || !reason.trim()) {
      setError(t('errorSubmitValidation'))
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
          orientationId,
          startTime,
          reason,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(data.error || t('errorSubmit'))
        return
      }

      setMessage(t('success'))
      setReason('')
      setStartTime('')
      router.refresh()
    } catch {
      setError(t('errorSubmit'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function scrollAgenda(direction: 'left' | 'right') {
    agendaScrollRef.current?.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -240 : 240,
    })
  }

  const availableSlots = slots.filter((slot) => slot.available)
  const selectedSlot = slots.find((slot) => slot.startTime === startTime)
  const hiddenUnavailableSlots = slots.length - availableSlots.length
  const selectedAgendaDay = agendaDays.find((day) => day.date === selectedDate)

  const slotCountLabel = availableSlots.length === 0
    ? t('slotCountZero')
    : t('slotCount', { count: availableSlots.length })

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
                <p className="student-psy-card-label">{t('agendaLabel')}</p>
                <p className="student-psy-card-title">{t('agendaTitle')}</p>
              </div>
            </div>
          </div>

          <div className="student-psy-card-body">
            <div className="student-psy-days-carousel">
              <button
                type="button"
                className="student-psy-days-arrow"
                aria-label={t('prevDaysAriaLabel')}
                onClick={() => scrollAgenda('left')}
              >
                <ChevronLeft />
              </button>

              <div className="student-psy-days-scroll" ref={agendaScrollRef}>
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

              <button
                type="button"
                className="student-psy-days-arrow"
                aria-label={t('nextDaysAriaLabel')}
                onClick={() => scrollAgenda('right')}
              >
                <ChevronRight />
              </button>
            </div>

            <div className="student-psy-field student-psy-field-spaced">
              <Label htmlFor="appointment-date" className="student-psy-label">
                {t('otherDate')}
              </Label>
              <div className="student-psy-date-input-wrap">
                <Input
                  id="appointment-date"
                  min={today}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  type="date"
                  value={selectedDate}
                  className="student-psy-input student-psy-date-input"
                />
                <span className="student-psy-date-input-value">
                  {getDateInputLabel(selectedDate)}
                </span>
              </div>
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
                <p className="student-psy-selected-date">{getDateLabel(selectedDate, locale)}</p>
                <p className="student-psy-selected-count">
                  {selectedAgendaDay
                    ? getAgendaStatusLabel(selectedAgendaDay)
                    : slotCountLabel}
                </p>
              </div>
            </div>
          </div>

          {isLoadingDay ? (
            <div className="student-psy-loading">
              <Loader2 className="animate-spin" />
              {t('loading')}
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
                      <span className="student-psy-slot-caption">{t('slotCaption')}</span>
                    </span>

                    <span className="student-psy-slot-badge">
                      {active ? t('slotBadgeChosen') : t('slotBadgeFree')}
                    </span>
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="student-psy-empty-slots">
              <div className="student-psy-empty-icon">
                <Clock />
              </div>
              <p className="student-psy-empty-title">{t('noSlotTitle')}</p>
              <p className="student-psy-empty-text">
                {getSelectedDayMessage(selectedDayStatus)}
              </p>
            </div>
          )}

          {hiddenUnavailableSlots > 0 && availableSlots.length > 0 ? (
            <p className="student-psy-hidden-note">{t('hiddenNote')}</p>
          ) : null}
        </section>
      </div>

      {selectedSlot ? (
        <div className="student-psy-selected-box">
          {t('selectedBox', {
            date: getDateLabel(selectedDate, locale),
            start: selectedSlot.startTime,
            end: selectedSlot.endTime,
          })}
        </div>
      ) : null}

      <div className="student-psy-details-grid">
        <div className="student-psy-field">
          <Label className="student-psy-label">{t('urgencyLabel')}</Label>
          {orientationId ? (
            <div className="student-psy-selected-box">{t('urgencyHigh')}</div>
          ) : (
            <div className="student-psy-selected-box">{t('urgencyNormal')}</div>
          )}
        </div>

        <div className="student-psy-field">
          <Label htmlFor="appointment-reason" className="student-psy-label">
            {t('reasonLabel')}
          </Label>
          <Textarea
            id="appointment-reason"
            value={reason}
            onChange={(event) => {
              if (!isCoachReferral) {
                setReason(event.target.value)
              }
            }}
            placeholder={t('reasonPlaceholder')}
            readOnly={isCoachReferral}
            aria-readonly={isCoachReferral}
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
        {t('btnSubmit')}
      </Button>
    </form>
  )
}
