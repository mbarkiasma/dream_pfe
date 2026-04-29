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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
      <section className="min-h-0 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur xl:overflow-hidden">
        <div className="px-2">
          <h2 className="text-lg font-semibold text-[#2d1068]">Sessions classiques</h2>
          <p className="mt-1 text-sm leading-6 text-[#7A6A99]">
            Demandes de coaching humain assignees a vous.
          </p>
        </div>
        <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1 xl:max-h-[calc(100%-82px)]">
          {sessions.length === 0 ? (
            <p className="rounded-[20px] bg-[#F8F3FF] p-4 text-sm text-[#7A6A99]">
              Aucune session assignee pour le moment.
            </p>
          ) : null}

          {sessions.map((session) => {
            const studentName = getStudentName(session)
            const lastSender = lastSenderBySession[String(session.id)]
            const hasNewStudentMessage =
              String(selectedSessionId) !== String(session.id) && lastSender === 'student'

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                className={`w-full rounded-[20px] border p-4 text-left transition ${
                  String(selectedSessionId) === String(session.id)
                    ? 'border-violet-200 bg-gradient-to-br from-[#F3ECFF] to-white text-[#2d1068] shadow-[0_12px_30px_rgba(109,40,217,0.14)]'
                    : 'border-white/70 bg-white/70 text-[#4B3F72] hover:border-violet-100 hover:bg-white'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{session.title}</span>
                    <span className="mt-1 block truncate text-xs opacity-75">{studentName}</span>
                    <span className="mt-2 inline-flex rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold text-[#8B5CF6]">
                      {messageCountBySession[String(session.id)] ?? 0} message
                      {(messageCountBySession[String(session.id)] ?? 0) > 1 ? 's' : ''}
                    </span>
                  </span>
                  {hasNewStudentMessage ? (
                    <span className="shrink-0 rounded-full bg-fuchsia-100 px-2.5 py-1 text-[11px] font-bold text-fuchsia-700">
                      Nouveau
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid min-h-0 gap-6 2xl:grid-cols-[1fr_360px]">
        <div className="flex min-h-[660px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-gradient-to-b from-white/90 via-[#FDF7FF]/90 to-[#F8F3FF]/90 shadow-[0_25px_70px_rgba(109,40,217,0.14)] backdrop-blur-xl xl:min-h-0">
          <div className="shrink-0 border-b border-white/70 bg-white/65 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#2d1068]">
                  {selectedSession?.title ?? 'Aucune session selectionnee'}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3ECFF] px-3 py-1 text-[#6D28D9]">
                    <UserRound className="h-3.5 w-3.5" />
                    {selectedStudentName}
                  </span>
                  <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-[#6D28D9]">
                    Coaching humain
                  </span>
                  <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-[#6D28D9]">
                    {messages.length} message{messages.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl bg-[#F3ECFF] p-3 text-[#8B5CF6]">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-violet-200 bg-white/70 p-6 text-sm leading-7 text-[#6E628F]">
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
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_10px_28px_rgba(139,92,246,0.24)]'
                        : 'border border-white/80 bg-white/85 text-[#4B3F72] shadow-[0_8px_24px_rgba(109,40,217,0.08)]'
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

          <div className="shrink-0 border-t border-white/70 bg-white/85 p-4 backdrop-blur">
            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={() => void toggleRecording()}
                disabled={!selectedSessionId || isLoading}
                className={`inline-flex h-[92px] w-[64px] shrink-0 items-center justify-center rounded-[22px] transition disabled:cursor-not-allowed disabled:bg-slate-300 ${
                  isRecording
                    ? 'bg-rose-700 text-white hover:bg-rose-800'
                    : 'bg-[#F3ECFF] text-[#8B5CF6] hover:bg-[#eadcff]'
                }`}
                title={isRecording ? 'Arreter' : 'Dicter'}
              >
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                placeholder="Repondre a l'etudiant..."
                className="min-h-[92px] flex-1 resize-none rounded-[22px] border border-violet-100 bg-white/80 px-4 py-3 text-sm leading-6 text-[#4B3F72] outline-none transition placeholder:text-[#9b8bbd] focus:border-violet-300"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!message.trim() || !selectedSessionId || isLoading}
                className="inline-flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)] transition hover:from-violet-600 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                title="Envoyer"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <aside className="flex min-h-[660px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur xl:min-h-0">
          <div className="shrink-0 border-b border-violet-100/70 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#F3ECFF] p-3 text-[#8B5CF6]">
                <ClipboardPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2d1068]">Note de suivi</h2>
                <p className="text-sm text-[#7A6A99]">Visible dans Payload pour le suivi.</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {selectedSession ? (
              <div className="rounded-[22px] border border-violet-100 bg-[#F8F3FF] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9B6BFF]">
                  Etudiant
                </p>
                <p className="mt-2 text-sm font-semibold text-[#2d1068]">{selectedStudentName}</p>
                {selectedSession.student?.email ? (
                  <p className="mt-1 truncate text-xs text-[#7A6A99]">
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
              className="mt-5 w-full resize-none rounded-[22px] border border-violet-100 bg-white/80 px-4 py-3 text-sm leading-7 text-[#4B3F72] outline-none transition placeholder:text-[#9b8bbd] focus:border-violet-300"
            />

            <button
              type="button"
              onClick={() => void saveNote()}
              disabled={!note.trim() || !selectedSessionId || isLoading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-violet-500 to-fuchsia-400 px-4 py-3 text-sm font-semibold text-white transition hover:from-violet-600 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
            >
              Enregistrer la note
            </button>

            {statusMessage ? (
              <p className="mt-4 rounded-2xl border border-white/70 bg-[#F8F3FF] px-4 py-3 text-sm text-[#6E628F]">
                {statusMessage}
              </p>
            ) : null}

            <div className="mt-6 border-t border-violet-100 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#2d1068]">Notes precedentes</h3>
                  <p className="mt-1 text-xs text-[#7A6A99]">
                    Historique de suivi pour cette session.
                  </p>
                </div>
                <span className="rounded-full bg-[#F3ECFF] px-3 py-1 text-xs font-semibold text-[#8B5CF6]">
                  {savedNotes.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {savedNotes.length === 0 ? (
                  <p className="rounded-[18px] border border-dashed border-violet-200 bg-white/60 p-4 text-sm leading-6 text-[#7A6A99]">
                    Aucune note enregistree pour cette session.
                  </p>
                ) : null}

                {savedNotes.map((savedNote) => (
                  <article
                    key={savedNote.id}
                    className="rounded-[20px] border border-white/80 bg-white/75 p-4 shadow-[0_8px_24px_rgba(109,40,217,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="min-w-0 truncate text-sm font-semibold text-[#2d1068]">
                        {savedNote.title}
                      </h4>
                      <div className="flex shrink-0 items-center gap-1">
                        {savedNote.createdAt ? (
                          <time className="mr-1 text-[11px] font-medium text-[#9B8BBD]">
                            {formatShortDate(savedNote.createdAt)}
                          </time>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(savedNote.id)
                            setEditingNoteContent(savedNote.content)
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3ECFF] text-[#6D28D9] transition hover:bg-[#eadcff]"
                          title="Modifier la note"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteToDelete(savedNote)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-500 hover:text-white"
                          title="Supprimer la note"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {String(editingNoteId) === String(savedNote.id) ? (
                      <div className="mt-3 space-y-3">
                        <textarea
                          value={editingNoteContent}
                          onChange={(event) => setEditingNoteContent(event.target.value)}
                          rows={5}
                          className="w-full resize-none rounded-[18px] border border-violet-100 bg-white px-3 py-2 text-sm leading-6 text-[#4B3F72] outline-none focus:border-violet-300"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void updateNote(savedNote.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-white"
                            title="Enregistrer"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(null)
                              setEditingNoteContent('')
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3ECFF] text-[#7a6a99]"
                            title="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6E628F]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1068]/35 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[30px] border border-white/70 bg-gradient-to-br from-white via-[#FDF7FF] to-[#F3ECFF] p-6 shadow-[0_30px_90px_rgba(109,40,217,0.28)]">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B6BFF]">
                  Confirmation
                </p>
                <h3 className="mt-2 text-xl font-bold text-[#2d1068]">Supprimer cette note ?</h3>
                <p className="mt-3 text-sm leading-6 text-[#6E628F]">
                  Cette note sera supprimee de l'historique de suivi et de Payload. Cette action ne
                  pourra pas etre annulee.
                </p>
                <div className="mt-4 rounded-[20px] border border-white/80 bg-white/75 p-4">
                  <p className="truncate text-sm font-semibold text-[#2d1068]">
                    {noteToDelete.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#7A6A99]">
                    {noteToDelete.content}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="rounded-2xl border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-[#4B3F72] transition hover:bg-[#F8F3FF]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void deleteNote(noteToDelete.id)}
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
