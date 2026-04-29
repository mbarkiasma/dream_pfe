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
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dotClass: 'bg-emerald-400',
        description: 'La video et le resume sont disponibles.',
      }
    case 'failed':
      return {
        label: 'Echec',
        icon: RefreshCw,
        badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
        dotClass: 'bg-rose-400',
        description: "La generation n'a pas abouti. Vous pouvez relancer un autre reve.",
      }
    case 'generating':
      return {
        label: 'Generation',
        icon: Loader2,
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        dotClass: 'bg-amber-400',
        description: 'Le workflow video est en cours de traitement.',
      }
    case 'waiting_validation':
      return {
        label: 'A valider',
        icon: Clock3,
        badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
        dotClass: 'bg-sky-400',
        description: 'Le resume attend votre validation avant la generation video.',
      }
    default:
      return {
        label: 'En attente',
        icon: Clock3,
        badgeClass: 'border-slate-200 bg-slate-50 text-[#6E628F]',
        dotClass: 'bg-slate-400',
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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[38px] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_42%,#f4edff_100%)] p-5 text-slate-900 shadow-[0_24px_70px_rgba(148,163,184,0.18)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(59,130,246,0.08)_44%,rgba(168,85,247,0.10)_100%)] dark:text-foreground dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)] md:p-7">
        <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/10" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-violet-200/45 blur-3xl dark:bg-violet-500/12" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/10" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
          <div className="flex flex-col justify-between rounded-[30px] border border-white/80 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.06] md:p-6">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <Moon className="h-3.5 w-3.5" />
                Journal de reves
              </div>

              <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-[-0.025em] text-slate-900 dark:text-foreground md:text-4xl">
                Racontez votre reve, puis validez son resume.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#6E628F] dark:text-muted-foreground">
                Decrivez simplement ce dont vous vous souvenez. L&apos;application prepare un resume
                et une analyse, puis lance la video apres votre validation.
              </p>
            </div>

            <form onSubmit={submitDream} className="mt-7 space-y-4">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Exemple : J'etais dans une maison inconnue, je cherchais quelqu'un et je ressentais de la peur..."
                className="min-h-[172px] resize-none rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-base leading-8 text-[#2d1068] shadow-sm placeholder:text-slate-400 focus-visible:ring-sky-200 dark:border-white/10 dark:bg-background/70 dark:text-foreground dark:placeholder:text-muted-foreground dark:focus-visible:ring-sky-400/20"
                disabled={pending}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={pending || remaining === 0}
                  className="h-12 rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
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

                <div className="flex flex-wrap gap-2 text-sm font-medium text-[#6E628F] dark:text-muted-foreground">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]">
                    {weeklyUsed}/{weeklyLimit} reves cette semaine
                  </span>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
                    Encore {remaining} possible{remaining > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {feedback ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {feedback}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}
            </form>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-muted-foreground">
                  Apercu video
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-foreground">
                  {latestDream ? 'Dernier reve' : 'Aucune video encore'}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-400/10 dark:text-sky-200">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] bg-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {latestDreamVideoUrl ? (
                <video
                  key={latestDreamVideoUrl}
                  controls
                  className="aspect-video w-full bg-black object-cover"
                  src={latestDreamVideoUrl}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#e0f2fe_0%,#e0e7ff_48%,#fae8ff_100%)] px-8 text-center text-sm leading-7 text-slate-700 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14)_0%,rgba(99,102,241,0.12)_48%,rgba(217,70,239,0.12)_100%)] dark:text-muted-foreground">
                  <div className="space-y-3">
                    <Video className="mx-auto h-8 w-8 text-indigo-500" />
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
              <div className="mt-5 rounded-[24px] border border-white bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
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
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#6E628F] dark:text-muted-foreground">
                  {latestDream.summary || latestDream.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-white/70 bg-white/75 p-4 shadow-[0_18px_60px_rgba(148,163,184,0.13)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_18px_60px_rgba(0,0,0,0.22)] md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-muted-foreground">
              Journal
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-foreground">
              {filteredDreams.length} reve{filteredDreams.length > 1 ? 's' : ''} conserve
              {filteredDreams.length > 1 ? 's' : ''}
            </h2>
          </div>

          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-background/70 md:min-w-[360px]">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un resume, statut, mot-cle..."
              className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-5">
        {filteredDreams.length > 0 ? (
          filteredDreams.map((dream) => {
            const statusCopy = getStatusCopy(dream.videoStatus)
            const StatusIcon = statusCopy.icon
            const dreamVideoUrl = getDreamVideoUrl(dream)
            const analysisCopy = getAnalysisCopy(dream)
            const canExpandAnalysis = analysisCopy.length > 260

            return (
              <Card
                key={dream.id}
                className="group overflow-hidden rounded-[34px] border border-white/70 bg-white/85 shadow-[0_16px_50px_rgba(148,163,184,0.12)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_16px_50px_rgba(0,0,0,0.22)]"
              >
                <CardContent className="p-4 md:p-5">
                  <div className="grid gap-5 xl:grid-cols-[minmax(300px,430px)_1fr]">
                    <div className="self-start rounded-[30px] border border-slate-100 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                      <div className="relative overflow-hidden rounded-[24px] bg-slate-100 dark:bg-background">
                        {dreamVideoUrl ? (
                          <video
                            key={dreamVideoUrl}
                            controls
                            className="aspect-video w-full bg-slate-100 object-cover dark:bg-background"
                            src={dreamVideoUrl}
                          />
                        ) : (
                          <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#e0f2fe_0%,#e0e7ff_52%,#f5d0fe_100%)] px-6 text-center text-sm leading-6 text-slate-700 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14)_0%,rgba(99,102,241,0.12)_52%,rgba(217,70,239,0.12)_100%)] dark:text-muted-foreground">
                            <div>
                              <Video className="mx-auto mb-3 h-8 w-8 text-indigo-500" />
                              {dream.errorMessage || statusCopy.description}
                            </div>
                          </div>
                        )}

                        <span
                          className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border bg-white/90 px-3 py-1 text-xs font-semibold dark:bg-background/90 ${statusCopy.badgeClass}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusCopy.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col justify-between gap-5 rounded-[28px] border border-slate-100 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground">
                              {formatDate(dream.createdAt)}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-foreground">
                              {dream.summary || 'Reve en cours de lecture'}
                            </h3>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full text-slate-400 dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-foreground"
                            onClick={() => deleteDream(dream.id)}
                            disabled={pending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>

                        {dream.videoStatus === 'waiting_validation' ? (
                          <div className="flex flex-wrap gap-3 rounded-[22px] border border-sky-100 bg-white p-3 dark:border-white/10 dark:bg-white/[0.05]">
                            <Button
                              type="button"
                              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-foreground dark:text-background"
                              onClick={() => validateDream(dream.id)}
                              disabled={pending}
                            >
                              Valider le resume
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-foreground dark:hover:bg-white/10"
                              onClick={() => regenerateDream(dream.id)}
                              disabled={pending}
                            >
                              Refaire le resume
                            </Button>
                          </div>
                        ) : null}

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-[24px] border border-white bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-foreground">
                              <Moon className="h-4 w-4 text-indigo-500" />
                              Description
                            </p>
                            <p className="line-clamp-6 whitespace-pre-line text-sm leading-7 text-[#6E628F] dark:text-muted-foreground">
                              {dream.description}
                            </p>
                          </div>

                          <div className="rounded-[24px] border border-white bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-foreground">
                              <Wand2 className="h-4 w-4 text-cyan-500" />
                              Analyse
                            </p>
                            <p className="line-clamp-6 whitespace-pre-line text-sm leading-7 text-[#6E628F] dark:text-muted-foreground">
                              {analysisCopy}
                            </p>
                            {canExpandAnalysis ? (
                              <button
                                type="button"
                                onClick={() => openAnalysisModal(dream, analysisCopy)}
                                className="mt-3 rounded-full border border-[#D8C7FF] bg-[#F3ECFF] px-4 py-2 text-xs font-semibold text-[#6D28D9] shadow-[0_8px_20px_rgba(109,40,217,0.10)] transition hover:bg-[#E9DDFF] dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200 dark:hover:bg-violet-400/15"
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
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
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
          <Card className="rounded-[34px] border border-dashed border-slate-200 bg-white/70 shadow-none dark:border-white/10 dark:bg-white/[0.04]">
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
            className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] shadow-[0_34px_110px_rgba(45,16,104,0.28)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(168,85,247,0.10)_100%)] dark:shadow-[0_34px_110px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/70 px-6 py-5 dark:border-white/10 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B6BFF]">
                    Analyse du reve
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-bold tracking-[-0.03em] text-[#2d1068] dark:text-foreground">
                    {selectedAnalysis.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#7A6A99] dark:text-muted-foreground">
                    Cree le {selectedAnalysis.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#6D28D9] shadow-[0_10px_24px_rgba(109,40,217,0.12)] transition hover:bg-white hover:text-rose-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-foreground dark:hover:bg-white/10 dark:hover:text-rose-300"
                  aria-label="Fermer l'analyse"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5 md:px-7">
              <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 shadow-[0_14px_45px_rgba(109,40,217,0.10)] dark:border-white/10 dark:bg-white/[0.06]">
                <p className="whitespace-pre-line text-sm leading-8 text-[#4B3F72] dark:text-muted-foreground md:text-base">
                  {selectedAnalysis.content}
                </p>
              </div>
            </div>

            <div className="border-t border-white/70 bg-white/45 px-6 py-4 dark:border-white/10 dark:bg-white/[0.04] md:px-7">
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(109,40,217,0.22)] transition hover:brightness-105 sm:w-auto"
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
