'use client'

import { ThemeToggle } from '@/components/ThemeToggle'

export function EntretienHeader() {
  return (
    <header className="interview-simple-header">
      <div>
        <p className="interview-kicker">Entretien initial</p>
        <h1 className="interview-simple-title">Votre entretien</h1>
      </div>

      <div className="interview-simple-actions">
        <ThemeToggle />
      </div>
    </header>
  )
}
