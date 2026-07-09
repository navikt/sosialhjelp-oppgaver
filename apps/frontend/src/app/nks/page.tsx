import OppgaveForm from '@/components/OppgaveForm'
import { Heading, VStack } from '@navikt/ds-react'
import NksOppgaveListe from '@/components/NksOppgaveListe'
import { authenticate } from '@/lib/auth'

export default async function NksPage() {
  await authenticate()

  return (
    <VStack gap="space-20" className="mt-20">
      <Heading level="1" size="large" spacing>
        Oppgaver for person 16109127384
      </Heading>
      <NksOppgaveListe />
      <OppgaveForm />
    </VStack>
  )
}
