import type { Metadata } from 'next'
import { Provider } from '@navikt/ds-react/Provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sosialhjelp-oppgaver',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
