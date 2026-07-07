import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Box, Heading, InlineMessage } from '@navikt/ds-react'
import { LocalAlert, LocalAlertContent, LocalAlertHeader, LocalAlertTitle } from '@navikt/ds-react/LocalAlert'
import { getToken, validateAzureToken } from '@navikt/oasis'
import { fetchOppgaver } from '@/lib/api'
import OppgaveListe from '@/components/OppgaveListe'

// TODO: Erstatt med ansatt→enhet-mapping når den er på plass
const ENHET = process.env['HARDCODED_ENHET'] ?? '0301'
const skipAuth = process.env['SKIP_AUTH'] === 'true'

async function NavkontorPage() {
  let token: string

  if (skipAuth) {
    token = 'local-dev-token'
  } else {
    const headersList = await headers()
    const rawToken = getToken(headersList)

    if (!rawToken) {
      redirect('/ingen-tilgang')
    }

    const validation = await validateAzureToken(rawToken)
    if (!validation.ok) {
      redirect('/ingen-tilgang')
    }

    token = rawToken
  }

  const result = await fetchOppgaver(token, ENHET)

  return (
    <Box className="mt-20">
      <Heading level="1" size="large" spacing>
        Oppgaver for enhet {ENHET}
      </Heading>

      {'error' in result ? (
        <LocalAlert status="error">
          <LocalAlertHeader>
            <LocalAlertTitle as="h2">Kunne ikke hente oppgaver</LocalAlertTitle>
          </LocalAlertHeader>
          <LocalAlertContent>{result.error.message}</LocalAlertContent>
        </LocalAlert>
      ) : (
        <NavKontorOppgaveListe oppgaver={result.oppgaver} />
      )}
    </Box>
  )
}

const NavKontorOppgaveListe: typeof OppgaveListe = (props) => {
  if (props.oppgaver.length === 0) {
    return <InlineMessage status="info">Ingen oppgaver for denne enheten.</InlineMessage>
  }
  return <OppgaveListe {...props} />
}

export default NavkontorPage
