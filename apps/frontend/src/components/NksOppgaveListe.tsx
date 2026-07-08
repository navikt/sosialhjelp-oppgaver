import OppgaveListe, {
  StatusTag,
  PrioritetTag,
  formatDato,
  type OppgaveKolonne,
} from '@/components/OppgaveListe'
import { enhetNavn } from '@/lib/enheter'
import { getOppgaver } from '@/lib/api'
import { InlineMessage } from '@navikt/ds-react'
import { authenticate } from '@/lib/auth'

const kolonner: OppgaveKolonne[] = [
  { header: 'Tittel', render: (o) => o.tittel },
  { header: 'Beskrivelse', render: (o) => o.beskrivelse },
  { header: 'Enhet', render: (o) => enhetNavn(o.enhet) },
  { header: 'Status', render: (o) => <StatusTag status={o.status} /> },
  { header: 'Prioritet', render: (o) => <PrioritetTag prioritet={o.prioritet} /> },
  { header: 'Opprettet av', render: (o) => o.opprettetAv },
  { header: 'Opprettet', render: (o) => formatDato(o.opprettetAt) },
]

export default async function NksOppgaveListe() {
  const token = await authenticate()
  async function hentOppgaver() {
    'use server'
    return getOppgaver(token)
  }

  const response = await hentOppgaver()

  if ('error' in response) {
    return (
      <InlineMessage status="error">
        Kunne ikke hente oppgaver: {response.error.message}
      </InlineMessage>
    )
  }
  const oppgaver = response.oppgaver
  if (oppgaver.length === 0) {
    return <InlineMessage status="info">Ingen oppgaver for brukeren</InlineMessage>
  }
  return <OppgaveListe oppgaver={oppgaver} kolonner={kolonner} />
}
