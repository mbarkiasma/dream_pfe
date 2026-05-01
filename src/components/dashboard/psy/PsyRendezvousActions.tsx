'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
    <div className="dream-action-stack">
      {status === 'pending' ? (
        <div className="dream-action-row">
          <Button
            type="button"
            variant="success"
            size="pill"
            onClick={() => updateStatus('confirmed')}
            disabled={loadingStatus !== null}
          >
            {loadingStatus === 'confirmed' ? (
              <Loader2 className="dream-action-icon" />
            ) : (
              <Check className="dream-action-icon" />
            )}
            Confirmer
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="pill"
            onClick={() => {
              setIsRejecting((current) => !current)
              setError('')
            }}
            disabled={loadingStatus !== null}
          >
            <X className="dream-action-icon" />
            Refuser
          </Button>
        </div>
      ) : null}

      {status === 'pending' && isRejecting ? (
        <div className="dream-danger-panel">
          <label className="dream-danger-label">Cause du refus</label>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Exemple : indisponibilite exceptionnelle, merci de choisir un autre creneau."
            className="dream-field dream-action-textarea"
          />
          <div className="dream-action-row-spaced">
            <Button
              type="button"
              variant="destructive"
              size="pill"
              onClick={handleReject}
              disabled={loadingStatus !== null}
            >
              {loadingStatus === 'rejected' ? (
                <Loader2 className="dream-action-icon" />
              ) : (
                <X className="dream-action-icon" />
              )}
              Envoyer le refus
            </Button>
            <Button
              type="button"
              variant="dreamOutline"
              size="pill"
              onClick={() => {
                setIsRejecting(false)
                setRejectionReason('')
                setError('')
              }}
              disabled={loadingStatus !== null}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : null}

      {status === 'confirmed' ? (
        <Button
          type="button"
          variant="dream"
          size="pill"
          onClick={() => updateStatus('completed')}
          disabled={loadingStatus !== null}
        >
          {loadingStatus === 'completed' ? (
            <Loader2 className="dream-action-icon" />
          ) : (
            <Check className="dream-action-icon" />
          )}
          Marquer comme termine
        </Button>
      ) : null}

      {error ? <p className="dream-danger-message">{error}</p> : null}
    </div>
  )
}
