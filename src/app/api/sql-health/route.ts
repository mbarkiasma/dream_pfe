import { NextResponse } from 'next/server'

import { getSQLHealth } from '@/lib/sql-db'

export async function GET() {
  try {
    const health = await getSQLHealth()

    return NextResponse.json({
      ok: true,
      ...health,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown SQL connection error.'

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    )
  }
}
