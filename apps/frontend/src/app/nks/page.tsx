import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getToken, validateAzureToken } from '@navikt/oasis'
import OppgaveForm from '@/components/OppgaveForm'
import { createOppgave, Oppgave, ApiError, OpprettOppgaveRequest } from '@/lib/api'
import { VStack } from '@navikt/ds-react'
import NksOppgaveListe from '@/components/NksOppgaveListe'

const skipAuth = process.env['SKIP_AUTH'] === 'true'

export default async function NksPage() {
  let token: string | undefined

  if (skipAuth) {
    token = 'local-dev-token'
  } else {
    const headersList = await headers()
    token = getToken(headersList) ?? undefined

    if (!token) {
      redirect('/ingen-tilgang')
    }

    const validation = await validateAzureToken(token)
    if (!validation.ok) {
      redirect('/ingen-tilgang')
    }
  }

  async function opprettOppgave(
    _prevState: { oppgave: Oppgave } | { error: ApiError } | null,
    formData: FormData,
  ) {
    'use server'

    const { tittel, beskrivelse, enhet, prioritet } = Object.fromEntries(
      formData,
    ) as unknown as Omit<OpprettOppgaveRequest, 'personId'>

    const result = await createOppgave(token!, { tittel, beskrivelse, enhet, prioritet })
    if ('oppgave' in result) {
      revalidatePath('/nks')
    }
    return result
  }

  return (
    <VStack gap="space-20" className="mt-20">
      <NksOppgaveListe />
      <OppgaveForm opprettOppgave={opprettOppgave} />
    </VStack>
  )
}
