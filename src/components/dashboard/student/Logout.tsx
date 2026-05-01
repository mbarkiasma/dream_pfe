'use client'

import { LogOut } from 'lucide-react'

export function LogoutButton({ showLabel = false }: { showLabel?: boolean }) {
  const handleLogout = () => {
    window.location.assign('/logout')
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Deconnexion"
      className={`dream-logout-button ${showLabel ? 'dream-logout-button-labeled' : 'dream-logout-button-icon'}`}
    >
      <LogOut />
      {showLabel ? <span>Deconnexion</span> : null}
    </button>
  )
}
