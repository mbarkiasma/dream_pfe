"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Moon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Props = {
  title: string
  subtitle: string
  emailPlaceholder?: string
  buttonLabel: string
  signupText?: string
  signupLabel?: string
  signupUrl?: string
}

export const LoginBlockComponent = (props: Props) => {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setErrorMessage("")
    setSuccessMessage("")

    const cleanEmail = email.trim().toLowerCase()
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()

    if (!cleanEmail || !cleanFirstName || !cleanLastName) {
      setErrorMessage("Veuillez remplir tous les champs.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/users/magic-link-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: cleanFirstName,
          lastName: cleanLastName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data?.message || "Erreur lors de l'envoi du lien.")
        return
      }

      setSuccessMessage("📩 Vérifiez votre email pour vous connecter.")
      setEmail("")
      setFirstName("")
      setLastName("")
    } catch (error) {
      console.error("Magic link error:", error)
      setErrorMessage("Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[linear-gradient(135deg,#b9b1eb_0%,#c8d8f6_55%,#e6bfd8_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center">
        <Card className="w-full max-w-[360px] rounded-[28px] border border-white/40 bg-white/70 shadow-[0_20px_40px_rgba(90,70,140,0.15)] backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                <Moon className="h-7 w-7 text-violet-600" />
              </div>
            </div>

            <h1 className="text-center text-3xl font-bold text-[#4f4963]">
              {props.title}
            </h1>

            <p className="mt-2 text-center text-sm text-[#8f89a7]">
              {props.subtitle}
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                className="h-12 rounded-2xl"
                required
                disabled={loading}
              />

              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
                className="h-12 rounded-2xl"
                required
                disabled={loading}
              />

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a29bb7]" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={props.emailPlaceholder || "user@example.com"}
                  className="h-12 rounded-2xl pl-10"
                  required
                  disabled={loading}
                />
              </div>

              {errorMessage ? (
                <p className="text-sm text-red-500">{errorMessage}</p>
              ) : null}

              {successMessage ? (
                <p className="text-sm text-green-600">{successMessage}</p>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white"
              >
                {loading ? "Envoi..." : props.buttonLabel}
              </Button>
            </form>

            {(props.signupText || props.signupLabel) && (
              <p className="mt-6 text-center text-sm text-[#948da8]">
                {props.signupText}{" "}
                <Link
                  href={props.signupUrl || "/sign-up"}
                  className="font-semibold text-violet-500 hover:underline"
                >
                  {props.signupLabel}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}