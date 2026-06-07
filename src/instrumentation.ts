export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on('uncaughtException', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ERR_INVALID_STATE') return
      console.error('uncaughtException:', err)
    })
  }
}
