'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  CalendarDays,
  Check,
  FileText,
  MessageCircle,
  Mic,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Square,
  Trash2,
  UserRound,
  Volume2,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

type CoachingSession = {
  id: string | number
  title: string
  mode: 'classic' | 'smart'
  status: 'closed' | 'open'
  createdAt?: string
  coach?: {
    email?: string
    firstName?: string
    id: string | number
    lastName?: string
  } | null
}

type MessageAttachment = {
  id: string | number
  media:
    | { id: string | number; filename?: string | null; mimeType?: string | null; url?: string | null }
    | string
    | number
}

type PendingAttachment = {
  id: string | number
  filename: string
  mimeType: string
  url: string
}

type CoachingMessage = {
  id: string | number
  content: string
  createdAt?: string
  senderRole: 'ai' | 'coach' | 'student'
  attachments?: MessageAttachment[]
}

type CoachOption = {
  id: string | number
  name: string
  email?: string
  specialty: string
  bio?: string
  avatarUrl?: string | null
}

type StudentCoachingClientProps = {
  initialSessions: CoachingSession[]
}

export function StudentCoachingClient({ initialSessions }: StudentCoachingClientProps) {
  const t = useTranslations('dashboard.student.coaching')

  const [sessions, setSessions] = useState(initialSessions)
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(
    initialSessions[0]?.id ?? null,
  )
  const [messages, setMessages] = useState<CoachingMessage[]>([])
  const [mode, setMode] = useState<'classic' | 'smart'>('smart')
  const [message, setMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | number | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const [sessionToDelete, setSessionToDelete] = useState<CoachingSession | null>(null)
  const [availableCoaches, setAvailableCoaches] = useState<CoachOption[]>([])
  const [selectedCoachId, setSelectedCoachId] = useState<string | number | null>(null)
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false)
  const [coachesError, setCoachesError] = useState('')
  const [selectedChoicesByMessage, setSelectedChoicesByMessage] = useState<
    Record<string, string[]>
  >({})
  const [sidebarTab, setSidebarTab] = useState<'sessions' | 'new'>(
    initialSessions.length > 0 ? 'sessions' : 'new',
  )

  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedSessionId)) ?? null,
    [selectedSessionId, sessions],
  )

  const selectedCoachName = getCoachName(selectedSession)

  const startButtonLabel = mode === 'smart' ? t('startSmart') : t('startClassic')

  const emptyChatTitle = selectedSessionId ? t('emptyChatTitle') : t('emptyChatTitleEmpty')
  const emptyChatDescription = selectedSessionId
    ? t('emptyChatDescription')
    : t('emptyChatDescriptionEmpty')

  const suggestedPrompts = t.raw('suggestedPrompts') as string[]

  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([])
      return
    }

    let isMounted = true

    async function loadMessages() {
      const response = await fetch(`/api/coaching/sessions/${selectedSessionId}/messages`)
      const data = await response.json()

      if (isMounted && response.ok) {
        setMessages(deduplicateMessages(data.messages ?? []))
      }
    }

    void loadMessages()

    return () => {
      isMounted = false
    }
  }, [selectedSessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading, isAiTyping, editingMessageId])

  useEffect(() => {
    if (mode !== 'classic') return

    let isMounted = true

    async function loadAvailableCoaches() {
      setIsLoadingCoaches(true)
      setCoachesError('')
      setStatusMessage('')

      try {
        const response = await fetch('/api/coaching/coaches')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || t('errorLoadCoaches'))
        }

        if (!isMounted) return

        const coaches = (data.coaches ?? []) as CoachOption[]
        setAvailableCoaches(coaches)
        setSelectedCoachId((current) => current ?? coaches[0]?.id ?? null)

        if (coaches.length === 0) {
          setStatusMessage(t('noCoachAvailable'))
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : t('errorUnexpected')
          setCoachesError(errorMessage)
          setStatusMessage(errorMessage)
        }
      } finally {
        if (isMounted) {
          setIsLoadingCoaches(false)
        }
      }
    }

    void loadAvailableCoaches()

    return () => {
      isMounted = false
    }
  }, [mode, t])

  async function startSession() {
    if (mode === 'classic' && !selectedCoachId) {
      setStatusMessage(t('statusNoCoach'))
      return
    }

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/coaching/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, coachId: mode === 'classic' ? selectedCoachId : undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 && mode === 'classic') {
          setMode('smart')
          setSelectedCoachId(null)
        }
        throw new Error(data.error || t('errorCreateSession'))
      }

      setSessions((current) => [data.session, ...current])
      setSelectedSessionId(data.session.id)
      setMessages([])
      setStatusMessage(t('statusSessionCreated'))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('errorUnexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    setIsUploading(true)
    setStatusMessage('')

    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData()
          fd.append('file', file)
          const res = await fetch('/api/coaching/upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || t('errorUpload'))
          return data as PendingAttachment
        }),
      )
      setPendingAttachments((current) => [...current, ...uploads])
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('errorUpload'))
    } finally {
      setIsUploading(false)
      if (event.target) event.target.value = ''
    }
  }

  async function submitMessage(content: string) {
    const cleanMessage = content.trim()
    const hasAttachments = pendingAttachments.length > 0

    if (!selectedSessionId || (!cleanMessage && !hasAttachments) || isLoading) return

    setIsLoading(true)
    setIsAiTyping(true)
    setStatusMessage('')

    const attachmentsSnapshot = [...pendingAttachments]
    setPendingAttachments([])

    const optimisticMessage: CoachingMessage = {
      id: `optimistic-${Date.now()}`,
      content: cleanMessage,
      senderRole: 'student',
      attachments: attachmentsSnapshot.map((a) => ({
        id: a.id,
        media: { id: a.id, filename: a.filename, mimeType: a.mimeType, url: a.url },
      })),
    }

    setMessages((current) => [...current, optimisticMessage])
    setMessage('')

    try {
      const response = await fetch('/api/coaching/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          content: cleanMessage,
          attachments: attachmentsSnapshot.map((a) => a.id),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('errorMessage'))
      }

      setMessages((current) =>
        deduplicateMessages([
          ...current.filter((m) => String(m.id) !== String(optimisticMessage.id)),
          data.message,
          ...(data.aiMessage ? [data.aiMessage] : []),
        ])
      )

      if (data.aiMessage?.content) {
        void playText(data.aiMessage.content)
      }
    } catch (error) {
      setMessages((current) =>
        current.filter((m) => String(m.id) !== String(optimisticMessage.id)),
      )
      setMessage(cleanMessage)
      setPendingAttachments(attachmentsSnapshot)
      setStatusMessage(error instanceof Error ? error.message : t('errorUnexpected'))
    } finally {
      setIsLoading(false)
      setIsAiTyping(false)
    }
  }

  async function sendMessage() {
    await submitMessage(message)
  }

  async function sendSelectedChoices(messageId: string | number, choices: MultipleChoiceOption[]) {
    const selectedValues = selectedChoicesByMessage[String(messageId)] ?? []
    const selectedLabels = choices
      .filter((choice) => selectedValues.includes(choice.label))
      .map((choice) => `${choice.label}. ${choice.text}`)

    if (selectedLabels.length === 0) return

    await submitMessage(`${t('choicePrefix')}${selectedLabels.join('; ')}`)
    setSelectedChoicesByMessage((current) => ({ ...current, [String(messageId)]: [] }))
  }

  async function renameSession(sessionId: string | number) {
    const cleanTitle = editingTitle.trim()

    if (!cleanTitle || isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/coaching/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || t('errorRename'))

      setSessions((current) =>
        current.map((session) =>
          String(session.id) === String(sessionId) ? data.session : session,
        ),
      )
      setEditingSessionId(null)
      setEditingTitle('')
      setStatusMessage(t('statusSessionRenamed'))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('errorUnexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteSession(sessionId: string | number) {
    if (isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/coaching/sessions/${sessionId}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || t('errorDelete'))

      setSessions((current) =>
        current.filter((session) => String(session.id) !== String(sessionId)),
      )

      if (String(selectedSessionId) === String(sessionId)) {
        const nextSession = sessions.find((session) => String(session.id) !== String(sessionId))
        setSelectedSessionId(nextSession?.id ?? null)
        setMessages([])
      }

      setStatusMessage(t('statusSessionDeleted'))
      setSessionToDelete(null)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('errorUnexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  async function updateMessage(messageId: string | number) {
    const cleanMessage = editingMessageContent.trim()

    if (!cleanMessage || isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/coaching/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cleanMessage }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || t('errorUpdate'))

      setMessages(deduplicateMessages(data.messages ?? []))
      setEditingMessageId(null)
      setEditingMessageContent('')
      setStatusMessage(t('statusMessageUpdated'))
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('errorUnexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleRecording() {
    if (isLoading) return

    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      audioChunksRef.current = []
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        try {
          setIsLoading(true)
          setStatusMessage(t('statusTranscribing'))

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioBase64 = await convertBlobToBase64(audioBlob)
          const response = await fetch('/api/coaching/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'stt', audioBase64 }),
          })
          const data = await response.json()

          if (!response.ok) throw new Error(data.error || t('errorTranscription'))

          setMessage((current) => `${current}${current ? ' ' : ''}${data.text || ''}`.trim())
          setStatusMessage(data.text ? t('statusTranscribed') : t('statusNoText'))
        } catch (error) {
          setStatusMessage(error instanceof Error ? error.message : t('errorMic'))
        } finally {
          setIsLoading(false)
          stream.getTracks().forEach((track) => track.stop())
        }
      }

      recorder.start()
      setIsRecording(true)
      setStatusMessage(t('statusRecording'))
    } catch {
      setStatusMessage(t('errorMic'))
    }
  }

  async function playText(text: string) {
    const cleanText = text.trim()

    if (!cleanText) return

    const response = await fetch('/api/coaching/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'tts', text: cleanText }),
    })

    if (!response.ok) return

    const data = await response.json()

    if (data.audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
      void audio.play()
    }
  }

  return (
    <div className="student-coaching-layout">
      <section className="student-coaching-sidebar">
        <div className="student-sidebar-tabs">
          <button
            type="button"
            onClick={() => setSidebarTab('sessions')}
            className={`student-sidebar-tab ${sidebarTab === 'sessions' ? 'student-sidebar-tab-active' : ''}`}
          >
            <CalendarDays className="h-4 w-4" />
            {t('mySessions')}
            {sessions.length > 0 && (
              <span className="student-sidebar-tab-badge">{sessions.length}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSidebarTab('new')}
            className={`student-sidebar-tab ${sidebarTab === 'new' ? 'student-sidebar-tab-active' : ''}`}
          >
            <Plus className="h-4 w-4" />
            {t('new')}
          </button>
        </div>

        {sidebarTab === 'new' ? (
          <div className="student-sidebar-content">
            <p className="student-coaching-copy">{t('chooseType')}</p>

            <div className="student-mode-selector">
              <button
                type="button"
                onClick={() => setMode('smart')}
                className={`student-mode-option ${mode === 'smart' ? 'student-mode-option-active' : ''}`}
              >
                <div className={`student-mode-icon ${mode === 'smart' ? 'student-mode-icon-active' : ''}`}>
                  <Bot />
                </div>

                <span className="student-flex-content">
                  <span className="student-mode-label">{t('smartCoach')}</span>
                  <span className="student-mode-sub">{t('smartCoachSub')}</span>
                </span>

                {mode === 'smart' && <div className="student-mode-check"><Check /></div>}
              </button>

              <button
                type="button"
                onClick={() => setMode('classic')}
                className={`student-mode-option ${mode === 'classic' ? 'student-mode-option-active' : ''}`}
              >
                <div className={`student-mode-icon ${mode === 'classic' ? 'student-mode-icon-active' : ''}`}>
                  <UserRound />
                </div>

                <span className="student-flex-content">
                  <span className="student-mode-label">{t('humanCoach')}</span>
                  <span className="student-mode-sub">{t('humanCoachSub')}</span>
                </span>

                {mode === 'classic' && <div className="student-mode-check"><Check /></div>}
              </button>
            </div>

            {mode === 'classic' ? (
              <div className="student-coach-panel">
                <div className="student-between-row">
                  <div>
                    <h3 className="student-subsection-title">{t('availableCoaches')}</h3>
                    <p className="student-choice-description">{t('chooseCoach')}</p>
                  </div>

                  {isLoadingCoaches ? <span className="mindly-ui-badge">{t('loading')}</span> : null}
                </div>

                <div className="student-list-stack">
                  {coachesError ? (
                    <div className="mindly-alert mindly-alert-danger">{coachesError}</div>
                  ) : null}

                  {!isLoadingCoaches && availableCoaches.length === 0 ? (
                    <div className="mindly-empty">
                      {t('noCoachAvailable')}
                      <button
                        type="button"
                        onClick={() => { setMode('smart'); setSelectedCoachId(null) }}
                        className="mindly-btn mindly-btn-primary mt-3 w-full"
                      >
                        {t('useSmartCoach')}
                      </button>
                    </div>
                  ) : null}

                  {availableCoaches.map((coach) => (
                    <button
                      key={coach.id}
                      type="button"
                      onClick={() => setSelectedCoachId(coach.id)}
                      className={`student-choice-card ${String(selectedCoachId) === String(coach.id) ? 'student-choice-card-active' : ''}`}
                    >
                      <span className="student-media-row">
                        <span className="student-choice-icon">
                          {coach.avatarUrl ? (
                            <img
                              src={coach.avatarUrl}
                              alt={coach.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <UserRound />
                          )}
                        </span>
                        <span className="student-flex-content">
                          <span className="block truncate text-sm font-semibold">{coach.name}</span>
                          <span className="mindly-ui-badge mt-1">{coach.specialty}</span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              variant="dream"
              size="pillLg"
              onClick={() => { void startSession(); setSidebarTab('sessions') }}
              disabled={isLoading || isLoadingCoaches || (mode === 'classic' && !selectedCoachId)}
              className="mindly-btn mindly-btn-primary student-primary-action"
            >
              <Sparkles className="h-4 w-4" />
              {startButtonLabel}
            </Button>
          </div>
        ) : (
          <div className="student-sidebar-content">
            {sessions.length === 0 ? (
              <div className="mindly-empty student-session-empty">
                <CalendarDays />
                <p className="font-semibold text-[var(--mindly-text-strong)]">{t('noSessions')}</p>
                <p className="mt-1">{t('noSessionsHint')}</p>
                <button
                  type="button"
                  onClick={() => setSidebarTab('new')}
                  className="mindly-btn mindly-btn-primary mt-3 w-full"
                >
                  {t('startNow')}
                </button>
              </div>
            ) : null}

            <div className="student-list-stack">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`student-choice-card student-session-card ${String(selectedSessionId) === String(session.id) ? 'student-choice-card-active' : ''}`}
                >
                  {String(editingSessionId) === String(session.id) ? (
                    <div className="student-edit-stack">
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="student-edit-input"
                        maxLength={120}
                      />
                      <div className="student-icon-action-row">
                        <button
                          type="button"
                          onClick={() => void renameSession(session.id)}
                          className="student-icon-action student-icon-action-md student-icon-action-primary"
                          title={t('save')}
                        >
                          <Check />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingSessionId(null); setEditingTitle('') }}
                          className="student-icon-action student-icon-action-md student-icon-action-muted"
                          title={t('cancel')}
                        >
                          <X />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="student-session-row">
                      <button
                        type="button"
                        onClick={() => setSelectedSessionId(session.id)}
                        className="student-flex-button-content"
                      >
                        <span className="block truncate text-sm font-semibold">
                          {session.mode === 'classic'
                            ? t('humanCoachLabel')
                            : session.title}
                        </span>
                        <span className="student-session-meta">
                          {session.mode === 'smart' ? (
                            <Bot className="student-session-meta-icon" />
                          ) : (
                            <UserRound className="student-session-meta-icon" />
                          )}
                          {session.mode === 'smart'
                            ? t('smartCoachLabel')
                            : getCoachName(session) || t('humanCoach')}{' · '}
                          {session.status === 'open' ? t('sessionOpen') : t('sessionClosed')}
                        </span>
                      </button>

                      <div className="student-session-actions">
                        <button
                          type="button"
                          onClick={() => { setEditingSessionId(session.id); setEditingTitle(session.title) }}
                          className="student-icon-action student-icon-action-sm"
                          title={t('rename')}
                        >
                          <Pencil />
                        </button>

                        {session.mode === 'smart' ? (
                          <button
                            type="button"
                            onClick={() => setSessionToDelete(session)}
                            className="student-icon-action student-icon-action-sm student-icon-action-danger"
                            title={t('delete')}
                          >
                            <Trash2 />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="student-chat-shell">
        <div className="student-chat-header">
          <div className="student-chat-header-inner">
            <div>
              <h2 className="student-chat-title">
                {selectedSession?.title ?? t('noSessionSelected')}
              </h2>
            </div>
            <div className="student-chat-icon"><MessageCircle /></div>
          </div>
        </div>

        <div className="student-chat-scroll">
          {/* Spacer only when no messages — centers the empty state card */}
          {messages.length === 0 && <div className="student-chat-messages-spacer" />}

          <div className={`student-chat-empty student-chat-empty-redesign${messages.length > 0 ? ' student-chat-card-active' : ''}`}>
            {messages.length === 0 ? (
              <>
                <div className="student-empty-hero-icon"><MessageCircle /></div>
                <p className="student-empty-title">{emptyChatTitle}</p>
                <p className="student-empty-description">{emptyChatDescription}</p>

                <div className="student-prompt-grid">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setMessage(prompt)}
                      disabled={!selectedSessionId || selectedSession?.status === 'closed'}
                      className="student-prompt-chip"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {!selectedSessionId ? (
                  <p className="student-empty-helper">{t('hint')}</p>
                ) : null}
              </>
            ) : (
              <div className="student-chat-messages-spacer" />
            )}

            {messages.map((item) => {
            const isMine = item.senderRole === 'student'
            const isEditingMessage = String(editingMessageId) === String(item.id)
            const multipleChoice = parseMultipleChoice(item.content)
            const selectedChoices = selectedChoicesByMessage[String(item.id)] ?? []

            return (
              <div
                key={item.id}
                className={isMine ? 'student-message-row-mine' : 'student-message-row-assistant'}
              >
                {!isMine && (
                  <div
                    className={`student-message-avatar ${
                      item.senderRole === 'ai'
                        ? 'student-message-avatar-ai'
                        : 'student-message-avatar-coach'
                    }`}
                  >
                    {item.senderRole === 'ai' ? <Bot /> : <UserRound />}
                  </div>
                )}

                <div className={`student-message-group ${isMine ? 'student-message-group-mine' : 'student-message-group-assistant'}`}>
                  <div
                    className={`student-message-bubble ${
                      isMine ? 'student-message-bubble-mine' : 'student-message-bubble-assistant'
                    }`}
                  >
                    <p className="student-message-meta">
                      {item.senderRole === 'ai'
                        ? t('smartCoachLabel')
                        : item.senderRole === 'coach'
                          ? (selectedCoachName || t('humanCoach'))
                          : t('you')}
                    </p>

                    {isEditingMessage ? (
                      <div className="student-edit-stack">
                        <textarea
                          value={editingMessageContent}
                          onChange={(event) => setEditingMessageContent(event.target.value)}
                          rows={4}
                          className="student-message-edit-textarea"
                        />
                        <div className="student-icon-action-row-end">
                          <button
                            type="button"
                            onClick={() => void updateMessage(item.id)}
                            className="student-icon-action student-icon-action-md student-icon-action-primary"
                            title={t('save')}
                          >
                            <Check />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingMessageId(null); setEditingMessageContent('') }}
                            className="student-icon-action student-icon-action-md student-icon-action-muted"
                            title={t('cancel')}
                          >
                            <X />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {(multipleChoice?.prompt || item.content) ? (
                          <p className="student-message-content">
                            {multipleChoice?.prompt || item.content}
                          </p>
                        ) : null}

                        {item.attachments && item.attachments.length > 0 ? (
                          <div className="coaching-message-files">
                            {item.attachments.map((att) => {
                              const media = typeof att.media === 'object' && att.media !== null ? att.media as { id: string | number; filename?: string | null; mimeType?: string | null; url?: string | null } : null
                              if (!media?.url) return null
                              const isImage = media.mimeType?.startsWith('image/')
                              return isImage ? (
                                <a
                                  key={att.id}
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="coaching-message-img-link"
                                >
                                  <img
                                    src={media.url}
                                    alt={media.filename ?? 'image'}
                                    className="coaching-message-img"
                                  />
                                </a>
                              ) : (
                                <a
                                  key={att.id}
                                  href={media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="coaching-message-file-link"
                                >
                                  <FileText className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{media.filename ?? 'Fichier'}</span>
                                </a>
                              )
                            })}
                          </div>
                        ) : null}

                        {!isMine && multipleChoice ? (
                          <div className="student-multiple-choice-stack">
                            {multipleChoice.choices.map((choice) => {
                              const checked = selectedChoices.includes(choice.label)

                              return (
                                <label key={choice.label} className="student-choice-option">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      setSelectedChoicesByMessage((current) => {
                                        const currentValues = current[String(item.id)] ?? []
                                        const nextValues = event.target.checked
                                          ? [...currentValues, choice.label]
                                          : currentValues.filter((value) => value !== choice.label)
                                        return { ...current, [String(item.id)]: nextValues }
                                      })
                                    }}
                                    className="student-choice-checkbox"
                                  />
                                  <span>
                                    <span className="font-semibold">{choice.label}.</span>{' '}
                                    {choice.text}
                                  </span>
                                </label>
                              )
                            })}

                            <button
                              type="button"
                              onClick={() => void sendSelectedChoices(item.id, multipleChoice.choices)}
                              disabled={selectedChoices.length === 0 || isLoading}
                              className="student-choice-submit"
                            >
                              {t('sendChoice')}
                            </button>
                          </div>
                        ) : null}

                        {item.senderRole !== 'student' ? (
                          <div className="student-message-action-row">
                            <button
                              type="button"
                              onClick={() => void playText(item.content)}
                              className="student-message-action student-message-action-icon"
                              title={t('listen')}
                            >
                              <Volume2 />
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>

                  {isMine ? (
                    <button
                      type="button"
                      onClick={() => { setEditingMessageId(item.id); setEditingMessageContent(item.content) }}
                      className="student-message-edit-icon"
                      title={t('edit')}
                    >
                      <Pencil />
                    </button>
                  ) : null}
                </div>

                {isMine && (
                  <div className="student-message-avatar student-message-avatar-mine">
                    <UserRound />
                  </div>
                )}
              </div>
            )
          })}

            {isAiTyping && (
              <div className="student-message-row-assistant">
                <div className="student-message-avatar student-message-avatar-assistant">
                  <Bot />
                </div>
                <div className="student-message-bubble student-message-bubble-assistant student-typing-bubble">
                  <div className="student-typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="student-chat-composer">
          {statusMessage ? <p className="student-status-message">{statusMessage}</p> : null}

          {pendingAttachments.length > 0 ? (
            <div className="coaching-pending-attachments">
              {pendingAttachments.map((att) => (
                <div key={att.id} className="coaching-pending-file">
                  {att.mimeType.startsWith('image/') ? (
                    <img src={att.url} alt={att.filename} className="coaching-pending-img" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-[var(--mindly-primary)]" />
                  )}
                  <span className="truncate text-xs">{att.filename}</span>
                  <button
                    type="button"
                    onClick={() => setPendingAttachments((c) => c.filter((a) => a.id !== att.id))}
                    className="coaching-pending-remove"
                    title={t('removeAttachment')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="student-composer-row">
            <button
              type="button"
              onClick={() => void toggleRecording()}
              disabled={!selectedSessionId || isLoading}
              className={`student-recorder-button ${
                isRecording ? 'student-recorder-button-recording' : 'student-recorder-button-idle'
              }`}
              title={isRecording ? t('stop') : t('dictate')}
            >
              {isRecording ? <Square /> : <Mic />}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              className="hidden"
              onChange={(e) => void handleFileUpload(e)}
              disabled={!selectedSessionId || selectedSession?.status === 'closed'}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedSessionId || selectedSession?.status === 'closed' || isUploading}
              className="student-file-button"
              title={t('attachFile')}
            >
              <Paperclip />
            </button>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void sendMessage()
                }
              }}
              disabled={!selectedSessionId || selectedSession?.status === 'closed'}
              rows={1}
              placeholder={selectedSessionId ? t('composerPlaceholder') : t('composerPlaceholderEmpty')}
              className="student-composer-textarea"
            />

            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={(!message.trim() && pendingAttachments.length === 0) || !selectedSessionId || isLoading}
              className="student-send-button"
              title={t('sendChoice')}
            >
              <Send />
            </button>
          </div>
        </div>
      </section>

      {sessionToDelete ? (
        <div className="mindly-modal-backdrop">
          <div className="student-delete-modal-card">
            <div className="student-media-row">
              <div className="student-delete-modal-icon"><Trash2 /></div>
              <div className="student-flex-content">
                <h3 className="student-section-title">{t('deleteTitle')}</h3>
                <p className="student-delete-modal-text">{t('deleteWarning')}</p>
                <p className="student-delete-modal-preview">{sessionToDelete.title}</p>
              </div>
            </div>
            <div className="student-modal-actions">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="student-modal-cancel"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => void deleteSession(sessionToDelete.id)}
                disabled={isLoading}
                className="student-modal-delete"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Conversion audio impossible.'))
    }
    reader.onerror = () => reject(new Error('Lecture audio impossible.'))
    reader.readAsDataURL(blob)
  })
}

type MultipleChoiceOption = { label: string; text: string }

function parseMultipleChoice(
  content: string,
): { choices: MultipleChoiceOption[]; prompt: string } | null {
  const lines = content.split('\n')
  const choices: MultipleChoiceOption[] = []
  const promptLines: string[] = []

  for (const line of lines) {
    const match = line.trim().match(/^([A-D])[.)]\s+(.+)$/i)
    if (match) {
      choices.push({ label: match[1].toUpperCase(), text: match[2].trim() })
    } else {
      promptLines.push(line)
    }
  }

  if (choices.length < 2) return null

  return { choices, prompt: promptLines.join('\n').trim() }
}

function getCoachName(session: CoachingSession | null | undefined): string {
  const coach = session?.coach
  const fullName = `${coach?.firstName ?? ''} ${coach?.lastName ?? ''}`.trim()
  return fullName || coach?.email || ''
}

function deduplicateMessages(messages: CoachingMessage[]): CoachingMessage[] {
  const seen = new Set<string>()
  return messages.filter((msg) => {
    const key = String(msg.id)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
