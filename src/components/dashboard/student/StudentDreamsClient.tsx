'use client'

import { useDeferredValue, useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Mic,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Trash2,
  Video,
  Wand2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

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

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function StudentDreamsClient({ dreams, weeklyUsed, weeklyLimit }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('dashboard.student.dreams')

  const [description, setDescription] = useState('')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [validationError, setValidationError] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<{
    content: string
    date: string
    title: string
    type: 'analysis' | 'description'
  } | null>(null)
  const [pending, startTransition] = useTransition()
  const deferredQuery = useDeferredValue(query)
  const hasDreamInProgress = dreams.some(
    (dream) => dream.videoStatus === 'pending' || dream.videoStatus === 'generating',
  )

  function getStatusCopy(status: Dream['videoStatus']) {
    switch (status) {
      case 'ready':
        return {
          label: t('status.ready'),
          icon: CheckCircle2,
          badgeClass: 'student-dream-status student-dream-status-ready',
          smallBadgeClass: 'student-dream-status student-dream-status-small student-dream-status-ready',
          dotClass: 'student-dream-dot-ready',
          description: t('statusDescription.ready'),
        }
      case 'failed':
        return {
          label: t('status.failed'),
          icon: RefreshCw,
          badgeClass: 'student-dream-status student-dream-status-failed',
          smallBadgeClass: 'student-dream-status student-dream-status-small student-dream-status-failed',
          dotClass: 'student-dream-dot-failed',
          description: t('statusDescription.failed'),
        }
      case 'generating':
        return {
          label: t('status.generating'),
          icon: Loader2,
          badgeClass: 'student-dream-status student-dream-status-generating',
          smallBadgeClass:
            'student-dream-status student-dream-status-small student-dream-status-generating',
          dotClass: 'student-dream-dot-generating',
          description: t('statusDescription.generating'),
        }
      case 'waiting_validation':
        return {
          label: t('status.waitingValidation'),
          icon: Clock3,
          badgeClass: 'student-dream-status student-dream-status-validation',
          smallBadgeClass:
            'student-dream-status student-dream-status-small student-dream-status-validation',
          dotClass: 'student-dream-dot-validation',
          description: t('statusDescription.waitingValidation'),
        }
      default:
        return {
          label: t('status.pending'),
          icon: Clock3,
          badgeClass: 'student-dream-status student-dream-status-pending',
          smallBadgeClass: 'student-dream-status student-dream-status-small student-dream-status-pending',
          dotClass: 'student-dream-dot-pending',
          description: t('statusDescription.pending'),
        }
    }
  }

  function renderAnalysisLines(text: string): React.ReactNode[] {
    const lines = text.split('\n')
    return lines.flatMap((line, i) => {
      const trimmed = line.trim()
      const suffix = i < lines.length - 1 ? '\n' : ''
      if (!trimmed) return [<span key={i}>{suffix}</span>]
      // Skip orphan emoji lines (emoji with no text after it)
      const withoutEmoji = trimmed.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, '').trim()
      if (!withoutEmoji) return []
      // Title: short line with no sentence-ending punctuation
      const isTitle = trimmed.length < 80 && !/[.!?,;:…]$/.test(trimmed)
      if (isTitle) {
        return [<strong key={i} className="student-dreams-analysis-title">{trimmed}{suffix}</strong>]
      }
      return [<span key={i}>{trimmed}{suffix}</span>]
    })
  }

  function formatAnalysisText(text: string): string {
    return text
      .replace(/\s*([🌊🧭🔮💙🌿✨🌙⭐🎯🔑])/gu, '\n\n$1')
      .trim()
  }

  function stripLeadingDreamText(analysis: string, description: string): string {
    const desc = description.trim()
    if (!desc) return analysis

    // Direct match at the start
    if (analysis.toLowerCase().startsWith(desc.toLowerCase())) {
      return analysis.slice(desc.length).trimStart()
    }

    // Partial match: check first 60 chars then cut at the next double newline
    const chunk = desc.slice(0, Math.min(60, desc.length)).toLowerCase()
    if (chunk.length > 20 && analysis.toLowerCase().startsWith(chunk)) {
      const cut = analysis.indexOf('\n\n')
      if (cut > 0) return analysis.slice(cut).trimStart()
    }

    return analysis
  }

  function getAnalysisCopy(dream: Dream) {
    if (dream.analysis?.trim()) {
      const raw = stripLeadingDreamText(dream.analysis.trim(), dream.description ?? '')
      return formatAnalysisText(raw)
    }

    if (dream.videoStatus === 'failed') {
      return t('analysisFailedError')
    }

    if (dream.videoStatus === 'ready') {
      return t('analysisNotAvailable')
    }

    return t('analysisEmpty')
  }

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
          dream.description ?? '',
          dream.summary ?? '',
          dream.analysis ?? '',
          dream.videoStatus ?? '',
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
      setError(t('submitErrorEmpty'))
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
            locale,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data?.error || t('submitErrorServer'))
          return
        }

        setDescription('')
        setFeedback(t('submitSuccess'))
        router.refresh()
      } catch {
        setError(t('submitErrorFetch'))
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
          setError(data?.message || data?.error || t('deleteError'))
          return
        }

        setFeedback(t('deleteSuccess'))
        router.refresh()
      } catch {
        setError(t('deleteErrorFetch'))
      }
    })
  }

  function validateDream(id: string | number) {
    setValidationError((prev) => ({ ...prev, [String(id)]: '' }))

    startTransition(async () => {
      try {
        const response = await fetch(`/api/dreams-validate/${id}`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          const msg = data?.error || data?.message || t('validateError')
          console.error('[validateDream]', response.status, msg)
          setValidationError((prev) => ({ ...prev, [String(id)]: msg }))
          return
        }

        router.refresh()
      } catch (err) {
        console.error('[validateDream] fetch error', err)
        setValidationError((prev) => ({ ...prev, [String(id)]: t('validateErrorFetch') }))
      }
    })
  }

  function regenerateDream(id: string | number) {
    setValidationError((prev) => ({ ...prev, [String(id)]: '' }))

    startTransition(async () => {
      try {
        const response = await fetch(`/api/dreams-regenerate/${id}`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          const msg = data?.error || data?.message || t('regenerateError')
          console.error('[regenerateDream]', response.status, msg)
          setValidationError((prev) => ({ ...prev, [String(id)]: msg }))
          return
        }

        router.refresh()
      } catch (err) {
        console.error('[regenerateDream] fetch error', err)
        setValidationError((prev) => ({ ...prev, [String(id)]: t('regenerateErrorFetch') }))
      }
    })
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = async () => {
          try {
            setIsTranscribing(true)
            const base64 = reader.result as string
            const res = await fetch('/api/coaching/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'stt', audioBase64: base64 }),
            })
            const data = await res.json()
            if (data.text) {
              setDescription(data.text)
            }
          } catch {
            setError(t('errorMic'))
          } finally {
            setIsTranscribing(false)
          }
        }
        reader.readAsDataURL(audioBlob)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
    } catch {
      setError(t('errorMic'))
    }
  }

  function openAnalysisModal(dream: Dream, content: string, type: 'analysis' | 'description') {
    setSelectedAnalysis({
      content,
      date: formatDate(dream.createdAt, locale),
      title: dream.summary?.trim() || (dream.description ?? '').trim().slice(0, 80) || t('defaultAnalysisTitle'),
      type,
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
                {t('eyebrow')}
              </div>

              <h2 className="student-dreams-title">
                {t('heroTitle')}
              </h2>
              <p className="student-dreams-description">
                {t('heroDescription')}
              </p>
            </div>

            <form onSubmit={submitDream} className="student-dreams-form">
              <div className="student-dreams-textarea-wrapper">
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t('textareaPlaceholder')}
                  className="student-dreams-textarea"
                  disabled={pending || isRecording || isTranscribing}
                />
                <button
                  type="button"
                  onClick={() => void toggleRecording()}
                  disabled={pending || isTranscribing}
                  className={`student-dreams-mic-button ${isRecording ? 'student-dreams-mic-button-active' : ''}`}
                  title={isRecording ? t('stopRecording') : t('startRecording')}
                >
                  {isTranscribing ? <Loader2 className="student-dreams-mic-spin" /> : isRecording ? <Square /> : <Mic />}
                </button>
              </div>

              <div className="student-dreams-actions-row">
                <Button
                  type="submit"
                  disabled={pending || remaining === 0}
                  className="student-dreams-submit-button"
                >
                  {pending ? (
                    <>
                      <Loader2 />
                      {t('submitPending')}
                    </>
                  ) : (
                    <>
                      <Plus />
                      {t('submit')}
                    </>
                  )}
                </Button>

                <div className="student-dreams-limits">
                  <span className="student-dreams-limit-neutral">
                    {t('weeklyCounter', { used: weeklyUsed, limit: weeklyLimit })}
                  </span>
                  <span className="student-dreams-limit-active">
                    {t('remaining', { count: remaining })}
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
                <p className="student-dreams-small-label">{t('previewLabel')}</p>
                <h3 className="student-dreams-preview-title">
                  {latestDream ? t('previewTitle') : t('previewEmpty')}
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
                  preload="none"
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
                          : t('videoPlaceholder'))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {latestDream ? (
              <div className="student-dreams-latest-box">
                <div className="student-dreams-latest-header">
                  <p className="student-dreams-date">{formatDate(latestDream.createdAt, locale)}</p>
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
                  {latestDream.summary || latestDream.description || ''}
                </p>
                {(latestDream.summary || latestDream.description || '').length > 150 ? (
                  <button
                    type="button"
                    onClick={() => openAnalysisModal(latestDream, latestDream.summary || latestDream.description || '', 'description')}
                    className="student-dreams-see-more"
                  >
                    {t('seeMore')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="student-dreams-journal-header">
        <div className="student-dreams-journal-inner">
          <div>
            <p className="student-dreams-small-label">{t('journalLabel')}</p>
            <h2 className="student-dreams-journal-title">
              {t('journalCount', { count: filteredDreams.length })}
            </h2>
          </div>

          <div className="student-dreams-search-box">
            <Search />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="student-dreams-search-input"
            />
            {query ? (
              <button
                type="button"
                className="student-dreams-search-clear"
                onClick={() => setQuery('')}
                aria-label="Effacer la recherche"
              >
                <X />
              </button>
            ) : null}
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
            const canExpandDescription = (dream.description ?? '').length > 260

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
                          preload="none"
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
                        <span className="student-dreams-date">{formatDate(dream.createdAt, locale)}</span>
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
                              {t('summaryLabel')}
                            </p>
                            <p className="student-dreams-summary-text">
                              {dream.summary || t('summaryLoading')}
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
                            {t('delete')}
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
                              {t('validate')}
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              className="student-dreams-action-secondary"
                              onClick={() => regenerateDream(dream.id)}
                              disabled={pending}
                            >
                              {t('regenerate')}
                            </Button>

                            {validationError[String(dream.id)] ? (
                              <p className="student-dreams-error text-xs">
                                {validationError[String(dream.id)]}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="student-dreams-info-grid">
                          <div className="student-dreams-info-box">
                            <p className="student-dreams-info-title">
                              <Moon />
                              {t('descriptionLabel')}
                            </p>
                            <p className="student-dreams-info-text">{dream.description ?? ''}</p>

                            {canExpandDescription ? (
                              <button
                                type="button"
                                onClick={() => openAnalysisModal(dream, dream.description ?? '', 'description')}
                                className="student-dreams-see-more"
                              >
                                {t('seeMore')}
                              </button>
                            ) : null}
                          </div>

                          <div className="student-dreams-analysis-box">
                            <p className="student-dreams-info-title">
                              <Wand2 />
                              {t('analysisLabel')}
                            </p>
                            <p className="student-dreams-info-text">{renderAnalysisLines(analysisCopy)}</p>

                            {canExpandAnalysis ? (
                              <button
                                type="button"
                                onClick={() => openAnalysisModal(dream, analysisCopy, 'analysis')}
                                className="student-dreams-see-more"
                              >
                                {t('seeMore')}
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
                            {t('openVideo')}
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
              {t('noResults')}
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
                  <p className="student-dreams-small-label">{t('modalTitle')}</p>
                  <p className="student-dreams-modal-date">
                    {t('modalDate', { date: selectedAnalysis.date })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnalysis(null)}
                  className="student-dreams-modal-close"
                  aria-label={t('modalCloseAriaLabel')}
                >
                  <X />
                </button>
              </div>
            </div>

            <div className="student-dreams-modal-body">
              <div className="student-dreams-modal-content">
                <p className="student-dreams-modal-text">
                  {selectedAnalysis.type === 'analysis'
                    ? renderAnalysisLines(selectedAnalysis.content)
                    : selectedAnalysis.content}
                </p>
              </div>
            </div>

            <div className="student-dreams-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="student-dreams-modal-close-main"
              >
                {t('modalClose')}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
