import { Alert, Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

export default function IngenTilgangPage() {
  return (
    <PageBlock as="main" width="text" gutters>
      <Heading level="1" size="large" spacing>
        Ingen tilgang
      </Heading>
      <Alert variant="error">
        Du har ikke tilgang til denne siden. Ta kontakt med din leder eller systemansvarlig.
      </Alert>
    </PageBlock>
  )
}
