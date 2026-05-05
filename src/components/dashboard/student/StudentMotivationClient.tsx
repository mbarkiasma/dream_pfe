'use client'

import { useState } from 'react'
import { Heart, Megaphone, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<MotivationAnnouncement | null>(
    null,
  )
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
    <div className="student-motivation-root">
      {announcements.length === 0 ? (
        <Card className="student-motivation-empty-card">
          <CardContent className="student-motivation-empty-content">
            Aucune annonce de motivation n'est disponible pour le moment.
          </CardContent>
        </Card>
      ) : null}

      {announcements.map((announcement) => (
        <article key={announcement.id} className="student-motivation-card">
          <div className="student-motivation-header">
            <div className="student-motivation-heading">
              <div className="student-motivation-icon">
                <Megaphone />
              </div>

              <div>
                <h2 className="student-motivation-title">{announcement.title}</h2>
                <p className="student-motivation-meta">
                  Publiee par {getAuthorName(announcement.author)} -{' '}
                  {formatDate(announcement.publishedAt || announcement.createdAt)}
                </p>
              </div>
            </div>

            <span className="student-motivation-badge">Motivation</span>
          </div>

          <div className="student-motivation-content-box">
            <p className="student-motivation-text">{announcement.content}</p>
          </div>

          <div className="student-motivation-actions">
            <Button
              type="button"
              onClick={() => setSelectedAnnouncement(announcement)}
              variant="dreamGhost"
              size="xs"
              className="student-motivation-action-button"
            >
              Voir plus
            </Button>

            {(() => {
              const isActive = announcement.reactions?.myReaction === 'like'
              const count = announcement.reactions?.counts?.like ?? 0

              return (
                <Button
                  type="button"
                  onClick={() => void reactToAnnouncement(announcement.id, 'like')}
                  disabled={pendingReactionId === announcement.id}
                  variant={isActive ? 'success' : 'dreamGhost'}
                  size="xs"
                  className={
                    isActive
                      ? 'student-motivation-like-button student-motivation-like-button-active'
                      : 'student-motivation-like-button'
                  }
                >
                  <Heart />
                  <span>{count}</span>
                </Button>
              )
            })()}
          </div>
        </article>
      ))}

      {error ? <p className="student-motivation-error">{error}</p> : null}

      {selectedAnnouncement ? (
        <div
          className="mindly-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="student-motivation-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="student-motivation-modal-header">
              <div className="student-motivation-modal-heading">
                <div>
                  <p className="student-motivation-modal-label">Motivation</p>
                  <h3 className="student-motivation-modal-title">
                    {selectedAnnouncement.title}
                  </h3>
                  <p className="student-motivation-modal-meta">
                    Publiee par {getAuthorName(selectedAnnouncement.author)} -{' '}
                    {formatDate(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="student-motivation-modal-close"
                  aria-label="Fermer l'annonce"
                >
                  <X />
                </button>
              </div>
            </div>

            <div className="student-motivation-modal-body">
              <div className="student-motivation-modal-content">
                <p className="student-motivation-modal-text">{selectedAnnouncement.content}</p>
              </div>
            </div>

            <div className="student-motivation-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="student-motivation-modal-main-button"
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