"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Mail, Moon } from "lucide-react"

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

const mailboxProviders: Record<string, string> = {
  "gmail.com": "https://mail.google.com",
  "googlemail.com": "https://mail.google.com",
  "outlook.com": "https://outlook.live.com/mail",
  "hotmail.com": "https://outlook.live.com/mail",
  "live.com": "https://outlook.live.com/mail",
  "msn.com": "https://outlook.live.com/mail",
  "yahoo.com": "https://mail.yahoo.com",
  "icloud.com": "https://www.icloud.com/mail",
  "me.com": "https://www.icloud.com/mail",
  "aol.com": "https://mail.aol.com",
  "proton.me": "https://mail.proton.me",
  "protonmail.com": "https://mail.proton.me",
}

function getMailboxUrl(email: string) {
  const domain = email.split("@")[1]?.toLowerCase()

  if (!domain) {
    return null
  }

  return mailboxProviders[domain] ?? null
}

export const LoginBlockComponent = (props: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  useEffect(() => {
    const shouldShowModal = searchParams.get("message") === "check-email"
    const emailFromQuery = searchParams.get("email") ?? ""

    setShowSuccessModal(shouldShowModal)
    setSubmittedEmail(emailFromQuery)
  }, [searchParams])

  function closeSuccessModal() {
    setShowSuccessModal(false)
    router.replace("/login", { scroll: false })
  }

  function openMailbox() {
    const mailboxUrl = getMailboxUrl(submittedEmail)

    if (mailboxUrl) {
      window.open(mailboxUrl, "_blank", "noopener,noreferrer")
      return
    }

    window.location.href = `mailto:${submittedEmail}`
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setErrorMessage("")
    setShowSuccessModal(false)

    const cleanEmail = email.trim().toLowerCase()
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()

    if (!cleanEmail || !cleanFirstName || !cleanLastName) {
      setErrorMessage("Veuillez remplir tous les champs.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/users/magic-link-request", {
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

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null

      if (!response.ok) {
        setErrorMessage(data?.message || "Erreur lors de l'envoi du lien.")
        return
      }

      setSubmittedEmail(cleanEmail)
      setShowSuccessModal(true)
      router.replace(`/login?message=check-email&email=${encodeURIComponent(cleanEmail)}`, {
        scroll: false,
      })
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
    <>
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
                  placeholder={"Pr\u00e9nom"}
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
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                  </p>
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

      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26163c]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,243,255,0.98)_100%)] shadow-[0_30px_120px_rgba(59,28,89,0.28)]">
            <div className="relative px-6 pb-7 pt-8 sm:px-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#d8cbff_0%,#efe9ff_60%,#ffffff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(116,74,177,0.18)]">
                <CheckCircle2 className="h-10 w-10 text-violet-600" />
              </div>

              <h2 className="mt-6 text-center text-2xl font-bold text-[#403655]">
                {"V\u00e9rifiez votre email"}
              </h2>

              <p className="mt-3 text-center text-sm leading-6 text-[#6f6784]">
                {"Nous avons envoy\u00e9 votre lien de connexion s\u00e9curis\u00e9."}
              </p>

              <p className="mt-2 rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-medium text-[#554a6d] shadow-[inset_0_0_0_1px_rgba(143,124,181,0.12)]">
                {submittedEmail || "Votre adresse email"}
              </p>

              <p className="mt-4 text-center text-sm leading-6 text-[#7b7391]">
                Cliquez sur <span className="font-semibold text-[#4f4963]">OK</span>, puis ouvrez
                votre messagerie pour vous connecter.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={closeSuccessModal}
                  className="h-12 rounded-2xl bg-white text-[#4f4963] shadow-[inset_0_0_0_1px_rgba(98,78,140,0.16)] hover:bg-[#f7f3ff]"
                >
                  OK
                </Button>

                <Button
                  type="button"
                  onClick={openMailbox}
                  className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
                >
                  Ouvrir mon mail
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
