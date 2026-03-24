"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, Moon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Props = {
  title: string
  subtitle: string
  emailPlaceholder?: string
  passwordPlaceholder?: string
  buttonLabel: string
  signupText?: string
  signupLabel?: string
  signupUrl?: string
}

export const LoginBlockComponent = (props: Props) => {

  // états du formulaire
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // fonction login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      console.log("Login success", data)
      window.location.href = "/dashboard/student"
    } else {
      alert("Email ou mot de passe incorrect")
    }
  }

  return (
    <section className="min-h-screen bg-[linear-gradient(135deg,#b9b1eb_0%,#c8d8f6_55%,#e6bfd8_100%)] px-4 py-10">
      
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center">

        <Card className="w-full max-w-[360px] rounded-[28px] border border-white/40 bg-white/70 shadow-[0_20px_40px_rgba(90,70,140,0.15)] backdrop-blur-xl">

          <CardContent className="p-6 sm:p-8">

            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                <Moon className="h-7 w-7 text-violet-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-center text-3xl font-bold tracking-tight text-[#4f4963]">
              {props.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-center text-sm text-[#8f89a7]">
              {props.subtitle}
            </p>

            {/* Form */}
            <form onSubmit={handleLogin} className="mt-6 space-y-4">

              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a29bb7]" />

                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={props.emailPlaceholder || "user@example.com"}
                  className="h-12 rounded-2xl border-[#e8e1f1] bg-white/60 pl-10 text-[#5c5672] placeholder:text-[#a29bb7]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a29bb7]" />

                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder={props.passwordPlaceholder || "Enter your password"}
                  className="h-12 rounded-2xl border-[#e8e1f1] bg-white/60 pl-10 text-[#5c5672] placeholder:text-[#a29bb7]"
                />
              </div>

              {/* Button */}
              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-base font-semibold text-white shadow-[0_10px_20px_rgba(122,63,242,0.25)] hover:from-violet-600 hover:to-violet-500"
              >
                {props.buttonLabel}
              </Button>

            </form>

            {/* Bottom link */}
            <p className="mt-6 text-center text-sm text-[#948da8]">
              {props.signupText}{" "}
              <Link
                href={props.signupUrl || "/sign-up"}
                className="font-semibold text-violet-500 hover:underline"
              >
                {props.signupLabel}
              </Link>
            </p>

          </CardContent>

        </Card>

      </div>

    </section>
  )
}