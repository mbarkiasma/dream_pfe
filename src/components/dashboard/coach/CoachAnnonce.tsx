'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Eye, Heart, Megaphone, Pencil, Send, Trash2, UsersRound, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

  return (
    <div className="space-y-6">
      <form
        onSubmit={submitAnnouncement}
        className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-violet-100 p-3 text-violet-600">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#2d1068]">
              {editingAnnouncement ? 'Modifier annonce' : 'Nouvelle annonce'}
            </h2>
            <p className="text-sm text-[#7A6A99]">
              {editingAnnouncement
                ? 'Ajustez le titre ou le contenu deja publie.'
                : 'Publiez un message de motivation visible par les etudiants.'}
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titre de l'annonce"
            className="h-12 rounded-2xl border-violet-100 bg-white/90 text-[#2d1068]"
          />
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Ecrivez votre message de motivation..."
            className="min-h-32 rounded-2xl border-violet-100 bg-white/90 text-[#2d1068]"
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}
        {statusMessage ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={pending}
            className="h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-400 px-5 text-white"
          >
            {editingAnnouncement ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {pending ? 'Enregistrement...' : editingAnnouncement ? 'Enregistrer' : 'Publier'}
          </Button>

          {editingAnnouncement ? (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={pending}
              className="h-12 rounded-2xl border-violet-100 bg-white px-5 text-[#4B3F72]"
            >
              <X className="h-4 w-4" />
              Annuler
            </Button>
          ) : null}
        </div>
      </form>

      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_14px_45px_rgba(109,40,217,0.10)] backdrop-blur">
        <div className="flex flex-col gap-2 border-b border-violet-100/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2d1068]">Mes annonces</h2>
            <p className="text-sm text-[#7A6A99]">Suivi des publications, statuts et reactions.</p>
          </div>
          <span className="w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            {initialAnnouncements.length} annonce{initialAnnouncements.length > 1 ? 's' : ''}
          </span>
        </div>

        {initialAnnouncements.length === 0 ? (
          <p className="p-6 text-sm text-[#7A6A99]">Aucune annonce publiee pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-violet-100 bg-[#FBF8FF] text-xs font-bold uppercase tracking-[0.12em] text-[#7A6A99]">
                  <th className="px-5 py-4">Annonce</th>
                  <th className="px-4 py-4">Statut</th>
                  <th className="px-4 py-4">J'aime</th>
                  <th className="px-4 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100/70">
                {initialAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="bg-white/60 transition hover:bg-[#FAF7FF]">
                    <td className="max-w-[360px] px-5 py-4">
                      <p className="truncate text-sm font-bold text-[#2d1068]">
                        {announcement.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#6E628F]">
                        {announcement.content}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                          announcement.status === 'published'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            announcement.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {announcement.status === 'published' ? 'Publiee' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLikesAnnouncement(announcement)}
                        className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-bold text-[#6D28D9] shadow-sm transition hover:bg-[#F8F3FF]"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{announcement.reactions?.likeCount ?? 0}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-[#7A6A99]">
                      {formatDate(announcement.publishedAt || announcement.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAnnouncement(announcement)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#6D28D9] shadow-sm transition hover:bg-[#F3ECFF]"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditing(announcement)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition hover:bg-violet-100"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnnouncementToDelete(announcement)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-500 hover:text-white"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedLikesAnnouncement ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1068]/35 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedLikesAnnouncement(null)}
        >
          <div
            className="relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] shadow-[0_34px_110px_rgba(45,16,104,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/70 px-6 py-5 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B6BFF]">
                    Reactions
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-bold tracking-[-0.03em] text-[#2d1068]">
                    {selectedLikesAnnouncement.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#7A6A99]">
                    {selectedLikesAnnouncement.reactions?.likeCount ?? 0} J'aime
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLikesAnnouncement(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#6D28D9] shadow-[0_10px_24px_rgba(109,40,217,0.12)] transition hover:bg-white hover:text-rose-600"
                  aria-label="Fermer les reactions"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5 md:px-7">
              {selectedLikesAnnouncement.reactions?.students.length ? (
                <div className="space-y-3">
                  {selectedLikesAnnouncement.reactions.students.map((reaction) => (
                    <div
                      key={reaction.id}
                      className="flex items-center justify-between gap-4 rounded-[22px] border border-white/80 bg-white/75 p-4 shadow-[0_10px_30px_rgba(109,40,217,0.08)]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                          <UsersRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#2d1068]">
                            {getStudentName(reaction.student)}
                          </p>
                          {reaction.student?.email ? (
                            <p className="truncate text-xs text-[#7A6A99]">
                              {reaction.student.email}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        {formatDate(reaction.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[26px] border border-dashed border-violet-200 bg-white/70 p-6 text-center text-sm text-[#7A6A99]">
                  Aucun etudiant n'a encore aime cette motivation.
                </div>
              )}
            </div>

            <div className="border-t border-white/70 bg-white/45 px-6 py-4 md:px-7">
              <button
                type="button"
                onClick={() => setSelectedLikesAnnouncement(null)}
                className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(109,40,217,0.22)] transition hover:brightness-105 sm:w-auto"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedAnnouncement ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1068]/35 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="relative flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#FDF7FF_52%,#F3ECFF_100%)] shadow-[0_34px_110px_rgba(45,16,104,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/70 px-6 py-5 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9B6BFF]">
                    Annonce de motivation
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-bold tracking-[-0.03em] text-[#2d1068]">
                    {selectedAnnouncement.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#7A6A99]">
                    {selectedAnnouncement.status === 'published' ? 'Publiee' : 'Brouillon'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#6D28D9] shadow-[0_10px_24px_rgba(109,40,217,0.12)] transition hover:bg-white hover:text-rose-600"
                  aria-label="Fermer l'annonce"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5 md:px-7">
              <div className="rounded-[26px] border border-white/80 bg-white/75 p-5 shadow-[0_14px_45px_rgba(109,40,217,0.10)]">
                <p className="whitespace-pre-line text-sm leading-8 text-[#4B3F72] md:text-base">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>

            <div className="border-t border-white/70 bg-white/45 px-6 py-4 md:px-7">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(109,40,217,0.22)] transition hover:brightness-105 sm:w-auto"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {announcementToDelete ? (
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
                <h3 className="mt-2 text-xl font-bold text-[#2d1068]">Supprimer cette annonce ?</h3>
                <p className="mt-3 text-sm leading-6 text-[#6E628F]">
                  Elle ne sera plus visible par les etudiants. Cette action ne pourra pas etre
                  annulee.
                </p>
                <div className="mt-4 rounded-[20px] border border-white/80 bg-white/75 p-4">
                  <p className="truncate text-sm font-semibold text-[#2d1068]">
                    {announcementToDelete.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#7A6A99]">
                    {announcementToDelete.content}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                className="rounded-2xl border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-[#4B3F72] transition hover:bg-[#F8F3FF]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteAnnouncement(announcementToDelete)}
                disabled={pending}
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
