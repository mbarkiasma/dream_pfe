'use client'

import { useEffect } from 'react'

export default function AuthRedirectPage() {
  useEffect(() => {
    window.location.replace('/dashboard/student')
  }, [])

  return null
}
