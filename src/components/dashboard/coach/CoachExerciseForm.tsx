'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type StudentOption = {
  id: number | string
  label: string
}

type CoachExerciseFormProps = {
  students: StudentOption[]
}

export function CoachExerciseForm({ students }: CoachExerciseFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const form = event.currentTarget
    const formData = new FormData(form)

    const payload = {
      studentId: formData.get('studentId'),
      title: formData.get('title'),
      instructions: formData.get('instructions'),
      reason: formData.get('reason'),
      dueDate: formData.get('dueDate'),
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/student_exercices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          setError(data?.error || "Impossible d'attribuer cet exercice.")
          return
        }

        form.reset()
        setSuccess('Exercice attribue avec succes.')
        router.refresh()
      } catch {
        setError('Erreur reseau pendant la creation de l exercice.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-dream-heading dark:text-white">
          Etudiant
        </label>
        <select
          name="studentId"
          required
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          disabled={pending}
        >
          <option value="">Choisir un etudiant</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-dream-heading dark:text-white">
          Titre
        </label>
        <input
          name="title"
          required
          placeholder="Exemple : Journal de gestion du stress"
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          disabled={pending}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-dream-heading dark:text-white">
          Consignes
        </label>
        <textarea
          name="instructions"
          required
          rows={4}
          placeholder="Expliquez ce que l'etudiant doit faire..."
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          disabled={pending}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-dream-heading dark:text-white">
          Raison
        </label>
        <textarea
          name="reason"
          rows={3}
          placeholder="Pourquoi cet exercice est utile pour cet etudiant ?"
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          disabled={pending}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-dream-heading dark:text-white">
          Echeance
        </label>
        <input
          name="dueDate"
          type="datetime-local"
          required
          className="rounded-2xl border border-border bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.06]"
          disabled={pending}
        />
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-400 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
      >
        {pending ? 'Attribution...' : "Attribuer l'exercice"}
      </button>
    </form>
  )
}
