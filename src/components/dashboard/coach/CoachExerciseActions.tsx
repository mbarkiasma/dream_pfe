'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'

type CoachExerciseActionsProps = {
  exercise: {
    coachFeedback?: string | null
    dueDate?: string | null
    id: number | string
    instructions: string
    reason?: string | null
    status: string
    title: string
  }
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function CoachExerciseActions({ exercise }: CoachExerciseActionsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, startTransition] = useTransition()
  const isReviewing = exercise.status === 'completed'

  function resetMessages() {
    setError('')
    setSuccess('')
  }

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetMessages()

    const formData = new FormData(event.currentTarget)

    const payload = {
      coachFeedback: formData.get('coachFeedback'),
      dueDate: formData.get('dueDate'),
      instructions: formData.get('instructions'),
      reason: formData.get('reason'),
      title: formData.get('title'),
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/student_exercices/${exercise.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          setError(data?.error || "Impossible de modifier l'exercice.")
          return
        }

        setSuccess(isReviewing ? 'Feedback envoyé. Progression validée.' : 'Exercice modifié.')
        setIsEditing(false)
        router.refresh()
      } catch {
        setError('Erreur réseau pendant la modification.')
      }
    })
  }

  function handleFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetMessages()

    const formData = new FormData(event.currentTarget)
    const coachFeedback = String(formData.get('coachFeedback') || '').trim()

    if (!coachFeedback) {
      setError('Le feedback du coach est obligatoire.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/student_exercices/${exercise.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'feedback',
            coachFeedback,
          }),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          setError(data?.error || "Impossible d'envoyer le feedback.")
          return
        }

        setSuccess("Feedback envoyé. L'étudiant a été notifié.")
        setIsFeedbackOpen(false)
        router.refresh()
      } catch {
        setError("Erreur réseau pendant l'envoi du feedback.")
      }
    })
  }

  function handleDelete() {
    resetMessages()

    startTransition(async () => {
      try {
        const response = await fetch(`/api/student_exercices/${exercise.id}`, {
          method: 'DELETE',
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          setError(data?.error || "Impossible de supprimer l'exercice.")
          setShowDeleteConfirm(false)
          return
        }

        setShowDeleteConfirm(false)
        router.refresh()
      } catch {
        setError('Erreur réseau pendant la suppression.')
      }
    })
  }

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            resetMessages()
            if (isReviewing) {
              setIsFeedbackOpen((current) => !current)
              setIsEditing(false)
              return
            }

            setIsEditing((current) => !current)
            setIsFeedbackOpen(false)
          }}
          disabled={pending}
          className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-dream-heading transition hover:bg-white dark:border-white/10 dark:text-white"
        >
          {isEditing || isFeedbackOpen ? 'Annuler' : isReviewing ? 'Donner feedback' : 'Modifier'}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={pending}
          className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          Supprimer
        </button>
      </div>

      {isFeedbackOpen ? (
        <form
          onSubmit={handleFeedback}
          className="grid gap-3 rounded-2xl bg-white p-4 dark:bg-white/[0.04]"
        >
          <label className="text-sm font-semibold text-dream-heading dark:text-white">
            Feedback pour l&apos;étudiant
          </label>
          <textarea
            name="coachFeedback"
            defaultValue={exercise.coachFeedback || ''}
            rows={4}
            placeholder="Écrivez votre feedback ici..."
            required
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          />
          <p className="text-xs leading-5 text-dream-muted dark:text-white/60">
            L'étudiant recevra une notification après l'envoi.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
          >
            {pending ? 'Envoi...' : 'Envoyer le feedback'}
          </button>
        </form>
      ) : null}

      {isEditing ? (
        <form
          onSubmit={handleUpdate}
          className="grid gap-3 rounded-2xl bg-white p-4 dark:bg-white/[0.04]"
        >
          <input
            name="title"
            defaultValue={exercise.title}
            required
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          />
          <textarea
            name="instructions"
            defaultValue={exercise.instructions}
            required
            rows={4}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          />
          <textarea
            name="reason"
            defaultValue={exercise.reason || ''}
            rows={3}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          />
          <input
            name="dueDate"
            type="datetime-local"
            defaultValue={toDateTimeLocal(exercise.dueDate)}
            required
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          />
          <textarea
            name="coachFeedback"
            defaultValue={exercise.coachFeedback || ''}
            rows={3}
            placeholder={
              isReviewing ? 'Feedback obligatoire pour valider la progression' : 'Feedback du coach'
            }
            required={isReviewing}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          />

          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
          >
            {pending ? 'Enregistrement...' : isReviewing ? 'Valider la progression' : 'Enregistrer'}
          </button>
        </form>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}

      {showDeleteConfirm
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
            >
              <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#20163a]">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-500">
                  Confirmation
                </p>
                <h3 className="mt-3 text-2xl font-bold text-dream-heading dark:text-white">
                  Supprimer cet exercice ?
                </h3>
                <p className="mt-3 text-sm leading-6 text-dream-muted dark:text-white/70">
                  Cette action retire l'exercice de lespace du coach et de
                  l'étudiant.
                </p>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={pending}
                    className="rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-dream-heading transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pending}
                    className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
