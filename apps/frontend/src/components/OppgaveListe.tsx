import { Alert, Table, Tag } from '@navikt/ds-react'
import type { Oppgave, OppgaveStatus } from '@/lib/api'

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

function formatDato(iso: string): string {
  return new Date(iso).toLocaleString('nb-NO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function OppgaveListe({ oppgaver }: OppgaveListeProps) {
  if (oppgaver.length === 0) {
    return <Alert variant="info">Ingen oppgaver for denne enheten.</Alert>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Tittel</Table.HeaderCell>
          <Table.HeaderCell scope="col">Status</Table.HeaderCell>
          <Table.HeaderCell scope="col">Opprettet av</Table.HeaderCell>
          <Table.HeaderCell scope="col">Opprettet</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {oppgaver.map((oppgave) => (
          <Table.Row key={oppgave.id}>
            <Table.DataCell>{oppgave.tittel}</Table.DataCell>
            <Table.DataCell>
              <StatusTag status={oppgave.status} />
            </Table.DataCell>
            <Table.DataCell>{oppgave.opprettetAv}</Table.DataCell>
            <Table.DataCell>{formatDato(oppgave.opprettetAt)}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
