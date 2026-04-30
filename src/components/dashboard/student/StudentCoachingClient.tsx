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
    <div className="student-coaching grid gap-6 xl:h-[calc(100vh-11rem)] xl:min-h-[640px] xl:grid-cols-[340px_1fr] xl:overflow-hidden">
      <section className="min-h-0 space-y-5 xl:overflow-y-auto xl:pr-1">
        <div className="rounded-[32px] border border-border bg-card/80 p-5 shadow-[0_14px_46px_rgba(170,150,230,0.16)] backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-dream-highlight text-[#8B5CF6] shadow-[0_8px_24px_rgba(109,40,217,0.10)]">
              <Plus className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-dream-heading">Nouvel accompagnement</h2>
                <span className="rounded-full bg-dream-soft px-3 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                  {mode === 'smart' ? 'Instantane' : 'Humain'}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[#7a6a99]">
                Lancez une session adaptee a votre besoin du moment.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => setMode('smart')}
              className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition ${
                mode === 'smart'
                  ? 'border-border bg-gradient-to-br from-[#F3ECFF] to-white text-dream-heading shadow-[0_14px_34px_rgba(109,40,217,0.14)]'
                  : 'border-border bg-card/70 text-[#4B3F72] hover:border-border hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] transition ${
                    mode === 'smart' ? 'bg-white text-[#8B5CF6]' : 'bg-dream-soft text-[#8B5CF6]'
                  }`}
                >
                  <Bot className="h-5 w-5" />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Smart coach IA</span>
                  <span className="mt-1 block text-xs leading-5 text-[#7a6a99]">
                    Disponible maintenant, avec voix et reponses courtes.
                  </span>
                  <span className="mt-2 inline-flex rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                    Stress, motivation, organisation
                  </span>
                </span>
                {mode === 'smart' ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                    Choisi
                  </span>
                ) : null}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('classic')}
              className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition ${
                mode === 'classic'
                  ? 'border-border bg-gradient-to-br from-[#F3ECFF] to-white text-dream-heading shadow-[0_14px_34px_rgba(109,40,217,0.14)]'
                  : 'border-border bg-card/70 text-[#4B3F72] hover:border-border hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] transition ${
                    mode === 'classic' ? 'bg-white text-[#8B5CF6]' : 'bg-dream-soft text-[#8B5CF6]'
                  }`}
                >
                  <UserRound className="h-5 w-5" />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Coaching classique</span>
                  <span className="mt-1 block text-xs leading-5 text-[#7a6a99]">
                    Une session suivie par un coach humain.
                  </span>
                  <span className="mt-2 inline-flex rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                    Suivi personnalise
                  </span>
                </span>
                {mode === 'classic' ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                    Choisi
                  </span>
                ) : null}
              </div>
            </button>
          </div>

          {mode === 'classic' ? (
            <div className="mt-5 rounded-[24px] border border-border bg-[#FBF8FF] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-dream-heading">Coachs disponibles</h3>
                  <p className="mt-1 text-xs leading-5 text-[#7a6a99]">
                    Choisissez un coach humain disponible pour commencer la session.
                  </p>
                </div>
                {isLoadingCoaches ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                    Chargement
                  </span>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                {coachesError ? (
                  <div className="rounded-[20px] border border-rose-100 bg-rose-50/80 p-4 text-sm leading-6 text-rose-700">
                    {coachesError}
                  </div>
                ) : null}

                {!isLoadingCoaches && availableCoaches.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-border bg-card/80 p-4 text-sm leading-6 text-dream-muted">
                    Aucun coach n'est disponible actuellement. Le Smart coach IA reste disponible
                    pour continuer l'accompagnement sans attente.
                    <button
                      type="button"
                      onClick={() => {
                        setMode('smart')
                        setSelectedCoachId(null)
                      }}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-4 py-2 text-xs font-semibold text-white"
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
                    className={`w-full rounded-[20px] border p-4 text-left transition ${
                      String(selectedCoachId) === String(coach.id)
                        ? 'border-border bg-white text-dream-heading shadow-[0_12px_28px_rgba(109,40,217,0.12)]'
                        : 'border-white bg-card/70 text-[#4B3F72] hover:border-border hover:bg-white'
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-dream-highlight text-[#8B5CF6]">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{coach.name}</span>
                        <span className="mt-1 block text-xs font-medium text-[#8B5CF6]">
                          {coach.specialty}
                        </span>
                        {coach.bio ? (
                          <span className="mt-2 block line-clamp-2 text-xs leading-5 text-[#7a6a99]">
                            {coach.bio}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void startSession()}
            disabled={isLoading || isLoadingCoaches || (mode === 'classic' && !selectedCoachId)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition hover:from-violet-600 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            <Plus className="h-4 w-4" />
            Demarrer
          </button>
        </div>

        <div className="rounded-[28px] border border-border bg-card/80 p-4 shadow-[0_10px_40px_rgba(170,150,230,0.14)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-2">
            <h2 className="text-lg font-semibold text-dream-heading">Mes sessions</h2>
            <span className="rounded-full bg-dream-soft px-3 py-1 text-[11px] font-semibold text-[#8B5CF6]">
              {sessions.length}
            </span>
          </div>
          <div className="mt-4 max-h-[340px] space-y-2 overflow-y-auto pr-1 xl:max-h-[420px]">
            {sessions.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border bg-dream-soft p-4 text-sm leading-6 text-[#7a6a99]">
                <p className="font-semibold text-dream-heading">Aucune session pour le moment.</p>
                <p className="mt-1">Demarrez un accompagnement pour retrouver vos échanges ici.</p>
              </div>
            ) : null}

            {sessions.map((session) => (
              <div
                key={session.id}
                className={`w-full rounded-[20px] border p-4 text-left transition ${
                  String(selectedSessionId) === String(session.id)
                    ? 'border-border bg-gradient-to-br from-[#F3ECFF] to-[#FDF7FF] text-dream-heading shadow-[0_12px_30px_rgba(109,40,217,0.14)]'
                    : 'border-border bg-card/70 text-[#4B3F72] hover:border-white hover:bg-white'
                }`}
              >
                {String(editingSessionId) === String(session.id) ? (
                  <div className="space-y-3">
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-dream-heading outline-none focus:border-violet-300"
                      maxLength={120}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void renameSession(session.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-dream-softer0 text-white"
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-dream-highlight text-[#7a6a99]"
                        title="Annuler"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-semibold">{session.title}</span>
                      <span className="mt-1 block text-xs opacity-75">
                        {session.mode === 'smart' ? 'Smart coach IA' : 'Coach humain'} -{' '}
                        {session.status}
                      </span>
                    </button>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSessionId(session.id)
                          setEditingTitle(session.title)
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-card/70 text-current transition hover:bg-white"
                        title="Renommer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {session.mode === 'smart' ? (
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(session)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-card/70 text-current transition hover:bg-rose-500 hover:text-white"
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

      <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-border bg-gradient-to-b from-white/90 via-[#FDF7FF]/90 to-[#F8F3FF]/90 shadow-[0_25px_70px_rgba(109,40,217,0.16)] backdrop-blur-xl xl:min-h-0">
        <div className="shrink-0 border-b border-border bg-white/65 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-dream-heading">
                {selectedSession?.title ?? 'Aucune session selectionnee'}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-dream-highlight px-3 py-1 text-dream-accent">
                  {selectedSession?.mode === 'smart'
                    ? 'Smart coach IA'
                    : selectedSession
                      ? selectedCoachName
                      : 'Aucune session'}
                </span>
                <span className="rounded-full bg-dream-highlight px-3 py-1 text-dream-accent">
                  {messageCount} message{messageCount > 1 ? 's' : ''}
                </span>
                {isLoading ? (
                  <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-fuchsia-700">
                    Reponse en cours
                  </span>
                ) : null}
                {selectedSession?.status === 'closed' ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">Fermee</span>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl bg-dream-highlight p-3 text-[#8B5CF6]">
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-card/70 p-6 text-sm leading-7 text-dream-muted">
              <p className="font-semibold text-dream-heading">Commencez simplement.</p>
              <p className="mt-1">
                Ecrivez votre besoin actuel ou choisissez une suggestion pour lancer la discussion.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    disabled={!selectedSessionId || selectedSession?.status === 'closed'}
                    className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-dream-accent transition hover:bg-dream-soft disabled:cursor-not-allowed disabled:opacity-50"
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
              <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-[24px] px-4 py-3 shadow-sm md:max-w-[78%] ${
                    isMine
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_10px_28px_rgba(139,92,246,0.24)]'
                      : 'border border-border bg-card/85 text-[#4B3F72] shadow-[0_8px_24px_rgba(109,40,217,0.08)]'
                  }`}
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">
                    {item.senderRole === 'ai'
                      ? 'Smart coach'
                      : item.senderRole === 'coach'
                        ? 'Coach'
                        : 'Vous'}
                  </p>
                  {isEditingMessage ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingMessageContent}
                        onChange={(event) => setEditingMessageContent(event.target.value)}
                        rows={4}
                        className="min-h-[104px] w-full resize-none rounded-2xl border border-border bg-white px-3 py-2 text-sm leading-6 text-dream-heading outline-none focus:border-violet-300"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void updateMessage(item.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-dream-softer0 text-white"
                          title="Enregistrer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessageId(null)
                            setEditingMessageContent('')
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-dream-highlight text-[#7a6a99]"
                          title="Annuler"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {multipleChoice?.prompt || item.content}
                      </p>
                      {!isMine && multipleChoice ? (
                        <div className="mt-4 space-y-2">
                          {multipleChoice.choices.map((choice) => {
                            const checked = selectedChoices.includes(choice.label)

                            return (
                              <label
                                key={choice.label}
                                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card/90 px-3 py-2 text-sm text-[#4B3F72] transition hover:bg-dream-soft"
                              >
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
                                  className="mt-1 h-4 w-4 rounded border-slate-300"
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
                            onClick={() =>
                              void sendSelectedChoices(item.id, multipleChoice.choices)
                            }
                            disabled={selectedChoices.length === 0 || isLoading}
                            className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 px-4 py-2 text-xs font-semibold text-white transition hover:from-violet-600 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
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
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium opacity-80 transition hover:opacity-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                      ) : null}
                    </>
                  )}
                  {item.senderRole !== 'student' ? (
                    <button
                      type="button"
                      onClick={() => void playText(item.content)}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium opacity-80 transition hover:opacity-100"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Ecouter
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-border bg-card/85 p-4 backdrop-blur">
          {statusMessage ? (
            <p className="mb-3 rounded-2xl border border-border bg-dream-soft px-4 py-3 text-sm text-dream-muted">
              {statusMessage}
            </p>
          ) : null}
          <div className="flex items-end gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => void toggleRecording()}
              disabled={!selectedSessionId || isLoading}
              className={`inline-flex h-[84px] w-[56px] shrink-0 items-center justify-center rounded-[20px] transition disabled:cursor-not-allowed disabled:bg-slate-300 md:h-[92px] md:w-[64px] ${
                isRecording
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-dream-highlight text-[#8B5CF6] hover:bg-[#eadcff]'
              }`}
              title={isRecording ? 'Arreter' : 'Dicter'}
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
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
              className="min-h-[84px] flex-1 resize-none rounded-[20px] border border-border bg-card/80 px-4 py-3 text-sm leading-6 text-[#4B3F72] outline-none transition placeholder:text-[#9b8bbd] focus:border-violet-300 disabled:cursor-not-allowed disabled:bg-slate-100 md:min-h-[92px]"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!message.trim() || !selectedSessionId || isLoading}
              className="inline-flex h-[84px] w-[64px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition hover:from-violet-600 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none md:h-[92px] md:w-[92px]"
              title="Envoyer"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between px-1 text-xs text-slate-400">
            <span>Entree pour envoyer, Shift+Entree pour une nouvelle ligne.</span>
            <span>{message.trim().length} caracteres</span>
          </div>
        </div>
      </section>
      {sessionToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-white p-6 shadow-[0_30px_90px_rgba(109,40,217,0.24)]">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-dream-heading">Supprimer la session ?</h3>
                <p className="mt-2 text-sm leading-6 text-[#7a6a99]">
                  Cette action supprimera aussi les messages de cette session. Elle ne pourra pas
                  etre annulee.
                </p>
                <p className="mt-3 truncate rounded-2xl bg-dream-soft px-3 py-2 text-sm font-medium text-[#4B3F72]">
                  {sessionToDelete.title}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-[#4B3F72] transition hover:bg-dream-soft"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void deleteSession(sessionToDelete.id)}
                disabled={isLoading}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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

function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Conversion audio impossible.'))
      }
    }

    reader.onerror = () => reject(new Error('Lecture audio impossible.'))
    reader.readAsDataURL(blob)
  })
}

type MultipleChoiceOption = {
  label: string
  text: string
}

function parseMultipleChoice(
  content: string,
): { choices: MultipleChoiceOption[]; prompt: string } | null {
  const lines = content.split('\n')
  const choices: MultipleChoiceOption[] = []
  const promptLines: string[] = []

  for (const line of lines) {
    const match = line.trim().match(/^([A-D])[.)]\s+(.+)$/i)

    if (match) {
      choices.push({
        label: match[1].toUpperCase(),
        text: match[2].trim(),
      })
    } else {
      promptLines.push(line)
    }
  }

  if (choices.length < 2) {
    return null
  }

  return {
    choices,
    prompt: promptLines.join('\n').trim(),
  }
}

function getCoachName(session: CoachingSession | null | undefined): string {
  const coach = session?.coach
  const fullName = `${coach?.firstName ?? ''} ${coach?.lastName ?? ''}`.trim()

  return fullName || coach?.email || 'Coach humain'
}
