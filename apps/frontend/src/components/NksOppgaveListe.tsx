import OppgaveListe, {
  StatusTag,
  PrioritetTag,
  formatDato,
  type OppgaveKolonne,
} from '@/components/OppgaveListe'
import { enhetNavn } from '@/lib/enheter'
import { createApiClient } from '@/lib/api'
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
  const { data, error } = await createApiClient(token).POST('/api/oppgaver/sok', {
    body: { personId: '16109127384' },
  })

  if (error) {
    return <InlineMessage status="error">Kunne ikke hente oppgaver</InlineMessage>
  }
  if (data.length === 0) {
    return <InlineMessage status="info">Ingen oppgaver for brukeren</InlineMessage>
  }
  return <OppgaveListe oppgaver={data} kolonner={kolonner} />
}
