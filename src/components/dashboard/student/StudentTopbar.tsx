import { NotificationBell } from '@/components/dashboard/Notification'

type StudentTopbarProps = {
  title: string
  description: string
}

export function StudentTopbar({ title, description }: StudentTopbarProps) {
  return (
    <div className="relative z-50 mb-8 rounded-[30px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_55px_rgba(109,40,217,0.10)] backdrop-blur md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9B6BFF]">
            Tableau de bord
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#2d1068] md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6E628F] md:text-base">
            {description}
          </p>
        </div>

        <NotificationBell />
      </div>
    </div>
  )
}
