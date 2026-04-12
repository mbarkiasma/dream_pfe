'use client'

import { useDeferredValue, useState, useTransition } from 'react'
import { Loader2, Plus, Search, Sparkles, Trash2, Video, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import type { Dream } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
        badgeClass: 'bg-emerald-100 text-emerald-700',
        description: 'La video et le resume sont disponibles.',
      }
    case 'failed':
      return {
        label: 'Echec',
        badgeClass: 'bg-rose-100 text-rose-700',
        description: "La generation n'a pas abouti. Vous pouvez relancer un autre reve.",
      }
    case 'generating':
      return {
        label: 'Generation',
        badgeClass: 'bg-amber-100 text-amber-700',
        description: 'Le workflow video est en cours de traitement.',
      }
    default:
      return {
        label: 'En attente',
        badgeClass: 'bg-slate-100 text-slate-600',
        description: 'Le reve est en file avant generation.',
      }
  }
}

export function StudentDreamsClient({ dreams, weeklyUsed, weeklyLimit }: Props) {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const deferredQuery = useDeferredValue(query)

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

  function deleteDream(id: string) {
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
        setError("Une erreur reseau est survenue pendant la suppression.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px] border border-white/60 bg-white/85 shadow-[0_12px_32px_rgba(148,163,184,0.14)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
              <Wand2 className="h-6 w-6 text-violet-500" />
              Nouveau reve
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitDream} className="space-y-4">
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Racontez votre reve avec assez de details pour generer un resume et une video."
                className="min-h-[150px] rounded-[24px] border-white/60 bg-slate-50/80 px-5 py-4 text-sm leading-7 text-slate-700"
                disabled={pending}
              />

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={pending || remaining === 0}
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-5 text-white shadow-[0_10px_24px_rgba(124,58,237,0.24)]"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Generer un reve
                    </>
                  )}
                </Button>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {weeklyUsed}/{weeklyLimit} utilises cette semaine
                </span>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                  {remaining} restant{remaining > 1 ? 's' : ''}
                </span>
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
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[28px] border border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_42%),linear-gradient(145deg,#ffffff_0%,#eef2ff_100%)] shadow-[0_12px_32px_rgba(148,163,184,0.14)]">
          <CardContent className="p-6">
            <div className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Apercu
                  </p>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {latestDream ? 'Dernier reve genere' : 'Journal intelligent'}
                  </h3>
                </div>
              </div>

              {latestDream ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-3xl bg-slate-950/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    {latestDreamVideoUrl ? (
                      <video
                        key={latestDreamVideoUrl}
                        controls
                        className="aspect-video w-full rounded-2xl bg-black object-cover"
                        src={latestDreamVideoUrl}
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#312e81_0%,#4c1d95_55%,#6d28d9_100%)] text-center text-sm text-white/80">
                        <div className="space-y-2 px-6">
                          <Video className="mx-auto h-6 w-6" />
                          <p>{getStatusCopy(latestDream.videoStatus).description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(latestDream.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {latestDream.summary || latestDream.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-violet-200 bg-white/60 p-6 text-sm leading-7 text-slate-600">
                  Racontez un premier reve pour lancer la generation automatique du resume et de la
                  video dans votre espace.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher dans vos descriptions, resumes ou statuts..."
          className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="grid gap-5">
        {filteredDreams.length > 0 ? (
          filteredDreams.map((dream) => {
            const statusCopy = getStatusCopy(dream.videoStatus)
            const dreamVideoUrl = getDreamVideoUrl(dream)

            return (
              <Card
                key={dream.id}
                className="overflow-hidden rounded-[28px] border border-white/60 bg-white/88 shadow-[0_10px_30px_rgba(148,163,184,0.12)]"
              >
                <CardContent className="p-6">
                  <div className="grid gap-6 xl:grid-cols-[minmax(300px,420px)_1fr]">
                    <div className="overflow-hidden rounded-[24px] bg-slate-100">
                      {dreamVideoUrl ? (
                        <video
                          key={dreamVideoUrl}
                          controls
                          className="aspect-video w-full bg-black object-cover"
                          src={dreamVideoUrl}
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_top,#ddd6fe_0%,#c7d2fe_55%,#e2e8f0_100%)] px-6 text-center text-sm leading-6 text-slate-600">
                          <div>
                            <Video className="mx-auto mb-3 h-7 w-7 text-violet-500" />
                            {statusCopy.description}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            {formatDate(dream.createdAt)}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusCopy.badgeClass}`}
                          >
                            {statusCopy.label}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => deleteDream(dream.id)}
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>

                      <div className="mt-5 space-y-5">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Description</h3>
                          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                            {dream.description}
                          </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Resume</p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                              {dream.summary || 'Le resume sera ajoute automatiquement des que le workflow termine.'}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Analyse</p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                              {dream.analysis || dream.errorMessage || 'Aucune analyse disponible pour le moment.'}
                            </p>
                          </div>
                        </div>

                        {dreamVideoUrl ? (
                          <a
                            href={dreamVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                          >
                            Ouvrir la video
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
          <Card className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 shadow-none">
            <CardContent className="p-8 text-center text-sm leading-7 text-slate-500">
              Aucun reve ne correspond a votre recherche pour le moment.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
