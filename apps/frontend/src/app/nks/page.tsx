import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getToken, validateAzureToken } from '@navikt/oasis'
import OppgaveForm from '@/components/OppgaveForm'
import { createOppgave, Oppgave, ApiError, OpprettOppgaveRequest } from '@/lib/api'
import { Heading, VStack } from '@navikt/ds-react'
import NksOppgaveListe from '@/components/NksOppgaveListe'
import { authenticate } from '@/lib/auth'

export default async function NksPage() {
  const token = await authenticate()

  async function opprettOppgave(
    _prevState: { oppgave: Oppgave } | { error: ApiError } | null,
    formData: FormData,
  ) {
    'use server'

    const { tittel, beskrivelse, enhet, prioritet } = Object.fromEntries(
      formData,
    ) as unknown as Omit<OpprettOppgaveRequest, 'personId'>

    const result = await createOppgave(token, { tittel, beskrivelse, enhet, prioritet })
    if ('oppgave' in result) {
      revalidatePath('/nks')
    }
    return result
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
