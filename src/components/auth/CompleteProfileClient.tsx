'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AlertCircle, ArrowRight, Loader2, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CompleteProfileClientProps = {
  defaultFirstName?: string
  defaultLastName?: string
  defaultStudentBranch?: string
  defaultStudentLevel?: string
}

const branchLevels = {
  LI: ['LI1', 'LI2', 'LI3'],
  LEA: ['LEA1', 'LEE2', 'LEE3'],
  LPE: ['LPE1', 'LPE2', 'LPE3'],
  PC: ['PC1', 'PC2'],
  MP: ['MP1', 'MP2'],
  LM: ['LMI1', 'LMI2', 'LMI3'],
  LSE: ['LSE1', 'LSE2', 'LSE3'],
  master: ['MR1PHY', 'MP1IASER', 'MP1BIO', 'MR1MATH'],
} as const

type StudentBranch = keyof typeof branchLevels
const branchOptions = Object.keys(branchLevels) as StudentBranch[]

function getBranchForLevel(level: string): StudentBranch | '' {
  return (
    branchOptions.find((branch) => (branchLevels[branch] as readonly string[]).includes(level)) ??
    ''
  )
}

export function CompleteProfileClient({
  defaultFirstName = '',
  defaultLastName = '',
  defaultStudentBranch = '',
  defaultStudentLevel = '',
}: CompleteProfileClientProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(defaultFirstName)
  const [lastName, setLastName] = useState(defaultLastName)
  const [studentBranch, setStudentBranch] = useState(defaultStudentBranch)
  const [studentLevel, setStudentLevel] = useState(defaultStudentLevel)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()
    const cleanStudentBranch = studentBranch.trim()
    const cleanStudentLevel = studentLevel.trim()

    setErrorMessage('')

    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage('Veuillez renseigner votre prenom et votre nom.')
      return
    }

    if (!cleanStudentBranch || !cleanStudentLevel) {
      setErrorMessage('Veuillez selectionner votre branche et votre niveau.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: cleanFirstName,
          lastName: cleanLastName,
          studentBranch: cleanStudentBranch,
          studentLevel: cleanStudentLevel,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Profil impossible a mettre a jour.')
      }

      router.replace('/entretien')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="complete-profile-page">
      <div className="login-theme-switch">
        <span className="login-theme-label">Theme</span>
        <ThemeToggle className="login-theme-toggle" />
      </div>

      <div className="complete-profile-shell">
        <section className="complete-profile-card">
          <div className="complete-profile-header">
            <div className="complete-profile-icon">
              <UserRound />
            </div>

            <p className="complete-profile-eyebrow">Profil etudiant</p>

            <h1 className="complete-profile-title">Completez votre profil</h1>

            <p className="complete-profile-description">
              Ces informations seront utilisees dans votre dashboard, vos rapports et votre suivi.
            </p>
          </div>

          <form className="complete-profile-form" onSubmit={handleSubmit}>
            <div className="complete-profile-grid">
              <div className="complete-profile-field">
                <label className="complete-profile-label" htmlFor="firstName">
                  Prenom
                </label>

                <input
                  className="complete-profile-input"
                  disabled={isSubmitting}
                  id="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Votre prenom"
                  type="text"
                  value={firstName}
                />
              </div>

              <div className="complete-profile-field">
                <label className="complete-profile-label" htmlFor="lastName">
                  Nom
                </label>

                <input
                  className="complete-profile-input"
                  disabled={isSubmitting}
                  id="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Votre nom"
                  type="text"
                  value={lastName}
                />
              </div>

              <div className="complete-profile-field complete-profile-field-wide">
                <label className="complete-profile-label" htmlFor="studentLevel">
                  Branche et niveau
                </label>

                <select
                  className="complete-profile-input complete-profile-select"
                  disabled={isSubmitting}
                  id="studentLevel"
                  onChange={(event) => {
                    const nextLevel = event.target.value

                    setStudentLevel(nextLevel)
                    setStudentBranch(getBranchForLevel(nextLevel))
                  }}
                  value={studentLevel}
                >
                  <option value="">Choisir votre branche et votre niveau</option>
                  {branchOptions.map((branch) => (
                    <optgroup key={branch} label={branch === 'master' ? 'Master' : branch}>
                      {branchLevels[branch].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage ? (
              <div className="complete-profile-error">
                <AlertCircle />
                {errorMessage}
              </div>
            ) : null}

            <Button
              variant="dream"
              size="lg"
              disabled={isSubmitting}
              type="submit"
              className="complete-profile-submit"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              Continuer vers mon dashboard
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
