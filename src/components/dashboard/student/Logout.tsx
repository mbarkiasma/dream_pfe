'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Déconnexion"
      className="rounded-2xl bg-white/20 p-3 text-white transition hover:bg-white/30"
    >
      <LogOut className="h-5 w-5" />
    </button>
  )
}