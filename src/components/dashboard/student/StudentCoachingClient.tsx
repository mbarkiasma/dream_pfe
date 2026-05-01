'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Check,
  MessageCircle,
  Mic,
  Pencil,
  Plus,
  Send,
  Square,
  Trash2,
  UserRound,
  Volume2,
  X,
} from 'lucide-react'

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

type CoachingMessage = {
  id: string | number
  content: string
  createdAt?: string
  senderRole: 'ai' | 'coach' | 'student'
}

type CoachOption = {
  id: string | number
  name: string
  email?: string
  specialty: string
  bio?: string
}

type StudentCoachingClientProps = {
  initialSessions: CoachingSession[]
}

export function StudentCoachingClient({ initialSessions }: StudentCoachingClientProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(
    initialSessions[0]?.id ?? null,
  )
  const [messages, setMessages] = useState<CoachingMessage[]>([])
  const [mode, setMode] = useState<'classic' | 'smart'>('smart')
  const [message, setMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedSessionId)) ?? null,
    [selectedSessionId, sessions],
  )
  const selectedCoachName = getCoachName(selectedSession)
  const messageCount = messages.length

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
        setMessages(data.messages ?? [])
      }
    }

    void loadMessages()

    return () => {
      isMounted = false
    }
  }, [selectedSessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading, editingMessageId])

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
          throw new Error(data.error || 'Impossible de charger les coachs disponibles.')
        }

        if (!isMounted) return

        const coaches = (data.coaches ?? []) as CoachOption[]
        setAvailableCoaches(coaches)
        setSelectedCoachId((current) => current ?? coaches[0]?.id ?? null)

        if (coaches.length === 0) {
          setStatusMessage(
            'Aucun coach humain disponible pour le moment. Vous pouvez utiliser le Smart coach IA.',
          )
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue.'
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
  }, [mode])

  async function startSession() {
    if (mode === 'classic' && !selectedCoachId) {
      setStatusMessage('Choisissez un coach disponible ou passez au Smart coach IA.')
      return
    }

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/coaching/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          coachId: mode === 'classic' ? selectedCoachId : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409 && mode === 'classic') {
          setMode('smart')
          setSelectedCoachId(null)
        }

        throw new Error(data.error || 'Impossible de creer la session.')
      }

      setSessions((current) => [data.session, ...current])
      setSelectedSessionId(data.session.id)
      setMessages([])
      setStatusMessage('Session creee avec succes.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setIsLoading(false)
    }
  }

  async function submitMessage(content: string) {
    const cleanMessage = content.trim()

    if (!selectedSessionId || !cleanMessage || isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/coaching/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          content: cleanMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Message non envoye.')
      }

      setMessages((current) => [
        ...current,
        data.message,
        ...(data.aiMessage ? [data.aiMessage] : []),
      ])
      setMessage('')

      if (data.aiMessage?.content) {
        void playText(data.aiMessage.content)
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setIsLoading(false)
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

    await submitMessage(`Je choisis : ${selectedLabels.join('; ')}`)
    setSelectedChoicesByMessage((current) => ({
      ...current,
      [String(messageId)]: [],
    }))
  }

  async function renameSession(sessionId: string | number) {
    const cleanTitle = editingTitle.trim()

    if (!cleanTitle || isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/coaching/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: cleanTitle,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Renommage impossible.')
      }

      setSessions((current) =>
        current.map((session) =>
          String(session.id) === String(sessionId) ? data.session : session,
        ),
      )
      setEditingSessionId(null)
      setEditingTitle('')
      setStatusMessage('Session renommee.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteSession(sessionId: string | number) {
    if (isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/coaching/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Suppression impossible.')
      }

      setSessions((current) =>
        current.filter((session) => String(session.id) !== String(sessionId)),
      )

      if (String(selectedSessionId) === String(sessionId)) {
        const nextSession = sessions.find((session) => String(session.id) !== String(sessionId))
        setSelectedSessionId(nextSession?.id ?? null)
        setMessages([])
      }

      setStatusMessage('Session supprimee.')
      setSessionToDelete(null)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: cleanMessage,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Modification impossible.')
      }

      setMessages(data.messages ?? [])
      setEditingMessageId(null)
      setEditingMessageContent('')
      setStatusMessage('Message modifie et reponse regeneree.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
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
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        try {
          setIsLoading(true)
          setStatusMessage('Transcription en cours...')

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioBase64 = await convertBlobToBase64(audioBlob)
          const response = await fetch('/api/coaching/voice', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'stt',
              audioBase64,
            }),
          })
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Transcription impossible.')
          }

          setMessage((current) => `${current}${current ? ' ' : ''}${data.text || ''}`.trim())
          setStatusMessage(data.text ? 'Texte transcrit.' : 'Aucun texte detecte.')
        } catch (error) {
          setStatusMessage(error instanceof Error ? error.message : 'Erreur micro.')
        } finally {
          setIsLoading(false)
          stream.getTracks().forEach((track) => track.stop())
        }
      }

      recorder.start()
      setIsRecording(true)
      setStatusMessage('Enregistrement en cours...')
    } catch {
      setStatusMessage("Impossible d'acceder au microphone.")
    }
  }

  async function playText(text: string) {
    const cleanText = text.trim()

    if (!cleanText) return

    const response = await fetch('/api/coaching/voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'tts',
        text: cleanText,
      }),
    })

    if (!response.ok) return

    const data = await response.json()

    if (data.audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`)
      void audio.play()
    }
  }

  const suggestedPrompts = [
    'Je me sens stresse avant mes examens.',
    'Aide-moi a organiser ma semaine.',
    'Je manque de motivation ces derniers jours.',
  ]

  return (
    <div className="student-coaching-layout">
      <section className="student-coaching-sidebar">
        <div className="student-coaching-panel">
          <div className="student-coaching-header-row">
            <div className="student-coaching-icon">
              <Plus />
            </div>
            <div className="student-flex-content">
              <div className="student-coaching-title-row">
                <h2 className="student-section-title">Nouvel accompagnement</h2>
                <span className="dream-badge">{mode === 'smart' ? 'Instantane' : 'Humain'}</span>
              </div>
              <p className="student-coaching-copy">
                Lancez une session adaptee a votre besoin du moment.
              </p>
            </div>
          </div>

          <div className="student-choice-grid">
            <button
              type="button"
              onClick={() => setMode('smart')}
              className={`student-choice-card ${mode === 'smart' ? 'student-choice-card-active' : ''}`}
            >
              <div className="student-choice-content">
                <div
                  className={`student-choice-icon ${mode === 'smart' ? 'student-choice-icon-active' : ''}`}
                >
                  <Bot />
                </div>
                <span className="student-flex-content">
                  <span className="block text-sm font-semibold">Smart coach IA</span>
                  <span className="student-choice-description">
                    Disponible maintenant, avec voix et reponses courtes.
                  </span>
                  <span className="dream-badge dream-badge-spaced">
                    Stress, motivation, organisation
                  </span>
                </span>
                {mode === 'smart' ? <span className="dream-badge">Choisi</span> : null}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('classic')}
              className={`student-choice-card ${mode === 'classic' ? 'student-choice-card-active' : ''}`}
            >
              <div className="student-choice-content">
                <div
                  className={`student-choice-icon ${mode === 'classic' ? 'student-choice-icon-active' : ''}`}
                >
                  <UserRound />
                </div>
                <span className="student-flex-content">
                  <span className="block text-sm font-semibold">Coaching classique</span>
                  <span className="student-choice-description">
                    Une session suivie par un coach humain.
                  </span>
                  <span className="dream-badge dream-badge-spaced">Suivi personnalise</span>
                </span>
                {mode === 'classic' ? <span className="dream-badge">Choisi</span> : null}
              </div>
            </button>
          </div>

          {mode === 'classic' ? (
            <div className="student-coach-panel">
              <div className="student-between-row">
                <div>
                  <h3 className="student-subsection-title">Coachs disponibles</h3>
                  <p className="student-choice-description">
                    Choisissez un coach humain disponible pour commencer la session.
                  </p>
                </div>
                {isLoadingCoaches ? <span className="dream-badge">Chargement</span> : null}
              </div>

              <div className="student-list-stack">
                {coachesError ? <div className="dream-danger-surface">{coachesError}</div> : null}

                {!isLoadingCoaches && availableCoaches.length === 0 ? (
                  <div className="dream-empty-surface">
                    Aucun coach n'est disponible actuellement. Le Smart coach IA reste disponible
                    pour continuer l'accompagnement sans attente.
                    <button
                      type="button"
                      onClick={() => {
                        setMode('smart')
                        setSelectedCoachId(null)
                      }}
                      className="dream-empty-cta"
                    >
                      Utiliser le Smart coach IA
                    </button>
                  </div>
                ) : null}

                {availableCoaches.map((coach) => (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => setSelectedCoachId(coach.id)}
                    className={`student-choice-card ${
                      String(selectedCoachId) === String(coach.id)
                        ? 'student-choice-card-active'
                        : ''
                    }`}
                  >
                    <span className="student-media-row">
                      <span className="student-choice-icon">
                        <UserRound />
                      </span>
                      <span className="student-flex-content">
                        <span className="block truncate text-sm font-semibold">{coach.name}</span>
                        <span className="dream-badge dream-badge-tight">{coach.specialty}</span>
                        {coach.bio ? (
                          <span className="student-choice-description-clamped">{coach.bio}</span>
                        ) : null}
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
            onClick={() => void startSession()}
            disabled={isLoading || isLoadingCoaches || (mode === 'classic' && !selectedCoachId)}
            className="student-primary-action"
          >
            <Plus className="dream-action-icon" />
            Demarrer
          </Button>
        </div>

        <div className="student-coaching-panel-compact">
          <div className="student-between-row-inset">
            <h2 className="student-section-title">Mes sessions</h2>
            <span className="dream-badge">{sessions.length}</span>
          </div>
          <div className="student-list-stack">
            {sessions.length === 0 ? (
              <div className="dream-empty-surface-soft">
                <p className="font-semibold text-dream-heading">Aucune session pour le moment.</p>
                <p className="mt-1">Demarrez un accompagnement pour retrouver vos échanges ici.</p>
              </div>
            ) : null}

            {sessions.map((session) => (
              <div
                key={session.id}
                className={`student-choice-card ${
                  String(selectedSessionId) === String(session.id)
                    ? 'student-choice-card-active'
                    : ''
                }`}
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
                        title="Enregistrer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSessionId(null)
                          setEditingTitle('')
                        }}
                        className="student-icon-action student-icon-action-md student-icon-action-muted"
                        title="Annuler"
                      >
                        <X className="h-4 w-4" />
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
                      <span className="block truncate text-sm font-semibold">{session.title}</span>
                      <span className="mt-1 block text-xs opacity-75">
                        {session.mode === 'smart' ? 'Smart coach IA' : 'Coach humain'} -{' '}
                        {session.status}
                      </span>
                    </button>

                    <div className="student-session-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSessionId(session.id)
                          setEditingTitle(session.title)
                        }}
                        className="student-icon-action student-icon-action-sm"
                        title="Renommer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {session.mode === 'smart' ? (
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(session)}
                          className="student-icon-action student-icon-action-sm student-icon-action-danger"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="student-chat-shell">
        <div className="student-chat-header">
          <div className="student-chat-header-inner">
            <div>
              <h2 className="student-chat-title">
                {selectedSession?.title ?? 'Aucune session selectionnee'}
              </h2>
              <div className="student-chat-badges">
                <span className="dream-badge">
                  {selectedSession?.mode === 'smart'
                    ? 'Smart coach IA'
                    : selectedSession
                      ? selectedCoachName
                      : 'Aucune session'}
                </span>
                <span className="dream-badge">
                  {messageCount} message{messageCount > 1 ? 's' : ''}
                </span>
                {isLoading ? <span className="dream-badge">Reponse en cours</span> : null}
                {selectedSession?.status === 'closed' ? (
                  <span className="dream-badge-muted rounded-full px-3 py-1">Fermee</span>
                ) : null}
              </div>
            </div>
            <div className="student-chat-icon">
              <MessageCircle />
            </div>
          </div>
        </div>

        <div className="student-chat-scroll">
          {messages.length === 0 ? (
            <div className="student-chat-empty">
              <p className="font-semibold text-dream-heading">Commencez simplement.</p>
              <p className="mt-1">
                Ecrivez votre besoin actuel ou choisissez une suggestion pour lancer la discussion.
              </p>
              <div className="dream-action-row mt-4">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    disabled={!selectedSessionId || selectedSession?.status === 'closed'}
                    className="dream-badge border"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

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
    <div
      className={`student-message-bubble ${
        isMine ? 'student-message-bubble-mine' : 'student-message-bubble-assistant'
      }`}
    >
      <p className="student-message-meta">
        {item.senderRole === 'ai'
          ? 'Smart coach'
          : item.senderRole === 'coach'
            ? 'Coach'
            : 'Vous'}
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
              title="Enregistrer"
            >
              <Check />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingMessageId(null)
                setEditingMessageContent('')
              }}
              className="student-icon-action student-icon-action-md student-icon-action-muted"
              title="Annuler"
            >
              <X />
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="student-message-content">{multipleChoice?.prompt || item.content}</p>

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

                          return {
                            ...current,
                            [String(item.id)]: nextValues,
                          }
                        })
                      }}
                      className="student-choice-checkbox"
                    />
                    <span>
                      <span className="font-semibold">{choice.label}.</span> {choice.text}
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
                Envoyer mon choix
              </button>
            </div>
          ) : null}

          {isMine ? (
            <button
              type="button"
              onClick={() => {
                setEditingMessageId(item.id)
                setEditingMessageContent(item.content)
              }}
              className="student-message-action"
            >
              <Pencil />
              Modifier
            </button>
          ) : null}
        </>
      )}

      {item.senderRole !== 'student' ? (
        <button
          type="button"
          onClick={() => void playText(item.content)}
          className="student-message-action"
        >
          <Volume2 />
          Ecouter
        </button>
      ) : null}
    </div>
  </div>
)
})}
<div ref={messagesEndRef} />
</div>

<div className="student-chat-composer">
  {statusMessage ? <p className="student-status-message">{statusMessage}</p> : null}

  <div className="student-composer-row">
    <button
      type="button"
      onClick={() => void toggleRecording()}
      disabled={!selectedSessionId || isLoading}
      className={`student-recorder-button ${
        isRecording ? 'student-recorder-button-recording' : 'student-recorder-button-idle'
      }`}
      title={isRecording ? 'Arreter' : 'Dicter'}
    >
      {isRecording ? <Square /> : <Mic />}
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
      rows={3}
      placeholder={
        selectedSessionId
          ? 'Ecrivez votre message...'
          : 'Demarrez ou selectionnez une session pour ecrire.'
      }
      className="student-composer-textarea"
    />

    <button
      type="button"
      onClick={() => void sendMessage()}
      disabled={!message.trim() || !selectedSessionId || isLoading}
      className="student-send-button"
      title="Envoyer"
    >
      <Send />
    </button>
  </div>

  <div className="student-composer-footer">
    <span>Entree pour envoyer, Shift+Entree pour une nouvelle ligne.</span>
    <span>{message.trim().length} caracteres</span>
  </div>
</div>
</section>

{sessionToDelete ? (
  <div className="dream-modal-backdrop">
    <div className="student-delete-modal-card">
      <div className="student-media-row">
        <div className="student-delete-modal-icon">
          <Trash2 />
        </div>

        <div className="student-flex-content">
          <h3 className="student-section-title">Supprimer la session ?</h3>
          <p className="student-delete-modal-text">
            Cette action supprimera aussi les messages de cette session. Elle ne pourra pas etre
            annulee.
          </p>
          <p className="student-delete-modal-preview">{sessionToDelete.title}</p>
        </div>
      </div>

      <div className="student-modal-actions">
        <button
          type="button"
          onClick={() => setSessionToDelete(null)}
          className="student-modal-cancel"
        >
          Annuler
        </button>

        <button
          type="button"
          onClick={() => void deleteSession(sessionToDelete.id)}
          disabled={isLoading}
          className="student-modal-delete"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
) : null}
</div>
)
}