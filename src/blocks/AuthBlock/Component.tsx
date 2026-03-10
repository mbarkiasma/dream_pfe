import Link from 'next/link'
import { Moon, Mail, Lock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  subtitle: string
  firstNamePlaceholder?: string
  lastNamePlaceholder?: string
  emailPlaceholder?: string
  passwordPlaceholder?: string
  buttonLabel: string
  bottomText?: string
  bottomLinkLabel?: string
  bottomLinkUrl?: string
}

export function AuthBlockComponent(props: Props) {
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

            <h1 className="text-center text-3xl font-bold tracking-tight text-[#4f4963]">
              {props.title}
            </h1>

            <p className="mt-2 text-center text-sm text-[#8f89a7]">
              {props.subtitle}
            </p>

            <form className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder={props.firstNamePlaceholder || 'First name'}
                  className="h-12 rounded-2xl border-[#e8e1f1] bg-white/60 text-[#5c5672] placeholder:text-[#a29bb7]"
                />
                <Input
                  type="text"
                  placeholder={props.lastNamePlaceholder || 'Last name'}
                  className="h-12 rounded-2xl border-[#e8e1f1] bg-white/60 text-[#5c5672] placeholder:text-[#a29bb7]"
                />
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a29bb7]" />
                <Input
                  type="email"
                  placeholder={props.emailPlaceholder || 'user@example.com'}
                  className="h-12 rounded-2xl border-[#e8e1f1] bg-white/60 pl-10 text-[#5c5672] placeholder:text-[#a29bb7]"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a29bb7]" />
                <Input
                  type="password"
                  placeholder={props.passwordPlaceholder || 'Choose a secure password'}
                  className="h-12 rounded-2xl border-[#e8e1f1] bg-white/60 pl-10 text-[#5c5672] placeholder:text-[#a29bb7]"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-base font-semibold text-white shadow-[0_10px_20px_rgba(122,63,242,0.25)] hover:from-violet-600 hover:to-violet-500"
              >
                {props.buttonLabel}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#948da8]">
              {props.bottomText}{' '}
              <Link
                href={props.bottomLinkUrl || '/sign-in'}
                className="font-semibold text-violet-500 hover:underline"
              >
                {props.bottomLinkLabel}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}