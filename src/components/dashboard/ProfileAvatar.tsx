'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, UserRound } from 'lucide-react'

type ProfileAvatarProps = {
  initials: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'hero'
}

export function ProfileAvatar({ initials, avatarUrl, size = 'md' }: ProfileAvatarProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null)
  const [error, setError] = useState('')

  // Sync with server-side prop after router.refresh()
  useEffect(() => {
    setPreviewUrl(avatarUrl ?? null)
  }, [avatarUrl])

  const dim =
    size === 'hero'
      ? 'h-20 w-20 text-2xl rounded-full'
      : size === 'sm'
        ? 'h-12 w-12 text-base rounded-2xl'
        : 'h-16 w-16 text-xl rounded-2xl'

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Format non supporté.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop volumineuse (5 Mo max).')
      return
    }

    setError('')
    setIsUploading(true)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'upload.")
        setPreviewUrl(avatarUrl ?? null)
        return
      }

      setPreviewUrl(data.url)
      router.refresh()
    } catch {
      setError('Erreur réseau.')
      setPreviewUrl(avatarUrl ?? null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative shrink-0 group">
      <div
        className={`${dim} flex items-center justify-center font-black text-white overflow-hidden bg-[var(--mindly-primary)] shadow ring-4 ring-violet-100/70 dark:ring-white/10 cursor-pointer select-none`}
        onClick={() => !isUploading && inputRef.current?.click()}
        title="Changer la photo"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : initials ? (
          initials
        ) : (
          <UserRound className="h-5 w-5" />
        )}

        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Camera className="h-4 w-4 text-white" />
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />

      {error ? (
        <p className="absolute left-0 top-full mt-1 w-48 text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  )
}
