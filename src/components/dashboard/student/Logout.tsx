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
      className={`mindly-logout-button ${
        showLabel ? 'mindly-logout-button-labeled' : 'mindly-logout-button-icon'
      }`}
    >
      <LogOut />
      {showLabel ? <span>Deconnexion</span> : null}
    </button>
  )
}