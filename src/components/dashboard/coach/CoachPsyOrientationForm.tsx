'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'

import type { User } from '@/payload-types'
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

type CoachPsyOrientationFormProps = {
  students: Pick<User, 'email' | 'firstName' | 'id' | 'lastName'>[]
}

function getStudentName(student: Pick<User, 'email' | 'firstName' | 'lastName'>) {
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim()

  return fullName || student.email || 'Etudiant'
}

export function CoachPsyOrientationForm({ students }: CoachPsyOrientationFormProps) {
  const [studentId, setStudentId] = useState('')
  const [reason, setReason] = useState('')
  const [observation, setObservation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/psy-orientation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          observation,
          reason,
          studentId,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'envoyer l'orientation.")
      }

      setStudentId('')
      setReason('')
      setObservation('')
      setMessage("Orientation envoyee. L'etudiant va recevoir une notification et un email.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="mindly-stack-sm" onSubmit={handleSubmit}>
      <div className="student-psy-field">
        <Label className="student-psy-label">Etudiant</Label>
        <Select value={studentId} onValueChange={setStudentId}>
          <SelectTrigger className="student-psy-select-trigger">
            <SelectValue placeholder="Choisir un etudiant" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={String(student.id)}>
                {getStudentName(student)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="student-psy-field">
        <Label htmlFor="orientation-reason" className="student-psy-label">
          Motif d&apos;orientation
        </Label>
        <Textarea
          id="orientation-reason"
          value={reason}
          onChange={(eventChange) => setReason(eventChange.target.value)}
          placeholder="Ex: stress important, anxiete avant entretien, besoin de soutien..."
          className="student-psy-textarea"
          required
        />
      </div>

      <div className="student-psy-field">
        <Label htmlFor="orientation-observation" className="student-psy-label">
          Observation du coach
        </Label>
        <Textarea
          id="orientation-observation"
          value={observation}
          onChange={(eventChange) => setObservation(eventChange.target.value)}
          placeholder="Ajoutez une observation utile pour contextualiser la recommandation."
          className="student-psy-textarea"
        />
      </div>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {message ? (
        <div className="mindly-alert-success flex items-start gap-2 rounded-2xl p-3 text-sm font-medium">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <span>{message}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting || !studentId || !reason.trim()} className="w-fit">
        <Send className="h-4 w-4" />
        {isSubmitting ? 'Envoi...' : 'Orienter vers le psy'}
      </Button>
    </form>
  )
}
