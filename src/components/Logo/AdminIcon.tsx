'use client'

import { useEffect } from 'react'

const AdminIcon = () => {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'mindbloom-admin-overrides'
    style.textContent = `
      .step-nav > span:not([class]) {
        display: none !important;
      }
    `
    if (!document.getElementById('mindbloom-admin-overrides')) {
      document.head.appendChild(style)
    }
  }, [])

  return null
}

export default AdminIcon
