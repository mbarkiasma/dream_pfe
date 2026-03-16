import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { Facebook, Send, Twitter } from 'lucide-react'

import type { Footer as FooterType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: FooterType = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto bg-[#4B2E83] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_160px]">
        <div>
          <div className="mb-5">
            <Link className="flex items-center" href="/">
              <Logo />
            </Link>
          </div>

          <h3 className="mb-4 text-xl font-semibold">Quick links</h3>
          <nav className="space-y-3">
            {navItems.map(({ link }, i) => {
              return (
                <div key={i} className="text-white/80 hover:text-white">
                  <CMSLink {...link} />
                </div>
              )
            })}
          </nav>
        </div>

        <div className="md:border-l md:border-white/15 md:pl-6">
          <h3 className="mb-4 text-xl font-semibold">Privacy</h3>
          <div className="space-y-3 text-white/80">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>

        <div className="md:border-l md:border-white/15 md:pl-6">
          <h3 className="mb-4 text-xl font-semibold">Terms</h3>
          <div className="space-y-3 text-white/80">
            <Link href="#">Terms</Link>
          </div>
        </div>

        <div className="md:border-l md:border-white/15 md:pl-6">
          <h3 className="mb-4 text-xl font-semibold">Company</h3>
          <div className="space-y-3 text-white/80">
            <Link href="#">About us</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>

        <div className="md:border-l md:border-white/15 md:pl-6">
          <h3 className="mb-4 text-xl font-semibold">Contact</h3>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <Facebook className="h-5 w-5" />
            </Link>

            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <Twitter className="h-5 w-5" />
            </Link>

            <Link
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <Send className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="flex items-start justify-start md:justify-end">
          <div className="rounded-md bg-white p-2">
            <div className="grid h-[100px] w-[100px] grid-cols-5 gap-[3px]">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`${
                    [0, 1, 3, 5, 7, 9, 10, 12, 14, 15, 18, 20, 21, 23, 24].includes(i)
                      ? 'bg-[#4B2E83]'
                      : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}