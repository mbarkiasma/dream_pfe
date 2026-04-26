'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Bell,
  FileSearch,
  LayoutDashboard,
  LifeBuoy,
  MicVocal,
  MoonStar,
  NotebookPen,
  UserRound,
  Megaphone,
} from 'lucide-react'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { title: 'Mes reves', href: '/dashboard/student/dreams', icon: MoonStar },
  { title: 'Mes analyses', href: '/dashboard/student/analyses', icon: FileSearch },
  { title: 'Smart coaching', href: '/dashboard/student/coaching', icon: LifeBuoy },
  { title: 'Annonces de motivation', href: '/dashboard/student/motivation', icon: Megaphone },
  { title: 'Rendez-vous', href: '/dashboard/student/rendez_vous', icon: CalendarDays },
  { title: 'Notifications', href: '/dashboard/student/notifications', icon: Bell },
  { title: 'Suivi quotidien', href: '/dashboard/student/checkin', icon: NotebookPen },
  { title: 'Entretien IA', href: '/dashboard/student/interview', icon: MicVocal },
  { title: 'Mon profil', href: '/dashboard/student/profile', icon: UserRound },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/student') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-b from-[#efe4ff]/95 via-[#f8f3ff]/90 to-[#eadcff]/95 p-4 shadow-[0_25px_70px_rgba(109,40,217,0.18)] backdrop-blur-xl md:flex">
      <div className="mb-6 flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/65 p-3 shadow-[0_8px_24px_rgba(109,40,217,0.08)]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white shadow-[0_10px_26px_rgba(139,92,246,0.28)]">
          <MoonStar className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#2d1068]">Espace etudiant</p>
          <p className="truncate text-xs text-[#7a6a99]">Dream coaching</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={`group flex items-center gap-3 rounded-[20px] border px-3 py-3 text-sm font-medium transition ${
                active
                  ? 'border-white/80 bg-white text-[#2d1068] shadow-[0_12px_30px_rgba(109,40,217,0.16)]'
                  : 'border-transparent text-[#6E628F] hover:border-white/70 hover:bg-white/70 hover:text-[#2d1068]'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                  active
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400 text-white'
                    : 'bg-white/70 text-[#8B5CF6] group-hover:bg-[#F3ECFF]'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-white/70 pt-4">
        <LogoutButton showLabel />
      </div>
    </aside>
  )
}
