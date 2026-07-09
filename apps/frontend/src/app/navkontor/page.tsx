import { Box, Heading } from '@navikt/ds-react'
import {
  LocalAlert,
  LocalAlertContent,
  LocalAlertHeader,
  LocalAlertTitle,
} from '@navikt/ds-react/LocalAlert'
import { createApiClient } from '@/lib/api'
import { authenticate } from '@/lib/auth'
import NavkontorOppgaveListe from '@/components/NavkontorOppgaveListe'

// TODO: Erstatt med ansatt→enhet-mapping når den er på plass
const ENHET = process.env['HARDCODED_ENHET'] ?? '0301'

async function NavkontorPage() {
  const token = await authenticate()

  const { data, error } = await createApiClient(token).GET('/api/oppgaver', {
    params: { query: { enhet: ENHET } },
  })

  return (
    <Box className="mt-20">
      <Heading level="1" size="large" spacing>
        Oppgaver for enhet {ENHET}
      </Heading>

      {error ? (
        <LocalAlert status="error">
          <LocalAlertHeader>
            <LocalAlertTitle as="h2">Kunne ikke hente oppgaver</LocalAlertTitle>
          </LocalAlertHeader>
          <LocalAlertContent>Kunne ikke hente oppgaver</LocalAlertContent>
        </LocalAlert>
      ) : (
        <NavkontorOppgaveListe oppgaver={data} />
      )}
    </Box>
  )
}

export default NavkontorPage
