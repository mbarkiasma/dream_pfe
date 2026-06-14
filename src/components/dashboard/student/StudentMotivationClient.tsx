'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BookOpen,
  ChevronRight,
  Heart,
  Lightbulb,
  Megaphone,
  MessageSquareHeart,
  ShieldAlert,
  X,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

type MotivationAnnouncement = {
  id: string | number
  title: string
  content: string
  howToAvoid?: string | null
  practicalTips?: string | null
  simpleExample?: string | null
  motivatingMessage?: string | null
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

function getAuthorName(author: MotivationAnnouncement['author']) {
  if (!author) return 'Coach'
  const fullName = `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()
  return fullName || author.email || 'Coach'
}

export function StudentMotivationClient({ announcements }: Props) {
  const t = useTranslations('dashboard.student.motivation')
  const locale = useLocale()
  const router = useRouter()
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<MotivationAnnouncement | null>(
    null,
  )
  const [isMounted, setIsMounted] = useState(false)
  const [pendingReactionId, setPendingReactionId] = useState<string | number | null>(null)
  const [error, setError] = useState('')

  function formatDate(value?: string | null) {
    if (!value) return t('dateNotSpecified')
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value))
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedAnnouncement) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedAnnouncement(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedAnnouncement])

  async function reactToAnnouncement(announcementId: string | number, reaction: ReactionValue) {
    setError('')
    setPendingReactionId(announcementId)

    try {
      const response = await fetch('/api/annonce-motivation/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId, reaction }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('errorReaction'))
        return
      }

      router.refresh()
    } catch {
      setError(t('errorReaction'))
    } finally {
      setPendingReactionId(null)
    }
  }

  return (
    <div className="student-motivation-root">
      {announcements.length === 0 ? (
        <div className="student-motivation-empty-card">
          <div className="student-motivation-empty-content">{t('empty')}</div>
        </div>
      ) : null}

      {announcements.map((announcement) => {
        const isActive = announcement.reactions?.myReaction === 'like'
        const count = announcement.reactions?.counts?.like ?? 0

        return (
          <article key={announcement.id} className="student-motivation-card">
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(announcement)}
              className="student-motivation-card-clickable"
              aria-label={`Voir les détails : ${announcement.title}`}
            >
              <div className="student-motivation-header">
                <div className="student-motivation-heading">
                  <div className="student-motivation-icon">
                    <Megaphone />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <h2 className="student-motivation-title">{announcement.title}</h2>
                    <p className="student-motivation-meta">
                      {t('publishedBy', {
                        name: getAuthorName(announcement.author),
                        date: formatDate(announcement.publishedAt || announcement.createdAt),
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="student-motivation-badge">{t('badge')}</span>
                  <ChevronRight className="h-4 w-4 text-dream-muted" />
                </div>
              </div>
            </button>

            <div className="student-motivation-actions">
              <Button
                type="button"
                onClick={() => setSelectedAnnouncement(announcement)}
                variant="dreamGhost"
                size="xs"
                className="student-motivation-action-button"
              >
                {t('seeMore')}
              </Button>

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
            </div>
          </article>
        )
      })}

      {error ? <p className="student-motivation-error">{error}</p> : null}

      {isMounted && selectedAnnouncement
        ? createPortal(
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
                    <div className="min-w-0 flex-1">
                      <p className="student-motivation-modal-label">{t('badge')}</p>
                      <h3 className="student-motivation-modal-title">
                        {selectedAnnouncement.title}
                      </h3>
                      <p className="student-motivation-modal-meta">
                        {t('publishedBy', {
                          name: getAuthorName(selectedAnnouncement.author),
                          date: formatDate(
                            selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt,
                          ),
                        })}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAnnouncement(null)}
                      className="student-motivation-modal-close"
                      aria-label={t('closeAriaLabel')}
                    >
                      <X />
                    </button>
                  </div>
                </div>

                <div className="student-motivation-modal-body">
                  {/* Contenu principal */}
                  <div className="motivation-section motivation-section-content">
                    <div className="motivation-section-label">
                      <Megaphone className="motivation-section-icon" />
                      <span>{t('sectionContent')}</span>
                    </div>
                    <p className="motivation-section-text">{selectedAnnouncement.content}</p>
                  </div>

                  {/* Comment éviter */}
                  {selectedAnnouncement.howToAvoid ? (
                    <div className="motivation-section motivation-section-avoid">
                      <div className="motivation-section-label">
                        <ShieldAlert className="motivation-section-icon" />
                        <span>{t('sectionHowToAvoid')}</span>
                      </div>
                      <p className="motivation-section-text">{selectedAnnouncement.howToAvoid}</p>
                    </div>
                  ) : null}

                  {/* Conseils pratiques */}
                  {selectedAnnouncement.practicalTips ? (
                    <div className="motivation-section motivation-section-tips">
                      <div className="motivation-section-label">
                        <Lightbulb className="motivation-section-icon" />
                        <span>{t('sectionPracticalTips')}</span>
                      </div>
                      <p className="motivation-section-text">{selectedAnnouncement.practicalTips}</p>
                    </div>
                  ) : null}

                  {/* Exemple simple */}
                  {selectedAnnouncement.simpleExample ? (
                    <div className="motivation-section motivation-section-example">
                      <div className="motivation-section-label">
                        <BookOpen className="motivation-section-icon" />
                        <span>{t('sectionSimpleExample')}</span>
                      </div>
                      <p className="motivation-section-text">{selectedAnnouncement.simpleExample}</p>
                    </div>
                  ) : null}

                  {/* Message motivant */}
                  {selectedAnnouncement.motivatingMessage ? (
                    <div className="motivation-section motivation-section-message">
                      <div className="motivation-section-label">
                        <MessageSquareHeart className="motivation-section-icon" />
                        <span>{t('sectionMotivatingMessage')}</span>
                      </div>
                      <p className="motivation-section-text motivation-section-message-text">
                        {selectedAnnouncement.motivatingMessage}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="student-motivation-modal-footer">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="student-motivation-modal-main-button"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
