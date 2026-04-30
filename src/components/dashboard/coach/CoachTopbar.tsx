import { NotificationBell } from '@/components/dashboard/NotificationCloche'
import { ThemeToggle } from '@/components/ThemeToggle'

type CoachTopbarProps = {
  title: string
  description: string
}

export function CoachTopbar({ title, description }: CoachTopbarProps) {
  return (
    <div className="relative z-50 mb-8 rounded-[30px] border border-border bg-white/60 p-5 shadow-[0_18px_55px_rgba(109,40,217,0.10)] backdrop-blur dark:border-border dark:bg-card/70 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-dream-accent">
            Tableau de bord
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-dream-heading dark:text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-dream-muted dark:text-muted-foreground md:text-base">
            {description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
