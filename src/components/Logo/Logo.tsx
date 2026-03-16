import clsx from 'clsx'
import React from 'react'
import { MoonStar } from 'lucide-react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
        <MoonStar className="h-5 w-5 text-violet-600" />
      </div>

      <span className="text-3xl font-semibold tracking-tight text-violet-700">
        Dream
      </span>
    </div>
  )
}