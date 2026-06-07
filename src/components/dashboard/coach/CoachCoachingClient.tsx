'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Check,
  ClipboardPlus,
  FileText,
  MessageCircle,
  Mic,
  Paperclip,
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

type CoachNote = {
  canManage?: boolean
  coach?:
    | {
        email?: string
        firstName?: string
        id: string | number
        lastName?: string
      }
    | string
    | number
  id: string | number
  content: string
  createdAt?: string
  title: string
}

type CoachCoachingClientProps = {
  initialSessions: CoachingSession[]
}

export function CoachCoachingClient({ initialSessions }: CoachCoachingClientProps) {
  const t = useTranslations('dashboard.coach.coaching')
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
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<CoachNote | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [lastSenderBySession, setLastSenderBySession] = useState<
    Record<string, CoachingMessage['senderRole']>
  >({})
  const [messageCountBySession, setMessageCountBySession] = useState<Record<string, number>>({})
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
        const nextMessages = deduplicateMessages((data.messages ?? []) as CoachingMessage[])

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
          if (!res.ok) throw new Error(data.error || "Échec de l'envoi du fichier.")
          return data as PendingAttachment
        }),
      )
      setPendingAttachments((current) => [...current, ...uploads])
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Erreur lors de l'envoi.")
    } finally {
      setIsUploading(false)
      if (event.target) event.target.value = ''
    }
  }

  async function sendMessage() {
    const hasAttachments = pendingAttachments.length > 0
    if (!selectedSessionId || (!message.trim() && !hasAttachments)) return

    setIsLoading(true)
    setStatusMessage('')

    const attachmentsSnapshot = [...pendingAttachments]
    setPendingAttachments([])

    try {
      const response = await fetch('/api/coaching/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          content: message,
          attachments: attachmentsSnapshot.map((a) => a.id),
        }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Message non envoyé.')

      setMessages((current) => [...current, data.message])
      setLastSenderBySession((current) => ({ ...current, [String(selectedSessionId)]: 'coach' }))
      setMessageCountBySession((current) => ({
        ...current,
        [String(selectedSessionId)]: (current[String(selectedSessionId)] ?? messages.length) + 1,
      }))
      setMessage('')
    } catch (error) {
      setPendingAttachments(attachmentsSnapshot)
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          title: selectedSession?.title ? `Suivi - ${selectedSession.title}` : 'Note de suivi',
          content: note,
        }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Note non enregistrée.')

      setSavedNotes((current) => [{ ...data.note, canManage: true }, ...current])
      setNote('')
      setStatusMessage('Note de suivi enregistrée.')
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content: cleanContent }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Modification impossible.')

      setSavedNotes((current) =>
        current.map((n) => (String(n.id) === String(noteId) ? data.note : n)),
      )
      setEditingNoteId(null)
      setEditingNoteContent('')
      setStatusMessage('Note modifiée.')
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
      const response = await fetch(`/api/coaching/notes?noteId=${noteId}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Suppression impossible.')

      setSavedNotes((current) => current.filter((n) => String(n.id) !== String(noteId)))
      setNoteToDelete(null)
      setStatusMessage('Note supprimée.')
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        try {
          setIsLoading(true)
          setStatusMessage('Transcription en cours...')

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const audioBase64 = await convertBlobToBase64(audioBlob)
          const response = await fetch('/api/coaching/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'stt', audioBase64 }),
          })
          const data = await response.json()

          if (!response.ok) throw new Error(data.error || 'Transcription impossible.')

          setMessage((current) => `${current}${current ? ' ' : ''}${data.text || ''}`.trim())
          setStatusMessage(data.text ? 'Texte transcrit.' : 'Aucun texte détecté.')
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
      setStatusMessage("Impossible d'accéder au microphone.")
    }
  }

  return (
    <div className="coach-coaching-layout">

      {/* Sidebar — Sessions uniquement */}
      <aside className="student-coaching-sidebar">

        {/* Sessions */}
        <div className="student-coaching-panel">
          <div className="student-coaching-title-row">
            <h2 className="mindly-feature-title">{t('classicSessions')}</h2>
            <span className="mindly-ui-badge">{sessions.length}</span>
          </div>

          <div className="student-list-stack">
            {sessions.length === 0 ? (
              <p className="mindly-feature-text">{t('noSession')}</p>
            ) : null}

            {sessions.map((session) => {
              const studentName = getStudentName(session)
              const lastSender = lastSenderBySession[String(session.id)]
              const hasNew =
                String(selectedSessionId) !== String(session.id) && lastSender === 'student'
              const isActive = String(selectedSessionId) === String(session.id)
              const count = messageCountBySession[String(session.id)] ?? 0

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`coach-session-pill w-full text-left${isActive ? ' coach-session-pill-active' : ''}`}
                >
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{session.title}</p>
                  {hasNew ? (
                    <span className="mindly-ui-badge mindly-ui-badge-danger shrink-0">{t('badgeNew')}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

      </aside>


      {/* ── Chat (droite, majorité de l'espace) ── */}
      <div className="student-chat-shell">
          <div className="student-chat-header">
            <div className="student-chat-header-inner">
              <div className="student-chat-badges">
                <span className="mindly-ui-badge flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" />
                  {selectedStudentName}
                </span>
              </div>
              <div className="student-chat-header-actions">
                <Button
                  type="button"
                  onClick={() => setIsNotesDrawerOpen(true)}
                  variant="dreamOutline"
                  size="pill"
                  className="coach-notes-drawer-trigger"
                  title="Ouvrir les notes de suivi"
                >
                  <ClipboardPlus />
                  Notes
                  {savedNotes.length > 0 ? (
                    <span className="mindly-ui-badge">{savedNotes.length}</span>
                  ) : null}
                </Button>
                <div className="mindly-feature-icon">
                  <MessageCircle />
                </div>
              </div>
            </div>
          </div>

          <div className="student-chat-scroll">
            {messages.length === 0 ? (
              <div className="student-chat-empty">{t('noMessage')}</div>
            ) : null}

            {messages.map((item) => {
              const isMine = item.senderRole === 'coach'
              return (
                <div
                  key={item.id}
                  className={isMine ? 'student-message-row-mine' : 'student-message-row-assistant'}
                >
                  <div
                    className={`student-message-bubble ${
                      isMine
                        ? 'student-message-bubble-mine'
                        : 'student-message-bubble-assistant'
                    }`}
                  >
                    <p className="student-message-meta">
                      {item.senderRole === 'student' ? t('senderStudent') : t('senderCoach')}
                    </p>
                    {item.content ? (
                      <p className="student-message-content">{item.content}</p>
                    ) : null}
                    {item.attachments && item.attachments.length > 0 ? (
                      <div className="coaching-message-files">
                        {item.attachments.map((att) => {
                          const media = typeof att.media === 'object' && att.media !== null
                            ? att.media as { id: string | number; filename?: string | null; mimeType?: string | null; url?: string | null }
                            : null
                          if (!media?.url) return null
                          const isImage = media.mimeType?.startsWith('image/')
                          return isImage ? (
                            <a key={att.id} href={media.url} target="_blank" rel="noopener noreferrer" className="coaching-message-img-link">
                              <img src={media.url} alt={media.filename ?? 'image'} className="coaching-message-img" />
                            </a>
                          ) : (
                            <a key={att.id} href={media.url} target="_blank" rel="noopener noreferrer" className="coaching-message-file-link">
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate">{media.filename ?? 'Fichier'}</span>
                            </a>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
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
                      title="Retirer"
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
                className={`student-recorder-button ${isRecording ? 'student-recorder-button-recording' : 'student-recorder-button-idle'}`}
                title={isRecording ? 'Arrêter' : 'Dicter'}
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
                disabled={!selectedSessionId}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedSessionId || isUploading}
                className="student-file-button"
                title="Joindre un fichier"
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
                rows={1}
                placeholder={t('replyPlaceholder')}
                className="student-composer-textarea"
              />

              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={(!message.trim() && pendingAttachments.length === 0) || !selectedSessionId || isLoading}
                className="student-send-button"
                title="Envoyer"
              >
                <Send />
              </button>
            </div>
          </div>
        </div>


      {/* Drawer Notes de suivi — slide depuis la droite */}
      <div className={`coach-notes-drawer${isNotesDrawerOpen ? ' coach-notes-drawer-open' : ''}`} aria-hidden={!isNotesDrawerOpen}>
        <div className="coach-notes-drawer-header">
          <h2 className="mindly-feature-title">{t('notesTitle')}</h2>
          <Button
            type="button"
            onClick={() => setIsNotesDrawerOpen(false)}
            variant="dreamOutline"
            size="iconSm"
            className="coach-notes-drawer-close"
            title="Fermer les notes"
          >
            <X />
          </Button>
        </div>

        <div className="coach-notes-drawer-body">
          {selectedSession ? (
            <>
              <div className="student-dreams-latest-box">
                <p className="mindly-dashboard-eyebrow">{t('notesStudent')}</p>
                <p className="mindly-feature-reference mt-1">{selectedStudentName}</p>
                {selectedSession.student?.email ? (
                  <p className="mindly-feature-text mt-0.5 truncate">{selectedSession.student.email}</p>
                ) : null}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder={t('notesPlaceholder')}
                className="dream-field mt-4 w-full resize-none rounded-[16px] border px-3 py-2.5 text-sm leading-6 outline-none"
              />

              <Button
                type="button"
                onClick={() => void saveNote()}
                disabled={!note.trim() || isLoading}
                variant="dream"
                className="mt-2 w-full rounded-[14px]"
              >
                {t('notesSave')}
              </Button>

              {statusMessage ? (
                <p className="mindly-ui-badge mt-2 block w-full px-3 py-1.5 text-center text-xs">
                  {statusMessage}
                </p>
              ) : null}

              {savedNotes.length > 0 ? (
                <div className="mt-4 border-t border-[var(--mindly-border)] pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="mindly-feature-reference text-sm">{t('notesPrevious')}</p>
                    <span className="mindly-ui-badge">{savedNotes.length}</span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {savedNotes.map((savedNote) => (
                      <article key={savedNote.id} className="coach-note-card">
                        <div className="flex items-start justify-between gap-1">
                          <p className="mindly-feature-reference min-w-0 truncate text-xs">{savedNote.title}</p>
                          <div className="flex shrink-0 items-center gap-0.5">
                            {savedNote.createdAt ? (
                              <time className="mindly-feature-text text-[10px]">{formatShortDate(savedNote.createdAt)}</time>
                            ) : null}
                            {savedNote.canManage ? (
                              <>
                                <Button type="button" onClick={() => { setEditingNoteId(savedNote.id); setEditingNoteContent(savedNote.content) }} variant="dreamSoft" size="iconSm" className="h-6 w-6" title="Modifier"><Pencil className="h-2.5 w-2.5" /></Button>
                                <Button type="button" onClick={() => setNoteToDelete(savedNote)} variant="destructive" size="iconSm" className="h-6 w-6" title="Supprimer"><Trash2 className="h-2.5 w-2.5" /></Button>
                              </>
                            ) : null}
                          </div>
                        </div>
                        {String(editingNoteId) === String(savedNote.id) ? (
                          <div className="mt-2 space-y-1.5">
                            <textarea value={editingNoteContent} onChange={(e) => setEditingNoteContent(e.target.value)} rows={3} className="dream-field w-full resize-none rounded-[12px] border px-2.5 py-2 text-xs leading-5 outline-none" />
                            <div className="flex justify-end gap-1.5">
                              <Button type="button" onClick={() => void updateNote(savedNote.id)} variant="dream" size="iconSm" className="h-6 w-6" title="Enregistrer"><Check className="h-3 w-3" /></Button>
                              <Button type="button" onClick={() => { setEditingNoteId(null); setEditingNoteContent('') }} variant="dreamOutline" size="iconSm" className="h-6 w-6" title="Annuler"><X className="h-3 w-3" /></Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mindly-feature-text mt-1 whitespace-pre-wrap text-xs">{savedNote.content}</p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="mindly-feature-text text-sm">{t('notesSelectSession')}</p>
          )}
        </div>
      </div>

      {/* Backdrop */}
      <button
        type="button"
        className={`coach-notes-drawer-backdrop${isNotesDrawerOpen ? ' coach-notes-drawer-backdrop-visible' : ''}`}
        aria-label="Fermer les notes de suivi"
        onClick={() => setIsNotesDrawerOpen(false)}
        tabIndex={isNotesDrawerOpen ? 0 : -1}
      />

      {/* Modal suppression note */}
      {noteToDelete ? (
        <div className="dream-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="mindly-feature-card w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="mindly-feature-icon shrink-0">
                <Trash2 />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mindly-dashboard-eyebrow">{t('deleteNoteConfirm')}</p>
                <h3 className="mindly-feature-title mt-2">{t('deleteNoteTitle')}</h3>
                <p className="mindly-feature-text mt-2">{t('deleteNoteBody')}</p>
                <div className="student-dreams-latest-box mt-4">
                  <p className="mindly-feature-reference truncate">{noteToDelete.title}</p>
                  <p className="mindly-feature-text mt-1 line-clamp-3">{noteToDelete.content}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setNoteToDelete(null)}
                variant="dreamOutline"
                size="pill"
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => void deleteNote(noteToDelete.id)}
                disabled={isLoading}
                variant="destructive"
                size="pill"
              >
                {t('delete')}
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
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Conversion audio impossible.'))
    }
    reader.onerror = () => reject(new Error('Lecture audio impossible.'))
    reader.readAsDataURL(blob)
  })
}

function getStudentName(session: CoachingSession | null | undefined): string {
  const student = session?.student
  const fullName = `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim()
  return fullName || student?.email || 'Étudiant'
}

function getCoachName(coach: CoachNote['coach']): string {
  if (!coach || typeof coach !== 'object') return 'Coach'
  const fullName = `${(coach as { firstName?: string }).firstName ?? ''} ${(coach as { lastName?: string }).lastName ?? ''}`.trim()
  return fullName || (coach as { email?: string }).email || 'Coach'
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

function areSameMessages(current: CoachingMessage[], next: CoachingMessage[]): boolean {
  if (current.length !== next.length) return false
  return current.every((msg, i) => {
    const n = next[i]
    return String(msg.id) === String(n?.id) && msg.content === n?.content && msg.senderRole === n?.senderRole
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
