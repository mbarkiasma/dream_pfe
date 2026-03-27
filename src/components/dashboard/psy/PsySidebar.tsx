import Link from 'next/link'
import {
  CalendarDays,
  FileText,
  Home,
  Moon,
  NotebookPen,
  User,
  Users,
} from 'lucide-react'
import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/psy',
    icon: Home,
  },
  {
    title: 'Étudiants',
    href: '/dashboard/psy/students',
    icon: Users,
  },

  {
    title: 'Mon profil',
    href: '/dashboard/psy/profil',
    icon: User,
  },
]

export function PsychologueSidebar() {
  return (
    <aside className="hidden min-h-full w-24 flex-col items-center rounded-[32px] bg-gradient-to-b from-[#7c83fd] via-[#8b8ff8] to-[#a5b4fc] py-6 shadow-[0_20px_60px_rgba(124,131,253,0.25)] md:flex">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className="rounded-2xl bg-white/20 p-3 text-white transition hover:bg-white/30"
            >
              <Icon className="h-5 w-5" />
            </Link>
          )
        })}
      </div>

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  )
}