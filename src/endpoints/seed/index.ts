import type { Payload, PayloadRequest } from 'payload'

export const seed = async ({
  payload,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seed skipped: demo posts/categories are not used in this project.')
}
