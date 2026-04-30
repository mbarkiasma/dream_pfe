'use client'

import { Button } from '@/components/ui/button'

export function PrintPdfButton() {
  return (
    <Button variant="dream" size="pill" onClick={() => window.print()}>
      Télécharger / Imprimer en PDF
    </Button>
  )
}
