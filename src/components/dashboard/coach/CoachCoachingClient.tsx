'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ClipboardPlus,
  MessageCircle,
  Mic,
  Pencil,
  Send,
  Square,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

type CoachingSession = {
  id: string | number
  title: string
  mode: 'classic' | 'smart'
  status: 'closed' | 'open'
  student?: {
    email?: string
    firstName?: string
    id: string | number
    lastName?: string
  }
}

type CoachingMessage = {
  id: string | number
  content: string
  createdAt?: string
  senderRole: 'ai' | 'coach' | 'student'
}

type CoachNote = {
  id: string | number
  content: string
  createdAt?: string
  title: string
}

type CoachCoachingClientProps = {
  initialSessions: CoachingSession[]
}

export function CoachCoachingClient({ initialSessions }: CoachCoachingClientProps) {
  const [sessions] = useState(initialSessions)
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(
    initialSessions[0]?.id ?? null,
  )
  const [messages, setMessages] = useState<CoachingMessage[]>([])
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const [savedNotes, setSavedNotes] = useState<CoachNote[]>([])
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | number | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<CoachNote | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [lastSenderBySession, setLastSenderBySession] = useState<
    Record<string, CoachingMessage['senderRole']>
  >({})
  const [messageCountBySession, setMessageCountBySession] = useState<Record<string, number>>({})
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedSessionId)) ?? null,
    [selectedSessionId, sessions],
  )
  const selectedStudentName = getStudentName(selectedSession)

  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([])
      return
    }

    let isMounted = true

    async function loadMessages({ silent = false }: { silent?: boolean } = {}) {
      const response = await fetch(`/api/coaching/sessions/${selectedSessionId}/messages`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (isMounted && response.ok) {
        const nextMessages = (data.messages ?? []) as CoachingMessage[]

        setMessages((current) => {
          if (areSameMessages(current, nextMessages)) return current
          return nextMessages
        })
        setLastSenderBySession((current) => ({
          ...current,
          [String(selectedSessionId)]:
            nextMessages.at(-1)?.senderRole ?? current[String(selectedSessionId)],
        }))
        setMessageCountBySession((current) => ({
          ...current,
          [String(selectedSessionId)]: nextMessages.length,
        }))
      } else if (isMounted && !silent) {
        setStatusMessage(data.error || 'Impossible de charger les messages.')
      }
    }

    void loadMessages()

    const interval = window.setInterval(() => {
      void loadMessages({ silent: true })
    }, 5000)

    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [selectedSessionId])

  useEffect(() => {
    if (!selectedSessionId) {
      setSavedNotes([])
      return
    }

    let isMounted = true

    async function loadNotes() {
      const response = await fetch(`/api/coaching/notes?sessionId=${selectedSessionId}`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (isMounted && response.ok) {
        setSavedNotes((data.notes ?? []) as CoachNote[])
      } else if (isMounted) {
        setStatusMessage(data.error || 'Impossible de charger les notes.')
      }
    }

    void loadNotes()

    return () => {
      isMounted = false
    }
  }, [selectedSessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  async function sendMessage() {
    if (!selectedSessionId || !message.trim()) return

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
          content: message,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Message non envoye.')
      }

      setMessages((current) => [...current, data.message])
      setLastSenderBySession((current) => ({
        ...current,
        [String(selectedSessionId)]: 'coach',
      }))
      setMessageCountBySession((current) => ({
        ...current,
        [String(selectedSessionId)]: (current[String(selectedSessionId)] ?? messages.length) + 1,
      }))
      setMessage('')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setIsLoading(false)
    }
  }

  async function saveNote() {
    if (!selectedSessionId || !note.trim()) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/coaching/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          title: selectedSession?.title ? `Suivi - ${selectedSession.title}` : 'Note de suivi',
          content: note,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Note non enregistree.')
      }

      setSavedNotes((current) => [data.note, ...current])
      setNote('')
      setStatusMessage('Note de suivi enregistree.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateNote(noteId: string | number) {
    const cleanContent = editingNoteContent.trim()

    if (!cleanContent || isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/coaching/notes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          content: cleanContent,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Modification impossible.')
      }

      setSavedNotes((current) =>
        current.map((currentNote) =>
          String(currentNote.id) === String(noteId) ? data.note : currentNote,
        ),
      )
      setEditingNoteId(null)
      setEditingNoteContent('')
      setStatusMessage('Note modifiee.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Erreur inattendue.')
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteNote(noteId: string | number) {
    if (isLoading) return

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await fetch(`/api/coaching/notes?noteId=${noteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Suppression impossible.')
      }

      setSavedNotes((current) =>
        current.filter((currentNote) => String(currentNote.id) !== String(noteId)),
      )
      setNoteToDelete(null)
      setStatusMessage('Note supprimee.')
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

  return (
    <div className="grid gap-6 xl:h-[calc(100vh-11rem)] xl:min-h-[660px] xl:grid-cols-[340px_1fr] xl:overflow-hidden">
      <section className="dream-card-glass min-h-0 rounded-[28px] border p-4 xl:overflow-hidden">
        <div className="px-2">
          <h2 className="text-lg font-semibold text-dream-heading">Sessions classiques</h2>
          <p className="mt-1 text-sm leading-6 text-dream-muted">
            Demandes de coaching humain assignees a vous.
          </p>
        </div>
        <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1 xl:max-h-[calc(100%-82px)]">
          {sessions.length === 0 ? (
            <p className="dream-surface-muted rounded-[20px] border p-4 text-sm text-dream-muted">
              Aucune session assignee pour le moment.
            </p>
          ) : null}

          {sessions.map((session) => {
            const studentName = getStudentName(session)
            const lastSender = lastSenderBySession[String(session.id)]
            const hasNewStudentMessage =
              String(selectedSessionId) !== String(session.id) && lastSender === 'student'

            return (
              <Button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                size="card"
                variant={String(selectedSessionId) === String(session.id) ? 'panelActive' : 'panel'}
                className="w-full rounded-[20px] p-4"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{session.title}</span>
                    <span className="mt-1 block truncate text-xs opacity-75">{studentName}</span>
                    <span className="dream-pill-accent mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                      {messageCountBySession[String(session.id)] ?? 0} message
                      {(messageCountBySession[String(session.id)] ?? 0) > 1 ? 's' : ''}
                    </span>
                  </span>
                  {hasNewStudentMessage ? (
                    <span className="dream-badge shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold">
                      Nouveau
                    </span>
                  ) : null}
                </span>
              </Button>
            )
          })}
        </div>
      </section>

      <section className="grid min-h-0 gap-6 2xl:grid-cols-[1fr_360px]">
        <div className="flex min-h-[660px] flex-col overflow-hidden rounded-[30px] border dream-panel-bg shadow-dream-card-lg xl:min-h-0">
          <div className="dream-surface shrink-0 border-b p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-dream-heading">
                  {selectedSession?.title ?? 'Aucune session selectionnee'}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="dream-badge inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                    <UserRound className="h-3.5 w-3.5" />
                    {selectedStudentName}
                  </span>
                  <span className="dream-badge rounded-full border px-3 py-1">Coaching humain</span>
                  <span className="dream-badge rounded-full border px-3 py-1">
                    {messages.length} message{messages.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="dream-icon-soft rounded-2xl p-3">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="dream-card-dashed rounded-[24px] border p-6 text-sm leading-7 text-dream-muted">
                Aucun message pour cette session. Vous pouvez attendre le premier message de
                l'etudiant ou envoyer un message d'accueil.
              </div>
            ) : null}

            {messages.map((item) => {
              const isMine = item.senderRole === 'coach'

              return (
                <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-[24px] px-4 py-3 ${
                      isMine
                        ? 'dream-brand-bg text-dream-accent-foreground shadow-dream-card'
                        : 'dream-surface border text-dream-heading shadow-dream-card'
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">
                      {item.senderRole === 'student' ? 'Etudiant' : 'Coach'}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-7">{item.content}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="dream-surface shrink-0 border-t p-4">
            <div className="flex items-end gap-3">
              <Button
                type="button"
                onClick={() => void toggleRecording()}
                disabled={!selectedSessionId || isLoading}
                variant={isRecording ? 'destructive' : 'dreamSoft'}
                className="h-[92px] w-[64px] shrink-0 rounded-[22px]"
                title={isRecording ? 'Arreter' : 'Dicter'}
              >
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                placeholder="Repondre a l'etudiant..."
                className="dream-field min-h-[92px] flex-1 resize-none rounded-[22px] border px-4 py-3 text-sm leading-6 outline-none"
              />
              <Button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!message.trim() || !selectedSessionId || isLoading}
                variant="dream"
                className="h-[92px] w-[92px] shrink-0 rounded-[22px] disabled:shadow-none"
                title="Envoyer"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="dream-card-glass flex min-h-[660px] flex-col overflow-hidden rounded-[30px] border xl:min-h-0">
          <div className="shrink-0 border-b border-border/70 p-5">
            <div className="flex items-center gap-3">
              <div className="dream-icon-soft rounded-2xl p-3">
                <ClipboardPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dream-heading">Note de suivi</h2>
                <p className="text-sm text-dream-muted">Visible dans Payload pour le suivi.</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {selectedSession ? (
              <div className="dream-surface-muted rounded-[22px] border p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-dream-accent">
                  Etudiant
                </p>
                <p className="mt-2 text-sm font-semibold text-dream-heading">
                  {selectedStudentName}
                </p>
                {selectedSession.student?.email ? (
                  <p className="mt-1 truncate text-xs text-dream-muted">
                    {selectedSession.student.email}
                  </p>
                ) : null}
              </div>
            ) : null}

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={6}
              placeholder="Observations, objectifs, prochaines actions..."
              className="dream-field mt-5 w-full resize-none rounded-[22px] border px-4 py-3 text-sm leading-7 outline-none"
            />

            <Button
              type="button"
              onClick={() => void saveNote()}
              disabled={!note.trim() || !selectedSessionId || isLoading}
              variant="dream"
              className="mt-4 w-full rounded-[18px]"
            >
              Enregistrer la note
            </Button>

            {statusMessage ? (
              <p className="dream-badge-muted mt-4 rounded-2xl border px-4 py-3 text-sm">
                {statusMessage}
              </p>
            ) : null}

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-dream-heading">Notes precedentes</h3>
                  <p className="mt-1 text-xs text-dream-muted">
                    Historique de suivi pour cette session.
                  </p>
                </div>
                <span className="dream-badge rounded-full border px-3 py-1 text-xs font-semibold">
                  {savedNotes.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {savedNotes.length === 0 ? (
                  <p className="dream-card-dashed rounded-[18px] border p-4 text-sm leading-6 text-dream-muted">
                    Aucune note enregistree pour cette session.
                  </p>
                ) : null}

                {savedNotes.map((savedNote) => (
                  <article
                    key={savedNote.id}
                    className="dream-surface rounded-[20px] border p-4 shadow-dream-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="min-w-0 truncate text-sm font-semibold text-dream-heading">
                        {savedNote.title}
                      </h4>
                      <div className="flex shrink-0 items-center gap-1">
                        {savedNote.createdAt ? (
                          <time className="mr-1 text-[11px] font-medium text-dream-muted">
                            {formatShortDate(savedNote.createdAt)}
                          </time>
                        ) : null}
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(savedNote.id)
                            setEditingNoteContent(savedNote.content)
                          }}
                          variant="dreamSoft"
                          size="iconSm"
                          className="h-8 w-8"
                          title="Modifier la note"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setNoteToDelete(savedNote)}
                          variant="destructive"
                          size="iconSm"
                          className="h-8 w-8"
                          title="Supprimer la note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {String(editingNoteId) === String(savedNote.id) ? (
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={editingNoteContent}
                          onChange={(event) => setEditingNoteContent(event.target.value)}
                          rows={5}
                          className="dream-field w-full resize-none rounded-[18px] border px-3 py-2 text-sm leading-6 outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            onClick={() => void updateNote(savedNote.id)}
                            variant="dream"
                            size="iconSm"
                            title="Enregistrer"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(null)
                              setEditingNoteContent('')
                            }}
                            variant="dreamOutline"
                            size="iconSm"
                            title="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-dream-muted">
                        {savedNote.content}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>
      {noteToDelete ? (
        <div className="dream-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[30px] border dream-panel-bg p-6 shadow-dream-card-lg">
            <div className="flex items-start gap-4">
              <div className="dream-status-failed rounded-2xl border p-3">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-dream-accent">
                  Confirmation
                </p>
                <h3 className="mt-2 text-xl font-bold text-dream-heading">
                  Supprimer cette note ?
                </h3>
                <p className="mt-3 text-sm leading-6 text-dream-muted">
                  Cette note sera supprimee de l'historique de suivi et de Payload. Cette action ne
                  pourra pas etre annulee.
                </p>
                <div className="dream-surface mt-4 rounded-[20px] border p-4">
                  <p className="truncate text-sm font-semibold text-dream-heading">
                    {noteToDelete.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-dream-muted">
                    {noteToDelete.content}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setNoteToDelete(null)}
                variant="dreamOutline"
                size="pill"
                className="rounded-2xl"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={() => void deleteNote(noteToDelete.id)}
                disabled={isLoading}
                variant="destructive"
                size="pill"
                className="rounded-2xl"
              >
                Supprimer
              </Button>
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

function getStudentName(session: CoachingSession | null | undefined): string {
  const student = session?.student
  const fullName = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim()

  return fullName || student?.email || 'Etudiant'
}

function areSameMessages(current: CoachingMessage[], next: CoachingMessage[]): boolean {
  if (current.length !== next.length) return false

  return current.every((message, index) => {
    const nextMessage = next[index]

    return (
      String(message.id) === String(nextMessage?.id) &&
      message.content === nextMessage.content &&
      message.senderRole === nextMessage.senderRole
    )
  })
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value))
}
