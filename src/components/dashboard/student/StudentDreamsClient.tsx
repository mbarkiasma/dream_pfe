'use client'

import { useDeferredValue, useEffect, useState, useTransition } from 'react'
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
        badgeClass: 'border-border bg-dream-softer text-dream-accent',
        dotClass: 'bg-violet-400',
        description: 'La video et le resume sont disponibles.',
      }
    case 'failed':
      return {
        label: 'Echec',
        icon: RefreshCw,
        badgeClass: 'border-border bg-white text-dream-accent',
        dotClass: 'bg-violet-300',
        description: "La generation n'a pas abouti. Vous pouvez relancer un autre reve.",
      }
    case 'generating':
      return {
        label: 'Generation',
        icon: Loader2,
        badgeClass: 'border-border bg-dream-highlight text-dream-accent',
        dotClass: 'bg-violet-400',
        description: 'Le workflow video est en cours de traitement.',
      }
    case 'waiting_validation':
      return {
        label: 'A valider',
        icon: Clock3,
        badgeClass: 'border-border bg-dream-highlight text-dream-accent',
        dotClass: 'bg-violet-400',
        description: 'Le resume attend votre validation avant la generation video.',
      }
    default:
      return {
        label: 'En attente',
        icon: Clock3,
        badgeClass: 'border-border bg-white text-dream-muted',
        dotClass: 'bg-violet-200',
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
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.7fr)]">
        <Card className="overflow-hidden rounded-[32px] border border-border bg-card/85 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardContent className="p-5 md:p-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-dream-highlight px-3 py-1.5 text-xs font-semibold text-dream-accent dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
                <Moon className="h-3.5 w-3.5" />
                Journal de reves
              </div>

              <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.025em] text-dream-heading dark:text-foreground">
                Racontez votre reve, puis validez son resume.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-dream-muted dark:text-muted-foreground">
                Decrivez simplement ce dont vous vous souvenez. L&apos;application prepare un resume
                et une analyse, puis lance la video apres votre validation.
              </p>
            </div>

            <form onSubmit={submitDream} className="mt-7 space-y-4">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Exemple : J'etais dans une maison inconnue, je cherchais quelqu'un et je ressentais de la peur..."
                className="min-h-[156px] resize-none rounded-[24px] border border-border bg-white px-5 py-4 text-base leading-8 text-dream-heading shadow-inner placeholder:text-dream-muted focus-visible:ring-violet-200 dark:border-white/10 dark:bg-background/70 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus-visible:ring-violet-400/20"
                disabled={pending}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={pending || remaining === 0}
                  className="h-12 rounded-2xl dream-brand-bg px-5 text-sm font-semibold text-white shadow-dream-card"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Envoyer le reve
                    </>
                  )}
                </Button>

                <div className="flex flex-wrap gap-2 text-sm font-medium text-dream-muted dark:text-muted-foreground">
                  <span className="rounded-full border border-border bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]">
                    {weeklyUsed}/{weeklyLimit} reves cette semaine
                  </span>
                  <span className="rounded-full border border-border bg-dream-softer px-3 py-2 text-dream-accent dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
                    Encore {remaining} possible{remaining > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {feedback ? (
                <p className="rounded-2xl border border-border bg-dream-highlight px-4 py-3 text-sm text-dream-accent">
                  {feedback}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-dream-accent">
                  {error}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[32px] border border-border bg-card/85 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dream-accent">
                  Apercu video
                </p>
                <h3 className="mt-1 text-xl font-bold text-dream-heading dark:text-foreground">
                  {latestDream ? 'Dernier reve' : 'Aucune video encore'}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-dream-highlight text-dream-accent dark:bg-violet-400/10 dark:text-violet-200">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="overflow-hidden rounded-[26px] bg-[#2d1068]/10">
              {latestDreamVideoUrl ? (
                <video
                  key={latestDreamVideoUrl}
                  controls
                  className="aspect-video w-full bg-black object-cover"
                  src={latestDreamVideoUrl}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] px-8 text-center text-sm leading-7 text-dream-muted dark:bg-dream-softer0/10 dark:text-muted-foreground">
                  <div className="space-y-3">
                    <Video className="mx-auto h-8 w-8 text-dream-accent" />
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
              <div className="mt-4 rounded-[24px] border border-border bg-card/80 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-dream-heading dark:text-foreground">
                    {formatDate(latestDream.createdAt)}
                  </p>
                  {(() => {
                    const statusCopy = getStatusCopy(latestDream.videoStatus)
                    const StatusIcon = statusCopy.icon
                    return (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusCopy.badgeClass}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusCopy.label}
                      </span>
                    )
                  })()}
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-dream-muted dark:text-muted-foreground">
                  {latestDream.summary || latestDream.description}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[30px] border border-border bg-card/80 p-4 shadow-dream-card backdrop-blur dark:border-white/10 dark:bg-white/[0.06] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-dream-accent">
              Journal
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-dream-heading dark:text-foreground">
              {filteredDreams.length} reve{filteredDreams.length > 1 ? 's' : ''} conserve
              {filteredDreams.length > 1 ? 's' : ''}
            </h2>
          </div>

          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 shadow-sm dark:border-white/10 dark:bg-background/70 md:min-w-[360px]">
            <Search className="h-4 w-4 text-dream-accent" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un resume, statut, mot-cle..."
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <div className="relative grid gap-4 before:absolute before:bottom-6 before:left-6 before:top-6 before:hidden before:w-px before:bg-dream-highlight md:before:block">
        {filteredDreams.length > 0 ? (
          filteredDreams.map((dream, index) => {
            const statusCopy = getStatusCopy(dream.videoStatus)
            const StatusIcon = statusCopy.icon
            const dreamVideoUrl = getDreamVideoUrl(dream)
            const analysisCopy = getAnalysisCopy(dream)
            const canExpandAnalysis = analysisCopy.length > 260

            return (
              <Card
                key={dream.id}
                className="group relative ml-0 overflow-hidden rounded-[28px] border border-border bg-card/90 shadow-dream-card transition hover:-translate-y-0.5 hover:border-border hover:shadow-dream-card-lg dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_16px_50px_rgba(0,0,0,0.22)] md:ml-12"
              >
                <div className="absolute -left-[3.28rem] top-7 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-dream-accent shadow-dream-card md:flex">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <CardContent className="p-4 md:p-5">
                  <div className="grid gap-4 xl:grid-cols-[minmax(300px,420px)_1fr]">
                    <div className="self-start overflow-hidden rounded-[24px] border border-border bg-dream-soft dark:border-white/10 dark:bg-white/[0.05]">
                      {dreamVideoUrl ? (
                        <video
                          key={dreamVideoUrl}
                          controls
                          className="aspect-video w-full bg-dream-highlight object-cover dark:bg-background"
                          src={dreamVideoUrl}
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] px-4 text-center text-xs leading-5 text-dream-muted dark:bg-dream-softer0/10 dark:text-muted-foreground">
                          <div>
                            <Video className="mx-auto mb-2 h-7 w-7 text-dream-accent" />
                            {dream.errorMessage || statusCopy.description}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <span className="text-xs font-semibold text-dream-accent">
                          {formatDate(dream.createdAt)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusCopy.badgeClass}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCopy.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-dream-accent">
                              Entree de journal
                            </p>
                            <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-dream-heading dark:text-foreground">
                              {dream.summary || 'Reve en cours de lecture'}
                            </h3>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full text-dream-accent hover:bg-dream-highlight hover:text-dream-accent dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-foreground"
                            onClick={() => deleteDream(dream.id)}
                            disabled={pending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>

                        {dream.videoStatus === 'waiting_validation' ? (
                          <div className="flex flex-wrap gap-3 rounded-[22px] border border-border bg-white p-3 dark:border-white/10 dark:bg-white/[0.05]">
                            <Button
                              type="button"
                              className="rounded-full bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white"
                              onClick={() => validateDream(dream.id)}
                              disabled={pending}
                            >
                              Valider le resume
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full border-border px-4 py-2 text-sm font-semibold text-dream-accent dark:border-white/10 dark:text-foreground dark:hover:bg-white/10"
                              onClick={() => regenerateDream(dream.id)}
                              disabled={pending}
                            >
                              Refaire le resume
                            </Button>
                          </div>
                        ) : null}

                        <div className="grid gap-3 lg:grid-cols-2">
                          <div className="rounded-[22px] border border-border bg-dream-softer p-4 dark:border-white/10 dark:bg-white/[0.05]">
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-dream-heading dark:text-foreground">
                              <Moon className="h-4 w-4 text-dream-accent" />
                              Description
                            </p>
                            <p className="line-clamp-6 whitespace-pre-line text-sm leading-7 text-dream-muted dark:text-muted-foreground">
                              {dream.description}
                            </p>
                          </div>

                          <div className="rounded-[22px] border border-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-dream-heading dark:text-foreground">
                              <Wand2 className="h-4 w-4 text-dream-accent" />
                              Analyse
                            </p>
                            <p className="line-clamp-6 whitespace-pre-line text-sm leading-7 text-dream-muted dark:text-muted-foreground">
                              {analysisCopy}
                            </p>
                            {canExpandAnalysis ? (
                              <button
                                type="button"
                                onClick={() => openAnalysisModal(dream, analysisCopy)}
                                className="mt-3 rounded-full border border-[#D8C7FF] bg-dream-highlight px-4 py-2 text-xs font-semibold text-dream-accent shadow-[0_8px_20px_rgba(109,40,217,0.10)] transition hover:bg-[#E9DDFF] dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200 dark:hover:bg-violet-400/15"
                              >
                                Voir plus
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {dreamVideoUrl ? (
                          <a
                            href={dreamVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white"
                          >
                            Ouvrir la video
                            <ExternalLink className="h-4 w-4" />
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
          <Card className="rounded-[34px] border border-dashed border-border bg-card/70 shadow-none dark:border-white/10 dark:bg-white/[0.04]">
            <CardContent className="p-10 text-center text-sm leading-7 text-[#7A6A99] dark:text-muted-foreground">
              Aucun reve ne correspond a votre recherche pour le moment.
            </CardContent>
          </Card>
        )}
      </div>

      {selectedAnalysis ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1068]/35 px-4 py-6 backdrop-blur-md dark:bg-black/55"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnalysis(null)}
        >
          <div
            className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-[34px] border border-border bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] shadow-dream-card-lg dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_34px_110px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border px-6 py-5 dark:border-white/10 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-dream-accent">
                    Analyse du reve
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-bold tracking-[-0.03em] text-dream-heading dark:text-foreground">
                    {selectedAnalysis.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#7A6A99] dark:text-muted-foreground">
                    Cree le {selectedAnalysis.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-dream-accent shadow-dream-card transition hover:bg-dream-highlight hover:text-dream-heading dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10"
                  aria-label="Fermer l'analyse"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5 md:px-7">
              <div className="rounded-[26px] border border-border bg-card/75 p-5 shadow-dream-card dark:border-white/10 dark:bg-white/[0.06]">
                <p className="whitespace-pre-line text-sm leading-8 text-[#4B3F72] dark:text-muted-foreground md:text-base">
                  {selectedAnalysis.content}
                </p>
              </div>
            </div>

            <div className="border-t border-border bg-white/45 px-6 py-4 dark:border-white/10 dark:bg-white/[0.04] md:px-7">
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="w-full rounded-full dream-brand-bg px-5 py-3 text-sm font-semibold text-white shadow-dream-card transition hover:brightness-105 sm:w-auto"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
