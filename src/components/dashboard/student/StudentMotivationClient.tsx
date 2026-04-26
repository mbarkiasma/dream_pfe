'use client'

import { useState } from 'react'
import { Heart, Megaphone, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'

type MotivationAnnouncement = {
  id: string | number
  title: string
  content: string
  publishedAt?: string | null
  createdAt?: string | null
  author?: {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
  } | null
  reactions?: {
    counts: Record<ReactionValue, number>
    myReaction?: ReactionValue
  }
}

type Props = {
  announcements: MotivationAnnouncement[]
}

type ReactionValue = 'like'

function formatDate(value?: string | null) {
  if (!value) return 'Date non precisee'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function getAuthorName(author: MotivationAnnouncement['author']) {
  if (!author) return 'Coach'

  const fullName = `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()

  return fullName || author.email || 'Coach'
}

export function StudentMotivationClient({ announcements }: Props) {
  const router = useRouter()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<MotivationAnnouncement | null>(null)
  const [pendingReactionId, setPendingReactionId] = useState<string | number | null>(null)
  const [error, setError] = useState('')

  async function reactToAnnouncement(announcementId: string | number, reaction: ReactionValue) {
    setError('')
    setPendingReactionId(announcementId)

    try {
      const response = await fetch('/api/annonce-motivation/reaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcementId,
          reaction,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Reaction impossible pour le moment.')
        return
      }

      router.refresh()
    } catch {
      setError('Reaction impossible pour le moment.')
    } finally {
      setPendingReactionId(null)
    }
  }

  return (
    <div className="grid gap-5">
      {announcements.length === 0 ? (
        <Card className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 shadow-none">
          <CardContent className="p-8 text-center text-sm leading-7 text-[#7A6A99]">
            Aucune annonce de motivation n'est disponible pour le moment.
          </CardContent>
        </Card>
      ) : null}

      {announcements.map((announcement) => (
        <article
          key={announcement.id}
          className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_16px_50px_rgba(148,163,184,0.12)]"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <Megaphone className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#2d1068]">{announcement.title}</h2>
                <p className="mt-2 text-sm text-[#7A6A99]">
                  Publiee par {getAuthorName(announcement.author)} -{' '}
                  {formatDate(announcement.publishedAt || announcement.createdAt)}
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Motivation
            </span>
          </div>

          <p className="mt-5 line-clamp-4 whitespace-pre-line text-sm leading-8 text-[#6E628F]">
            {announcement.content}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(announcement)}
              className="rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-semibold text-[#6D28D9] shadow-sm transition hover:bg-[#F3ECFF]"
            >
              Voir plus
            </button>

            {(() => {
              const isActive = announcement.reactions?.myReaction === 'like'
              const count = announcement.reactions?.counts?.like ?? 0

              return (
                <button
                  type="button"
                  onClick={() => void reactToAnnouncement(announcement.id, 'like')}
                  disabled={pendingReactionId === announcement.id}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive
                      ? 'border-violet-200 bg-violet-600 text-white shadow-[0_10px_24px_rgba(109,40,217,0.18)]'
                      : 'border-violet-100 bg-white text-[#6D28D9] hover:bg-[#F3ECFF]'
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" />
                
                  <span className={isActive ? 'text-white/80' : 'text-[#9B8BB7]'}>{count}</span>
                </button>
              )
            })()}
          </div>
        </article>
      ))}

      {error ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {selectedAnnouncement ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1068]/35 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] shadow-[0_34px_110px_rgba(45,16,104,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/70 px-6 py-5 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B6BFF]">
                    Motivation
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-bold tracking-[-0.03em] text-[#2d1068]">
                    {selectedAnnouncement.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#7A6A99]">
                    Publiee par {getAuthorName(selectedAnnouncement.author)} -{' '}
                    {formatDate(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#6D28D9] shadow-[0_10px_24px_rgba(109,40,217,0.12)] transition hover:bg-white hover:text-rose-600"
                  aria-label="Fermer l'annonce"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5 md:px-7">
              <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 shadow-[0_14px_45px_rgba(109,40,217,0.10)]">
                <p className="whitespace-pre-line text-sm leading-8 text-[#4B3F72] md:text-base">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>

            <div className="border-t border-white/70 bg-white/45 px-6 py-4 md:px-7">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
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
