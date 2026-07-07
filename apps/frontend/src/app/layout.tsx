import type { Metadata } from 'next'
import { Provider } from '@navikt/ds-react/Provider'
import './globals.css'
import { Page } from '@navikt/ds-react'
import ScopeNav from '@/components/ScopeNav'
import { PageBlock } from '@navikt/ds-react/Page'

export const metadata: Metadata = {
  title: 'Sosialhjelp-oppgaver',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <head>
        <link rel="icon" href="https://www.nav.no/favicon.ico" type="image/x-icon" />
      </head>
      <Page as="body">
        <ScopeNav />
        <PageBlock as="main" id="maincontent" width="xl" gutters>
          <Provider>{children}</Provider>
        </PageBlock>
      </Page>
    </html>
  )
}
