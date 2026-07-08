import {
  LocalAlert,
  LocalAlertContent,
  LocalAlertHeader,
  LocalAlertTitle,
} from '@navikt/ds-react/LocalAlert'
import { PageBlock } from '@navikt/ds-react/Page'

export default function IngenTilgangPage() {
  return (
    <PageBlock as="main" width="text" gutters>
      <LocalAlert status="error">
        <LocalAlertHeader>
          <LocalAlertTitle as="h2">Ingen tilgang</LocalAlertTitle>
        </LocalAlertHeader>
        <LocalAlertContent>
          Du har ikke tilgang til denne siden. Ta kontakt med din leder eller systemansvarlig.
        </LocalAlertContent>
      </LocalAlert>
    </PageBlock>
  )
}
