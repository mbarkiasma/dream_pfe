'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Eye, Heart, Megaphone, Pencil, Send, Trash2, UsersRound, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Announcement = {
  id: string | number
  title: string
  content: string
  status: 'draft' | 'published'
  publishedAt?: string
  createdAt?: string
  reactions?: {
    likeCount: number
    students: Array<{
      createdAt?: string
      id: string | number
      student?: {
        email?: string | null
        firstName?: string | null
        id?: string | number
        lastName?: string | null
      } | null
    }>
  }
}

type ReactionStudent = NonNullable<Announcement['reactions']>['students'][number]['student']

type Props = {
  initialAnnouncements: Announcement[]
}

export function CoachAnnouncementsClient({ initialAnnouncements }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [selectedLikesAnnouncement, setSelectedLikesAnnouncement] = useState<Announcement | null>(
    null,
  )
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)
  const [pending, startTransition] = useTransition()

  function resetForm() {
    setEditingAnnouncement(null)
    setTitle('')
    setContent('')
  }

  function submitAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage('')
    setError('')

    const cleanTitle = title.trim()
    const cleanContent = content.trim()

    if (!cleanTitle || !cleanContent) {
      setError('Titre et contenu requis.')
      return
    }

    startTransition(async () => {
      const isEditing = Boolean(editingAnnouncement)

      try {
        const response = await fetch('/api/annonce-motivation', {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAnnouncement?.id,
            title: cleanTitle,
            content: cleanContent,
            status: 'published',
          }),
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Impossible d'enregistrer l'annonce.")
          return
        }

        resetForm()
        setStatusMessage(
          isEditing ? 'Annonce modifiee avec succes.' : 'Annonce publiee avec succes.',
        )
        router.refresh()
      } catch {
        setError("Impossible d'enregistrer l'annonce.")
      }
    })
  }

  function startEditing(announcement: Announcement) {
    setEditingAnnouncement(announcement)
    setTitle(announcement.title)
    setContent(announcement.content)
    setStatusMessage('')
    setError('')
  }

  function deleteAnnouncement(announcement: Announcement) {
    setStatusMessage('')
    setError('')

    startTransition(async () => {
      try {
        const response = await fetch(`/api/annonce-motivation?id=${announcement.id}`, {
          method: 'DELETE',
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Impossible de supprimer l'annonce.")
          return
        }

        if (editingAnnouncement?.id === announcement.id) resetForm()

        setAnnouncementToDelete(null)
        setStatusMessage('Annonce supprimee avec succes.')
        router.refresh()
      } catch {
        setError("Impossible de supprimer l'annonce.")
      }
    })
  }

  function formatDate(value?: string) {
    if (!value) return 'Non precisee'

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
    }).format(new Date(value))
  }

  function getStudentName(student: ReactionStudent) {
    if (!student) return 'Etudiant'
    const fullName = `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()
    return fullName || student.email || 'Etudiant'
  }

  function getAnnouncementStatusClass(status: Announcement['status']) {
    return status === 'published' ? 'dream-status-ready' : 'dream-status-pending'
  }

  return (
    <div className="space-y-6">
      <Card className="dream-card-glass rounded-[28px] border">
        <CardContent className="p-5">
          <form onSubmit={submitAnnouncement}>
            <div className="dream-flex-form-header">
              <div className="dream-icon-soft rounded-2xl p-3">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="dream-text-section-title">
                  {editingAnnouncement ? 'Modifier annonce' : 'Nouvelle annonce'}
                </h2>
                <p className="dream-text-form-description">
                  {editingAnnouncement
                    ? 'Ajustez le titre ou le contenu deja publie.'
                    : 'Publiez un message de motivation visible par les etudiants.'}
                </p>
              </div>
            </div>

            <div className="dream-grid-form">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Titre de l'annonce"
                className="dream-input-field"
              />
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Ecrivez votre message de motivation..."
                className="dream-textarea-field"
              />
            </div>

            {error ? (
              <p className="dream-text-status dream-status-failed">
                {error}
              </p>
            ) : null}
            {statusMessage ? (
              <p className="dream-text-status dream-status-ready">
                {statusMessage}
              </p>
            ) : null}

            <div className="dream-flex-button-group">
              <Button
                type="submit"
                disabled={pending}
                variant="dream"
                size="pillLg"
                className="dream-button-primary"
              >
                {editingAnnouncement ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {pending ? 'Enregistrement...' : editingAnnouncement ? 'Enregistrer' : 'Publier'}
              </Button>

              {editingAnnouncement ? (
                <Button
                  type="button"
                  onClick={resetForm}
                  disabled={pending}
                  variant="dreamOutline"
                  size="pillLg"
                  className="dream-button-primary"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="dream-card-glass overflow-hidden rounded-[28px] border">
        <CardContent className="p-0">
          <div className="dream-flex-table-header">
            <div>
              <h2 className="dream-text-section-title">Mes annonces</h2>
              <p className="dream-text-form-description">
                Suivi des publications, statuts et reactions.
              </p>
            </div>
            <span className="dream-badge-count">
              {initialAnnouncements.length} annonce{initialAnnouncements.length > 1 ? 's' : ''}
            </span>
          </div>

          {initialAnnouncements.length === 0 ? (
            <p className="p-6 dream-text-form-description">Aucune annonce publiee pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="dream-surface-muted border-b border-border text-xs font-bold uppercase tracking-[0.12em] text-dream-muted">
                    <th className="px-5 py-4">Annonce</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-4 py-4">J'aime</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {initialAnnouncements.map((announcement) => (
                    <tr key={announcement.id} className="dream-surface">
                      <td className="max-w-[360px] px-5 py-4">
                        <p className="dream-text-table-title">
                          {announcement.title}
                        </p>
                        <p className="dream-text-table-content">
                          {announcement.content}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${getAnnouncementStatusClass(
                            announcement.status,
                          )}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {announcement.status === 'published' ? 'Publiee' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          type="button"
                          onClick={() => setSelectedLikesAnnouncement(announcement)}
                          variant="dreamSoft"
                          size="pill"
                          className="font-bold shadow-sm"
                        >
                          <Heart className="h-4 w-4" />
                          <span>{announcement.reactions?.likeCount ?? 0}</span>
                        </Button>
                      </td>
                      <td className="px-4 py-4 dream-text-table-date">
                        {formatDate(announcement.publishedAt || announcement.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="dream-flex-actions">
                          <Button
                            type="button"
                            onClick={() => setSelectedAnnouncement(announcement)}
                            variant="dreamOutline"
                            size="iconSm"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => startEditing(announcement)}
                            variant="dreamSoft"
                            size="iconSm"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setAnnouncementToDelete(announcement)}
                            variant="destructive"
                            size="iconSm"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLikesAnnouncement ? (
        <div
          className="dream-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedLikesAnnouncement(null)}
        >
          <Card className="dream-modal-card">
            <CardContent className="p-0">
              <div className="dream-modal-header">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="dream-text-section-header">
                      Reactions
                    </p>
                    <h3 className="dream-text-modal-title">
                      {selectedLikesAnnouncement.title}
                    </h3>
                    <p className="dream-text-modal-subtitle">
                      {selectedLikesAnnouncement.reactions?.likeCount ?? 0} J'aime
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSelectedLikesAnnouncement(null)}
                    variant="dreamOutline"
                    size="iconLg"
                    className="shrink-0 shadow-dream-card"
                    aria-label="Fermer les reactions"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="dream-modal-content">
                {selectedLikesAnnouncement.reactions?.students.length ? (
                  <div className="space-y-3">
                    {selectedLikesAnnouncement.reactions.students.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="dream-surface flex items-center justify-between gap-4 rounded-[22px] border p-4 shadow-dream-card"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="dream-icon-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                            <UsersRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="dream-text-reaction-name">
                              {getStudentName(reaction.student)}
                            </p>
                            {reaction.student?.email ? (
                              <p className="dream-text-reaction-email">
                                {reaction.student.email}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <span className="dream-badge shrink-0 rounded-full border px-3 py-1 text-xs font-semibold">
                          {formatDate(reaction.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dream-card-dashed rounded-[26px] border p-6 text-center dream-text-form-description">
                    Aucun etudiant n'a encore aime cette motivation.
                  </div>
                )}
              </div>

              <div className="dream-modal-footer">
                <Button
                  type="button"
                  onClick={() => setSelectedLikesAnnouncement(null)}
                  variant="dream"
                  size="pill"
                  className="w-full sm:w-auto"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {selectedAnnouncement ? (
        <div
          className="dream-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <Card className="dream-modal-card">
            <CardContent className="p-0">
              <div className="dream-modal-header">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="dream-text-section-header">
                      Annonce de motivation
                    </p>
                    <h3 className="dream-text-modal-title">
                      {selectedAnnouncement.title}
                    </h3>
                    <p className="dream-text-modal-subtitle">
                      {selectedAnnouncement.status === 'published' ? 'Publiee' : 'Brouillon'}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSelectedAnnouncement(null)}
                    variant="dreamOutline"
                    size="iconLg"
                    className="shrink-0 shadow-dream-card"
                    aria-label="Fermer l'annonce"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="dream-modal-content">
                <div className="dream-surface rounded-[26px] border p-5 shadow-dream-card">
                  <p className="whitespace-pre-line dream-text-body-lg dream-text-heading">
                    {selectedAnnouncement.content}
                  </p>
                </div>
              </div>

              <div className="dream-modal-footer">
                <Button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  variant="dream"
                  size="pill"
                  className="w-full sm:w-auto"
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {announcementToDelete ? (
        <div className="dream-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md rounded-[30px] border dream-panel-bg shadow-dream-card-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="dream-status-failed rounded-2xl border p-3">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="dream-text-confirmation-header">
                    Confirmation
                  </p>
                  <h3 className="dream-text-confirmation-title">
                    Supprimer cette annonce ?
                  </h3>
                  <p className="dream-spacing-top-sm dream-text-body-muted">
                    Elle ne sera plus visible par les etudiants. Cette action ne pourra pas etre
                    annulee.
                  </p>
                  <div className="dream-surface dream-spacing-top-md rounded-[20px] border p-4">
                    <p className="dream-text-form-title">
                      {announcementToDelete.title}
                    </p>
                    <p className="dream-text-confirmation-content">
                      {announcementToDelete.content}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dream-flex-end">
                <Button
                  type="button"
                  onClick={() => setAnnouncementToDelete(null)}
                  variant="dreamOutline"
                  size="pill"
                  className="rounded-2xl"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => deleteAnnouncement(announcementToDelete)}
                  disabled={pending}
                  variant="destructive"
                  size="pill"
                  className="rounded-2xl"
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
