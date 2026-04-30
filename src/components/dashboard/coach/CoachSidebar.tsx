'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpenCheck,
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Stethoscope,
  UserRound,
  UsersRound,
} from 'lucide-react'

import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  { title: 'Dashboard', href: '/dashboard/coach', icon: LayoutDashboard },
  { title: 'Etudiants', href: '/dashboard/coach/students', icon: UsersRound },
  { title: 'Plan coaching', href: '/dashboard/coach/plan', icon: ClipboardList },
  { title: 'Sessions', href: '/dashboard/coach/coaching', icon: LifeBuoy },
  { title: 'Exercices', href: '/dashboard/coach/exercices', icon: BookOpenCheck },
  { title: 'Rendez-vous', href: '/dashboard/coach/rendez_vous', icon: CalendarDays },
  { title: 'Notifications', href: '/dashboard/coach/notifications', icon: Bell },
  { title: 'Orientation psy', href: '/dashboard/coach/orientation_psy', icon: Stethoscope },
  { title: 'Annonces', href: '/dashboard/coach/annonces', icon: Megaphone },
  { title: 'Mon profil', href: '/dashboard/coach/profil', icon: UserRound },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard/coach') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CoachSidebar() {
  const pathname = usePathname()

  return (
    <aside className="dream-panel-bg sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col overflow-hidden rounded-[32px] border border-border p-4 shadow-dream-card-lg md:flex">
      <div className="dream-surface mb-6 flex items-center gap-3 rounded-[24px] border p-3 shadow-dream-card">
        <div className="dream-brand-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-dream-accent-foreground shadow-dream-card">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-dream-heading">Espace coach</p>
          <p className="truncate text-xs text-dream-muted">Accompagnement</p>
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
              className={`group flex items-center gap-3 rounded-[20px] border px-3 py-3 text-sm font-medium ${
                active
                  ? 'dream-surface text-dream-heading shadow-dream-card'
                  : 'border-border/0 text-dream-muted hover:border-border hover:bg-dream-softer hover:text-dream-heading'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  active
                    ? 'dream-brand-bg text-dream-accent-foreground'
                    : 'dream-icon-soft group-hover:bg-dream-highlight'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <LogoutButton showLabel />
      </div>
    </aside>
  )
}
