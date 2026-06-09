'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, MapPin, Video, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type PsyRendezvousActionsProps = {
  appointmentId: number | string
  status: string
}

type ActionStatus = 'confirmed' | 'rejected' | 'completed'
type Modality = 'presentiel' | 'en_ligne'

export function PsyRendezvousActions({ appointmentId, status }: PsyRendezvousActionsProps) {
  const router = useRouter()
  const t = useTranslations('dashboard.psy.actions')
  const [loadingStatus, setLoadingStatus] = useState<ActionStatus | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [modality, setModality] = useState<Modality | null>(null)
  const [teamsUrl, setTeamsUrl] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')

  async function updateStatus(
    nextStatus: ActionStatus,
    options?: { modality?: Modality; teamsJoinUrl?: string; rejectionReason?: string },
  ) {
    setLoadingStatus(nextStatus)
    setError('')

    try {
      const response = await fetch('/api/rendezvouspsy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          status: nextStatus,
          modality: options?.modality,
          teamsJoinUrl: options?.teamsJoinUrl,
          rejectionReason: options?.rejectionReason,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setError(data.error || t('errorUpdate'))
        return
      }

      router.refresh()
      setIsConfirming(false)
      setIsRejecting(false)
      setModality(null)
      setTeamsUrl('')
      setRejectionReason('')
    } catch {
      setError(t('errorUpdate'))
    } finally {
      setLoadingStatus(null)
    }
  }

  function handleConfirm() {
    if (!modality) {
      setError('Veuillez choisir la modalite du rendez-vous.')
      return
    }
    if (modality === 'en_ligne' && !teamsUrl.trim()) {
      setError('Veuillez saisir le lien Microsoft Teams.')
      return
    }
    void updateStatus('confirmed', { modality, teamsJoinUrl: teamsUrl.trim() })
  }

  function handleReject() {
    if (!rejectionReason.trim()) {
      setError(t('errorReason'))
      return
    }
    void updateStatus('rejected', { rejectionReason: rejectionReason.trim() })
  }

  return (
    <div className="dream-action-stack">
      {status === 'pending' && !isConfirming && !isRejecting ? (
        <div className="dream-action-row">
          <Button
            type="button"
            variant="success"
            size="pill"
            onClick={() => { setIsConfirming(true); setError('') }}
            disabled={loadingStatus !== null}
          >
            <Check className="dream-action-icon" />
            {t('confirm')}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="pill"
            onClick={() => { setIsRejecting(true); setError('') }}
            disabled={loadingStatus !== null}
          >
            <X className="dream-action-icon" />
            {t('reject')}
          </Button>
        </div>
      ) : null}

      {status === 'pending' && isConfirming ? (
        <div className="dream-danger-panel space-y-3">
          <p className="dream-danger-label">Type du rendez-vous</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setModality('presentiel'); setTeamsUrl('') }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                modality === 'presentiel'
                  ? 'border-[var(--mindly-primary)] bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]'
                  : 'border-[var(--mindly-border)] text-[var(--mindly-purple-muted)] hover:border-[var(--mindly-primary)]'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Presentiel
            </button>

            <button
              type="button"
              onClick={() => setModality('en_ligne')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                modality === 'en_ligne'
                  ? 'border-[var(--mindly-primary)] bg-[var(--mindly-primary-soft-3)] text-[var(--mindly-primary)]'
                  : 'border-[var(--mindly-border)] text-[var(--mindly-purple-muted)] hover:border-[var(--mindly-primary)]'
              }`}
            >
              <Video className="h-4 w-4" />
              En ligne
            </button>
          </div>

          {modality === 'en_ligne' ? (
            <div className="space-y-1">
              <label className="dream-danger-label">Lien Microsoft Teams</label>
              <Input
                type="url"
                value={teamsUrl}
                onChange={(e) => setTeamsUrl(e.target.value)}
                placeholder="https://teams.microsoft.com/l/meetup-join/..."
                className="dream-field"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="success"
              size="pill"
              onClick={handleConfirm}
              disabled={loadingStatus !== null || !modality}
            >
              {loadingStatus === 'confirmed' ? (
                <Loader2 className="dream-action-icon animate-spin" />
              ) : (
                <Check className="dream-action-icon" />
              )}
              Confirmer
            </Button>

            <Button
              type="button"
              variant="dreamOutline"
              size="pill"
              onClick={() => { setIsConfirming(false); setModality(null); setTeamsUrl(''); setError('') }}
              disabled={loadingStatus !== null}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : null}

      {status === 'pending' && isRejecting ? (
        <div className="dream-danger-panel">
          <label className="dream-danger-label">{t('rejectionLabel')}</label>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('rejectionPlaceholder')}
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
                <Loader2 className="dream-action-icon animate-spin" />
              ) : (
                <X className="dream-action-icon" />
              )}
              {t('sendRejection')}
            </Button>
            <Button
              type="button"
              variant="dreamOutline"
              size="pill"
              onClick={() => { setIsRejecting(false); setRejectionReason(''); setError('') }}
              disabled={loadingStatus !== null}
            >
              {t('cancel')}
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
            <Loader2 className="dream-action-icon animate-spin" />
          ) : (
            <Check className="dream-action-icon" />
          )}
          {t('markCompleted')}
        </Button>
      ) : null}

      {error ? <p className="dream-danger-message">{error}</p> : null}
    </div>
  )
}
