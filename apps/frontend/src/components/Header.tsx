'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { InternalHeader, Spacer } from '@navikt/ds-react'

export default function Header() {
  const pathname = usePathname()

  return (
    <InternalHeader>
      <InternalHeader.Title as="span">Sosialhjelp-oppgaver</InternalHeader.Title>
      <Spacer />
      <InternalHeader.Button
        as={Link}
        href="/nks"
        aria-current={pathname.startsWith('/nks') ? 'page' : undefined}
      >
        NKS
      </InternalHeader.Button>
      <InternalHeader.Button
        as={Link}
        href="/navkontor"
        aria-current={pathname.startsWith('/navkontor') ? 'page' : undefined}
      >
        Nav-kontor
      </InternalHeader.Button>
    </InternalHeader>
  )
}
