'use server'

import { logger } from '@navikt/next-logger'
import { revalidatePath } from 'next/cache'
import { updateOppgaveStatus } from '@/lib/api'
import type { OppgaveStatus } from '@/lib/api'
import { authenticate } from '@/lib/auth'

export async function oppdaterStatus(id: string, status: OppgaveStatus): Promise<{ error?: string }> {
  const token = await authenticate()
  const result = await updateOppgaveStatus(token, id, status)

  if ('error' in result) {
    logger.error({ id, status }, `Feil ved oppdatering av oppgavestatus: ${result.error.message}`)
    return { error: result.error.message }
  }

  logger.info({ id, status }, 'Oppgavestatus oppdatert')
  revalidatePath('/navkontor')
  return {}
}
