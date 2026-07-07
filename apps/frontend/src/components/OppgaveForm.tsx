'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Button, Heading, InlineMessage, Textarea, TextField, VStack } from '@navikt/ds-react'
import {
  LocalAlert,
  LocalAlertContent,
  LocalAlertHeader,
  LocalAlertTitle,
} from '@navikt/ds-react/LocalAlert'
import type { Oppgave, ApiError } from '@/lib/api'

type ActionState = { oppgave: Oppgave } | { error: ApiError } | null

interface OppgaveFormProps {
  opprettOppgave: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function OppgaveForm({ opprettOppgave }: OppgaveFormProps) {
  const [state, formAction, pending] = useActionState(opprettOppgave, null)

  return (
    <VStack gap="space-24">
      <Heading level="1" size="large">
        Opprett oppgave
      </Heading>

      {state && 'oppgave' in state && (
        <InlineMessage status="success">
          Oppgaven ble opprettet og sendt til Nav-kontoret.
        </InlineMessage>
      )}
      {state && 'error' in state && (
        <LocalAlert status="error">
          <LocalAlertHeader>
            <LocalAlertTitle as="h2">Feil ved innsending</LocalAlertTitle>
          </LocalAlertHeader>
          <LocalAlertContent>{state.error.message}</LocalAlertContent>
        </LocalAlert>
      )}

      <form action={formAction}>
        <VStack gap="space-16">
          <TextField
            label="Tittel"
            description="Kort beskrivelse av oppgaven"
            name="tittel"
            required
            maxLength={200}
          />

          <Textarea
            label="Beskrivelse"
            description="Detaljert beskrivelse av oppgaven"
            name="beskrivelse"
            required
          />

          <TextField
            label="Enhetsnummer"
            description="Nav-kontorets 4-sifrede enhetsnummer"
            name="enhet"
            required
            pattern="\d{4}"
          />

          <Button type="submit" loading={pending}>
            Send oppgave
          </Button>
        </VStack>
      </form>
    </VStack>
  )
}
