'use client'

import { useActionState } from 'react'
import {
  Button,
  Heading,
  InlineMessage,
  Select,
  Textarea,
  TextField,
  VStack,
} from '@navikt/ds-react'
import {
  LocalAlert,
  LocalAlertContent,
  LocalAlertHeader,
  LocalAlertTitle,
} from '@navikt/ds-react/LocalAlert'
import { ENHETER } from '@/lib/enheter'
import { opprettOppgave } from '@/app/nks/actions'

export default function OppgaveForm() {
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

          <Select label="Enhetsnummer" name="enhet" required>
            {Object.entries(ENHETER).map(([verdi, navn]) => (
              <option key={verdi} value={verdi}>
                {navn}
              </option>
            ))}
          </Select>

          <Select label="Prioritet" name="prioritet" defaultValue="NORMAL">
            <option value="HØY">Høy</option>
            <option value="NORMAL">Normal</option>
            <option value="LAV">Lav</option>
          </Select>

          <Button type="submit" loading={pending}>
            Send oppgave
          </Button>
        </VStack>
      </form>
    </VStack>
  )
}
