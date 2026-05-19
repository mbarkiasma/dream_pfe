'use client'

import type { ComponentProps } from 'react'

import { Button } from '@payloadcms/ui'

type AdminLogoutButtonProps = ComponentProps<typeof Button>

export default function AdminLogoutButton(props: AdminLogoutButtonProps) {
  return (
    <Button
      {...props}
      buttonStyle="secondary"
      onClick={() => {
        window.location.href = '/logout'
      }}
      type="button"
    >
      Deconnexion
    </Button>
  )
}
