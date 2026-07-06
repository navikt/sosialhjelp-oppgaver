import { Alert, Heading, Page } from '@navikt/ds-react'

export default function IngenTilgangPage() {
  return (
    <Page>
      <Page.Block as="main" width="text" gutters>
        <Heading level="1" size="large" spacing>
          Ingen tilgang
        </Heading>
        <Alert variant="error">
          Du har ikke tilgang til denne siden. Ta kontakt med din leder eller systemansvarlig.
        </Alert>
      </Page.Block>
    </Page>
  )
}
