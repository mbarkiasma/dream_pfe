'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

type StudentExerciseCheckinFormProps = {
  completed: boolean
  exerciseId: number | string
  missed?: boolean
}

export function StudentExerciseCheckinForm({
  completed,
  exerciseId,
  missed = false,
}: StudentExerciseCheckinFormProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.student.checkin.form')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    startTransition(async () => {
      try {
        const result = await fetch(`/api/student_exercices/${exerciseId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checked: true,
          }),
        })

        const data = await result.json().catch(() => null)

        if (!result.ok) {
          setError(data?.error || t('errorSubmit'))
          return
        }

        setSuccess(t('successSubmit'))
        router.refresh()
      } catch {
        setError(t('errorNetwork'))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
      <label className="text-sm font-semibold text-dream-heading dark:text-white">
        {t('label')}
      </label>
      <label className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dream-muted dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70">
        <input
          type="checkbox"
          checked={checked || completed}
          onChange={(event) => setChecked(event.target.checked)}
          disabled={pending || completed || missed}
          className="h-4 w-4"
        />
        <span>{t('checkboxLabel')}</span>
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}

      <button
        type="submit"
        disabled={pending || completed || missed || !checked}
        className="w-fit rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {missed
          ? t('btnMissed')
          : completed
            ? t('btnDone')
            : pending
              ? t('btnPending')
              : t('btnSubmit')}
      </button>
    </form>
  )
}
