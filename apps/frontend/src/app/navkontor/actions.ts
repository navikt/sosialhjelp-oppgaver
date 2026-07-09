'use server'

import { logger } from '@navikt/next-logger'
import { revalidatePath } from 'next/cache'
import { createApiClient } from '@/lib/api'
import type { OppgaveStatus } from '@/lib/api'
import { authenticate } from '@/lib/auth'

export async function oppdaterStatus(
  id: string,
  status: OppgaveStatus,
): Promise<{ error?: string }> {
  const token = await authenticate()
  const { error } = await createApiClient(token).PATCH('/api/oppgaver/{id}', {
    params: { path: { id } },
    body: { status },
  })

  if (error) {
    logger.error({ id, status }, `Feil ved oppdatering av oppgavestatus`)
    return { error: 'Kunne ikke oppdatere status' }
  }

  logger.info({ id, status }, 'Oppgavestatus oppdatert')
  revalidatePath('/navkontor')
  return {}
}
