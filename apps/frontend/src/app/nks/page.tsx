import { revalidatePath } from 'next/cache'
import OppgaveForm from '@/components/OppgaveForm'
import { createApiClient } from '@/lib/api'
import type { Oppgave, ApiError, OpprettOppgaveRequest } from '@/lib/api'
import { Heading, VStack } from '@navikt/ds-react'
import NksOppgaveListe from '@/components/NksOppgaveListe'
import { authenticate } from '@/lib/auth'

export default async function NksPage() {
  await authenticate()

  async function opprettOppgave(
    _prevState: { oppgave: Oppgave } | { error: ApiError } | null,
    formData: FormData,
  ) {
    'use server'

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

  return (
    <VStack gap="space-20" className="mt-20">
      <Heading level="1" size="large" spacing>
        Oppgaver for person 16109127384
      </Heading>
      <NksOppgaveListe />
      <OppgaveForm opprettOppgave={opprettOppgave} />
    </VStack>
  )
}
