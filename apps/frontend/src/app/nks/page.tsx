import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getToken, validateAzureToken } from '@navikt/oasis'
import OppgaveForm from '@/components/OppgaveForm'
import { createOppgave, getOppgaver, Oppgave, ApiError, OpprettOppgaveRequest } from '@/lib/api'
import { InlineMessage, VStack } from '@navikt/ds-react'
import OppgaveListe from '@/components/OppgaveListe'

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

    const { tittel, beskrivelse, enhet, prioritet } = Object.fromEntries(formData) as unknown as Omit<
      OpprettOppgaveRequest,
      'personId'
    >

    const result = await createOppgave(token!, { tittel, beskrivelse, enhet, prioritet })
    if ('oppgave' in result) {
      revalidatePath('/nks')
    }
    return result
  }

  return (
    <VStack gap="space-20" className="mt-20">
      <NksOppgaveListe token={token} />
      <OppgaveForm opprettOppgave={opprettOppgave} />
    </VStack>
  )
}

const NksOppgaveListe = async ({ token }: { token: string }) => {
  async function hentOppgaver() {
    'use server'
    return getOppgaver(token!)
  }

  const response = await hentOppgaver()

  if ('error' in response) {
    return (
      <InlineMessage status="error">
        Kunne ikke hente oppgaver: {response.error.message}
      </InlineMessage>
    )
  }
  const oppgaver = response.oppgaver
  if (oppgaver.length === 0) {
    return <InlineMessage status="info">Ingen oppgaver for brukeren</InlineMessage>
  }
  return <OppgaveListe oppgaver={oppgaver} />
}
