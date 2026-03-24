type StudentTopbarProps = {
  title: string
  description: string
}

export function StudentTopbar({ title, description }: StudentTopbarProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">{description}</p>
    </div>
  )
}
