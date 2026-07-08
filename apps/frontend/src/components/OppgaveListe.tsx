import type { ReactNode } from 'react'
import { Table, Tag } from '@navikt/ds-react'
import type { Oppgave, OppgaveStatus, Prioritet } from '@/lib/api'
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@navikt/ds-react/Table'

export interface OppgaveKolonne {
  header: string
  render: (oppgave: Oppgave) => ReactNode
}

interface OppgaveListeProps {
  oppgaver: Oppgave[]
  kolonner: OppgaveKolonne[]
}

export function StatusTag({ status }: { status: OppgaveStatus }) {
  const variants: Record<
    OppgaveStatus,
    { variant: 'info' | 'warning' | 'success'; label: string }
  > = {
    NY: { variant: 'info', label: 'Ny' },
    UNDER_BEHANDLING: { variant: 'warning', label: 'Under behandling' },
    FERDIG: { variant: 'success', label: 'Ferdig' },
  }

  const { variant, label } = variants[status]
  return <Tag variant={variant}>{label}</Tag>
}

export function PrioritetTag({ prioritet }: { prioritet: Prioritet }) {
  const variants: Record<Prioritet, { variant: 'error' | 'neutral' | 'warning'; label: string }> = {
    HØY: { variant: 'error', label: 'Høy' },
    NORMAL: { variant: 'neutral', label: 'Normal' },
    LAV: { variant: 'warning', label: 'Lav' },
  }

  const { variant, label } = variants[prioritet]
  return <Tag variant={variant}>{label}</Tag>
}

export function formatDato(iso: string): string {
  return new Date(iso).toLocaleString('nb-NO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function OppgaveListe({ oppgaver, kolonner }: OppgaveListeProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {kolonner.map((k) => (
            <TableHeaderCell key={k.header} scope="col">
              {k.header}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {oppgaver.map((oppgave) => (
          <TableRow key={oppgave.id}>
            {kolonner.map((k) => (
              <TableDataCell key={k.header}>{k.render(oppgave)}</TableDataCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
