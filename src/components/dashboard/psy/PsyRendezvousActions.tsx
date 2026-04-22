'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, X } from 'lucide-react'

import { Textarea } from '@/components/ui/textarea'

type PsyRendezvousActionsProps = {
  appointmentId: number | string
  status: string
}

type ActionStatus = 'confirmed' | 'rejected' | 'completed'

export function PsyRendezvousActions({ appointmentId, status }: PsyRendezvousActionsProps) {
  const router = useRouter()
  const [loadingStatus, setLoadingStatus] = useState<ActionStatus | null>(null)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')

  async function updateStatus(nextStatus: ActionStatus, reason?: string) {
    setLoadingStatus(nextStatus)
    setError('')

    try {
      const response = await fetch('/api/rendezvouspsy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointmentId,
          rejectionReason: reason,
          status: nextStatus,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(data.error || 'Impossible de mettre a jour le rendez-vous.')
        return
      }

      router.refresh()
      setIsRejecting(false)
      setRejectionReason('')
    } catch {
      setError('Impossible de mettre a jour le rendez-vous.')
    } finally {
      setLoadingStatus(null)
    }
  }

  function handleReject() {
    if (!rejectionReason.trim()) {
      setError("Indique la cause du refus avant d'envoyer.")
      return
    }

    void updateStatus('rejected', rejectionReason.trim())
  }

  return (
    <div className="mt-4 space-y-2">
      {status === 'pending' ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateStatus('confirmed')}
            disabled={loadingStatus !== null}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {loadingStatus === 'confirmed' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Confirmer
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRejecting((current) => !current)
              setError('')
            }}
            disabled={loadingStatus !== null}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Refuser
          </button>
        </div>
      ) : null}

      {status === 'pending' && isRejecting ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
          <label className="mb-2 block text-sm font-semibold text-red-700">
            Cause du refus
          </label>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Exemple : indisponibilite exceptionnelle, merci de choisir un autre creneau."
            className="min-h-24 rounded-2xl border-red-100 bg-white text-[#2d1068]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReject}
              disabled={loadingStatus !== null}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
            >
              {loadingStatus === 'rejected' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Envoyer le refus
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRejecting(false)
                setRejectionReason('')
                setError('')
              }}
              disabled={loadingStatus !== null}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : null}

      {status === 'confirmed' ? (
        <button
          type="button"
          onClick={() => updateStatus('completed')}
          disabled={loadingStatus !== null}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-60"
        >
          {loadingStatus === 'completed' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Marquer comme termine
        </button>
      ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  )
}
