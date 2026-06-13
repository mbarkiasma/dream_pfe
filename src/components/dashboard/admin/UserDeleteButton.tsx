'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type UserDeleteButtonProps = {
  userId: string
  userName: string
}

export function UserDeleteButton({ userId, userName }: UserDeleteButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Une erreur est survenue.')
        setLoading(false)
        setConfirming(false)
        return
      }

      router.refresh()
    } catch {
      setError('Impossible de contacter le serveur.')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <p className="text-xs text-dream-muted dark:text-white/60">
          Supprimer <strong>{userName}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? 'Suppression...' : 'Confirmer'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => { setConfirming(false); setError(null) }}
            className="rounded-md border border-[var(--mindly-border-violet)] px-3 py-1 text-xs font-semibold transition hover:bg-[var(--mindly-surface)]"
          >
            Annuler
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title={`Supprimer ${userName}`}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-500 transition hover:bg-red-50 hover:border-red-400 dark:border-red-900/40 dark:hover:bg-red-950/30"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
