'use client'

import { useClerk } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'

export function LogoutButton({ showLabel = false }: { showLabel?: boolean }) {
  const { signOut } = useClerk()

  const handleLogout = async () => {
    try {
      await signOut({ redirectUrl: '/login' })
    } catch (error) {
      console.error('Erreur lors de la deconnexion :', error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Deconnexion"
      className={`rounded-2xl border border-white/70 bg-white/70 text-[#6D28D9] shadow-[0_8px_24px_rgba(109,40,217,0.08)] transition hover:-translate-y-0.5 hover:bg-white hover:text-rose-600 hover:shadow-[0_14px_32px_rgba(109,40,217,0.18)] ${
        showLabel ? 'flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold' : 'p-3'
      }`}
    >
      <LogOut className="h-5 w-5" />
      {showLabel ? <span>Deconnexion</span> : null}
    </button>
  )
}
