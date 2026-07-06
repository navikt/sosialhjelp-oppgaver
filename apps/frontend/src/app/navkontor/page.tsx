import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Alert, Heading, Page } from '@navikt/ds-react'
import { getToken, validateAzureToken } from '@navikt/oasis'
import { fetchOppgaver } from '@/lib/api'
import ScopeNav from '@/components/ScopeNav'
import OppgaveListe from '@/components/OppgaveListe'

// TODO: Erstatt med ansatt→enhet-mapping når den er på plass
const ENHET = process.env['HARDCODED_ENHET'] ?? '0301'

export default async function NavkontorPage() {
  const headersList = await headers()
  const token = getToken(headersList)

  if (!token) {
    redirect('/ingen-tilgang')
  }

  const validation = await validateAzureToken(token)
  if (!validation.ok) {
    redirect('/ingen-tilgang')
  }

  const result = await fetchOppgaver(token, ENHET)

  return (
    <>
      <ScopeNav />
      <Page.Block as="main" width="xl" gutters>
        <Heading level="1" size="large" spacing>
          Oppgaver for enhet {ENHET}
        </Heading>

        {'error' in result ? (
          <Alert variant="error">{result.error.message}</Alert>
        ) : (
          <OppgaveListe oppgaver={result.oppgaver} />
        )}
      </Page.Block>
    </>
  )
}
