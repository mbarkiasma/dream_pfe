'use client'

import { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Video,
  Wand2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Dream } from '@/payload-types'

type Props = {
  dreams: Dream[]
  weeklyUsed: number
  weeklyLimit: number
}

function getDreamVideoUrl(dream: Dream) {
  if (dream.videoAsset && typeof dream.videoAsset === 'object' && 'url' in dream.videoAsset) {
    return dream.videoAsset.url || dream.videoUrl || null
  }

  return dream.videoUrl || null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getStatusCopy(status: Dream['videoStatus']) {
  switch (status) {
    case 'ready':
      return {
        label: 'Pret',
        icon: CheckCircle2,
        badgeClass: 'student-dream-status student-dream-status-ready',
        smallBadgeClass: 'student-dream-status student-dream-status-small student-dream-status-ready',
        dotClass: 'student-dream-dot-ready',
        description: 'La video et le resume sont disponibles.',
      }
    case 'failed':
      return {
        label: 'Echec',
        icon: RefreshCw,
        badgeClass: 'student-dream-status student-dream-status-failed',
        smallBadgeClass: 'student-dream-status student-dream-status-small student-dream-status-failed',
        dotClass: 'student-dream-dot-failed',
        description: "La generation n'a pas abouti. Vous pouvez relancer un autre reve.",
      }
    case 'generating':
      return {
        label: 'Generation',
        icon: Loader2,
        badgeClass: 'student-dream-status student-dream-status-generating',
        smallBadgeClass:
          'student-dream-status student-dream-status-small student-dream-status-generating',
        dotClass: 'student-dream-dot-generating',
        description: 'Le workflow video est en cours de traitement.',
      }
    case 'waiting_validation':
      return {
        label: 'A valider',
        icon: Clock3,
        badgeClass: 'student-dream-status student-dream-status-validation',
        smallBadgeClass:
          'student-dream-status student-dream-status-small student-dream-status-validation',
        dotClass: 'student-dream-dot-validation',
        description: 'Le resume attend votre validation avant la generation video.',
      }
    default:
      return {
        label: 'En attente',
        icon: Clock3,
        badgeClass: 'student-dream-status student-dream-status-pending',
        smallBadgeClass: 'student-dream-status student-dream-status-small student-dream-status-pending',
        dotClass: 'student-dream-dot-pending',
        description: 'Le reve est en file avant generation.',
      }
  }
}

function getAnalysisCopy(dream: Dream) {
  if (dream.analysis?.trim()) {
    return dream.analysis.trim()
  }

  if (dream.videoStatus === 'failed') {
    return "L'analyse n'a pas pu etre generee pour ce reve. Vous pouvez en relancer un autre quand vous voulez."
  }

  if (dream.videoStatus === 'ready') {
    return "L'analyse n'est pas encore disponible pour ce reve."
  }

  return 'Aucune analyse disponible pour le moment.'
}

export function StudentDreamsClient({ dreams, weeklyUsed, weeklyLimit }: Props) {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    content: string
    date: string
    title: string
  } | null>(null)
  const [pending, startTransition] = useTransition()
  const deferredQuery = useDeferredValue(query)
  const hasDreamInProgress = dreams.some(
    (dream) => dream.videoStatus === 'pending' || dream.videoStatus === 'generating',
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedAnalysis) {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [selectedAnalysis])

  useEffect(() => {
    if (!hasDreamInProgress) {
      return
    }

    const interval = window.setInterval(() => {
      router.refresh()
    }, 5000)

    return () => window.clearInterval(interval)
  }, [hasDreamInProgress, router])

  const remaining = Math.max(weeklyLimit - weeklyUsed, 0)
  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const filteredDreams = normalizedQuery
    ? dreams.filter((dream) => {
        const haystack = [
          dream.description,
          dream.summary ?? '',
          dream.analysis ?? '',
          dream.videoStatus,
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(normalizedQuery)
      })
    : dreams

  const latestDream = filteredDreams[0] ?? dreams[0] ?? null
  const latestDreamVideoUrl = latestDream ? getDreamVideoUrl(latestDream) : null

  async function submitDream(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFeedback('')

    const trimmedDescription = description.trim()

    if (!trimmedDescription) {
      setError('Decrivez votre reve avant de lancer la generation.')
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/dreams-submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: trimmedDescription,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data?.error || "Impossible d'envoyer ce reve pour le moment.")
          return
        }

        setDescription('')
        setFeedback('Reve envoye. La video apparaitra ici des que le workflow termine.')
        router.refresh()
      } catch {
        setError("Une erreur reseau est survenue pendant l'envoi.")
      }
    })
  }

  function deleteDream(id: string | number) {
    setError('')
    setFeedback('')

    startTransition(async () => {
      try {
        const response = await fetch(`/api/dreams-delete/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setError(data?.message || data?.error || 'Suppression impossible pour le moment.')
          return
        }

        setFeedback('Le reve a ete supprime de votre journal.')
        router.refresh()
      } catch {
        setError('Une erreur reseau est survenue pendant la suppression.')
      }
    })
  }

  function validateDream(id: string | number) {
    setError('')
    setFeedback('')

    startTransition(async () => {
      try {
        const response = await fetch(`/api/dreams-validate/${id}`, {
          method: 'POST',
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setError(data?.message || data?.error || 'Validation impossible pour le moment.')
          return
        }

        setFeedback('Resume valide. La generation video va commencer.')
        router.refresh()
      } catch {
        setError('Une erreur reseau est survenue pendant la validation.')
      }
    })
  }

  function regenerateDream(id: string | number) {
    setError('')
    setFeedback('')

    startTransition(async () => {
      try {
        const response = await fetch(`/api/dreams-regenerate/${id}`, {
          method: 'POST',
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setError(data?.message || data?.error || 'Regeneration impossible pour le moment.')
          return
        }

        setFeedback('Une nouvelle analyse et un nouveau resume sont en cours de generation.')
        router.refresh()
      } catch {
        setError('Une erreur reseau est survenue pendant la regeneration.')
      }
    })
  }

  function openAnalysisModal(dream: Dream, content: string) {
    setSelectedAnalysis({
      content,
      date: formatDate(dream.createdAt),
      title: dream.summary?.trim() || dream.description.trim().slice(0, 80) || 'Analyse du reve',
    })
  }

  return (
    <div className="student-dreams-root">
      <section className="student-dreams-hero-grid">
        <Card className="student-dreams-card">
          <CardContent className="student-dreams-card-content">
            <div>
              <div className="student-dreams-eyebrow">
                <Moon />
                Journal de reves
              </div>

              <h2 className="student-dreams-title">
                Racontez votre reve, puis validez son resume.
              </h2>
              <p className="student-dreams-description">
                Decrivez simplement ce dont vous vous souvenez. L&apos;application prepare un resume
                et une analyse, puis lance la video apres votre validation.
              </p>
            </div>

            <form onSubmit={submitDream} className="student-dreams-form">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Exemple : J'etais dans une maison inconnue, je cherchais quelqu'un et je ressentais de la peur..."
                className="student-dreams-textarea"
                disabled={pending}
              />

              <div className="student-dreams-actions-row">
                <Button
                  type="submit"
                  disabled={pending || remaining === 0}
                  className="student-dreams-submit-button"
                >
                  {pending ? (
                    <>
                      <Loader2 />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Plus />
                      Envoyer le reve
                    </>
                  )}
                </Button>

                <div className="student-dreams-limits">
                  <span className="student-dreams-limit-neutral">
                    {weeklyUsed}/{weeklyLimit} reves cette semaine
                  </span>
                  <span className="student-dreams-limit-active">
                    Encore {remaining} possible{remaining > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {feedback ? <p className="student-dreams-feedback">{feedback}</p> : null}
              {error ? <p className="student-dreams-error">{error}</p> : null}
            </form>
          </CardContent>
        </Card>

        <Card className="student-dreams-card">
          <CardContent className="student-dreams-preview-content">
            <div className="student-dreams-preview-header">
              <div>
                <p className="student-dreams-small-label">Apercu video</p>
                <h3 className="student-dreams-preview-title">
                  {latestDream ? 'Dernier reve' : 'Aucune video encore'}
                </h3>
              </div>
              <div className="student-dreams-icon-box">
                <Sparkles />
              </div>
            </div>

            <div className="student-dreams-video-frame">
              {latestDreamVideoUrl ? (
                <video
                  key={latestDreamVideoUrl}
                  controls
                  className="student-dreams-video"
                  src={latestDreamVideoUrl}
                />
              ) : (
                <div className="student-dreams-video-empty">
                  <div className="student-dreams-video-empty-inner">
                    <Video />
                    <p>
                      {latestDream?.errorMessage ||
                        (latestDream
                          ? getStatusCopy(latestDream.videoStatus).description
                          : 'La video apparaitra ici apres validation du resume.')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {latestDream ? (
              <div className="student-dreams-latest-box">
                <div className="student-dreams-latest-header">
                  <p className="student-dreams-date">{formatDate(latestDream.createdAt)}</p>
                  {(() => {
                    const statusCopy = getStatusCopy(latestDream.videoStatus)
                    const StatusIcon = statusCopy.icon
                    return (
                      <span className={statusCopy.badgeClass}>
                        <StatusIcon />
                        {statusCopy.label}
                      </span>
                    )
                  })()}
                </div>
                <p className="student-dreams-latest-text">
                  {latestDream.summary || latestDream.description}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="student-dreams-journal-header">
        <div className="student-dreams-journal-inner">
          <div>
            <p className="student-dreams-small-label">Journal</p>
            <h2 className="student-dreams-journal-title">
              {filteredDreams.length} reve{filteredDreams.length > 1 ? 's' : ''} conserve
              {filteredDreams.length > 1 ? 's' : ''}
            </h2>
          </div>

          <div className="student-dreams-search-box">
            <Search />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un resume, statut, mot-cle..."
              className="student-dreams-search-input"
            />
          </div>
        </div>
      </section>

      <div className="student-dreams-timeline">
        {filteredDreams.length > 0 ? (
          filteredDreams.map((dream, index) => {
            const statusCopy = getStatusCopy(dream.videoStatus)
            const StatusIcon = statusCopy.icon
            const dreamVideoUrl = getDreamVideoUrl(dream)
            const analysisCopy = getAnalysisCopy(dream)
            const canExpandAnalysis = analysisCopy.length > 260

            return (
              <Card key={dream.id} className="student-dreams-card-soft student-dreams-entry-card">
                <div className="student-dreams-entry-index">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <CardContent className="student-dreams-entry-content">
                  <div className="student-dreams-entry-grid">
                    <div className="student-dreams-entry-video">
                      {dreamVideoUrl ? (
                        <video
                          key={dreamVideoUrl}
                          controls
                          className="student-dreams-video"
                          src={dreamVideoUrl}
                        />
                      ) : (
                        <div className="student-dreams-video-empty">
                          <div>
                            <Video />
                            {dream.errorMessage || statusCopy.description}
                          </div>
                        </div>
                      )}

                      <div className="student-dreams-video-footer">
                        <span className="student-dreams-date">{formatDate(dream.createdAt)}</span>
                        <span className={statusCopy.smallBadgeClass}>
                          <StatusIcon />
                          {statusCopy.label}
                        </span>
                      </div>
                    </div>

                    <div className="student-dreams-entry-body">
                      <div className="student-dreams-entry-top">
                        <div className="student-dreams-entry-heading">
                          <div className="student-dreams-summary-card">
                            <p className="student-dreams-summary-label">
                              <Sparkles />
                              Resume du reve
                            </p>
                            <p className="student-dreams-summary-text">
                              {dream.summary || 'Reve en cours de lecture'}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="student-dreams-delete-button"
                            onClick={() => deleteDream(dream.id)}
                            disabled={pending}
                          >
                            <Trash2 />
                            Supprimer
                          </Button>
                        </div>

                        {dream.videoStatus === 'waiting_validation' ? (
                          <div className="student-dreams-validation-box">
                            <Button
                              type="button"
                              className="student-dreams-action-primary"
                              onClick={() => validateDream(dream.id)}
                              disabled={pending}
                            >
                              Valider le resume
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              className="student-dreams-action-secondary"
                              onClick={() => regenerateDream(dream.id)}
                              disabled={pending}
                            >
                              Refaire le resume
                            </Button>
                          </div>
                        ) : null}

                        <div className="student-dreams-info-grid">
                          <div className="student-dreams-info-box">
                            <p className="student-dreams-info-title">
                              <Moon />
                              Description
                            </p>
                            <p className="student-dreams-info-text">{dream.description}</p>
                          </div>

                          <div className="student-dreams-analysis-box">
                            <p className="student-dreams-info-title">
                              <Wand2 />
                              Analyse
                            </p>
                            <p className="student-dreams-info-text">{analysisCopy}</p>

                            {canExpandAnalysis ? (
                              <button
                                type="button"
                                onClick={() => openAnalysisModal(dream, analysisCopy)}
                                className="student-dreams-see-more"
                              >
                                Voir plus
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="student-dreams-entry-actions">
                        {dreamVideoUrl ? (
                          <a
                            href={dreamVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="student-dreams-video-link"
                          >
                            Ouvrir la video
                            <ExternalLink />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="student-dreams-empty-card">
            <CardContent className="student-dreams-empty-content">
              Aucun reve ne correspond a votre recherche pour le moment.
            </CardContent>
          </Card>
        )}
      </div>

      {mounted && selectedAnalysis ? createPortal(
        <div
          className="mindly-modal-backdrop student-dreams-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnalysis(null)}
        >
          <div
            className="student-dreams-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-dreams-modal-header">
              <div className="student-dreams-modal-heading">
                <div>
                  <p className="student-dreams-small-label">Analyse du reve</p>
                  <h3 className="student-dreams-modal-title">{selectedAnalysis.title}</h3>
                  <p className="student-dreams-modal-date">
                    Cree le {selectedAnalysis.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="student-dreams-modal-close"
                  aria-label="Fermer l'analyse"
                >
                  <X />
                </button>
              </div>
            </div>

            <div className="student-dreams-modal-body">
              <div className="student-dreams-modal-content">
                <p className="student-dreams-modal-text">{selectedAnalysis.content}</p>
              </div>
            </div>

            <div className="student-dreams-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="student-dreams-modal-close-main"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
