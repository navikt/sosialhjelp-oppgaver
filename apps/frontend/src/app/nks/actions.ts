'use server'

import { revalidatePath } from 'next/cache'
import { createApiClient } from '@/lib/api'
import type { Oppgave, ApiError, OpprettOppgaveRequest } from '@/lib/api'
import { authenticate } from '@/lib/auth'

export async function opprettOppgave(
  _prevState: { oppgave: Oppgave } | { error: ApiError } | null,
  formData: FormData,
): Promise<{ oppgave: Oppgave } | { error: ApiError }> {
  const token = await authenticate()

  const { tittel, beskrivelse, enhet, prioritet } = Object.fromEntries(
    formData,
  ) as unknown as Omit<OpprettOppgaveRequest, 'personId'>

  const { data, error } = await createApiClient(token).POST('/api/oppgaver', {
    body: { tittel, beskrivelse, enhet, prioritet, personId: '16109127384' },
  })

  if (error) {
    return { error: { message: 'Kunne ikke opprette oppgave', status: 500 } }
  }

  revalidatePath('/nks')
  return { oppgave: data }
}
