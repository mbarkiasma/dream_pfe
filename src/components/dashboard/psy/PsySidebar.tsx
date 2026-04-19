import Link from 'next/link'
import { CalendarDays, Home, User, Users } from 'lucide-react'
import { LogoutButton } from '@/components/dashboard/student/Logout'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/psy',
    icon: Home,
  },
  {
    title: 'Ã‰tudiants',
    href: '/dashboard/psy/students',
    icon: Users,
  },
  {
    title: 'Rendez-vous',
    href: '/dashboard/psy/rendez_vous',
    icon: CalendarDays,
  },
  {
    title: 'Mon profil',
    href: '/dashboard/psy/profil',
    icon: User,
  },
]

export function PsySidebar() {
  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-24 shrink-0 flex-col items-center overflow-y-auto rounded-[32px] bg-gradient-to-b from-[#7c83fd] via-[#8b8ff8] to-[#a5b4fc] py-6 shadow-[0_20px_60px_rgba(124,131,253,0.25)] md:flex">
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className="rounded-2xl bg-white/20 p-3 text-white"
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

