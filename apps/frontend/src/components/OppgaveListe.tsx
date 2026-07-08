import { Table, Tag } from '@navikt/ds-react'
import type { Oppgave, OppgaveStatus, Prioritet } from '@/lib/api'
import {
  TableBody,
  TableDataCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@navikt/ds-react/Table'

interface OppgaveListeProps {
  oppgaver: Oppgave[]
}

function StatusTag({ status }: { status: OppgaveStatus }) {
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

function PrioritetTag({ prioritet }: { prioritet: Prioritet }) {
  const variants: Record<
    Prioritet,
    { variant: 'error' | 'neutral' | 'warning'; label: string }
  > = {
    HØY: { variant: 'error', label: 'Høy' },
    NORMAL: { variant: 'neutral', label: 'Normal' },
    LAV: { variant: 'warning', label: 'Lav' },
  }

  const { variant, label } = variants[prioritet]
  return <Tag variant={variant}>{label}</Tag>
}

function formatDato(iso: string): string {
  return new Date(iso).toLocaleString('nb-NO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function OppgaveListe({ oppgaver }: OppgaveListeProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell scope="col">Person-id</TableHeaderCell>
          <TableHeaderCell scope="col">Tittel</TableHeaderCell>
          <TableHeaderCell scope="col">Beskrivelse</TableHeaderCell>
          <TableHeaderCell scope="col">Status</TableHeaderCell>
          <TableHeaderCell scope="col">Prioritet</TableHeaderCell>
          <TableHeaderCell scope="col">Opprettet av</TableHeaderCell>
          <TableHeaderCell scope="col">Opprettet</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {oppgaver.map((oppgave) => (
          <TableRow key={oppgave.id}>
            <TableDataCell>{oppgave.personId}</TableDataCell>
            <TableDataCell>{oppgave.tittel}</TableDataCell>
            <TableDataCell>{oppgave.beskrivelse}</TableDataCell>
            <TableDataCell>
              <StatusTag status={oppgave.status} />
            </TableDataCell>
            <TableDataCell>
              <PrioritetTag prioritet={oppgave.prioritet} />
            </TableDataCell>
            <TableDataCell>{oppgave.opprettetAv}</TableDataCell>
            <TableDataCell>{formatDato(oppgave.opprettetAt)}</TableDataCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
