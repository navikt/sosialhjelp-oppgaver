import OppgaveListe, {
  StatusTag,
  PrioritetTag,
  formatDato,
  type OppgaveKolonne,
} from '@/components/OppgaveListe'
import { Oppgave } from '@/lib/api'
import { InlineMessage } from '@navikt/ds-react'

const kolonner: OppgaveKolonne[] = [
  { header: 'Person-id', render: (o) => o.personId },
  { header: 'Tittel', render: (o) => o.tittel },
  { header: 'Beskrivelse', render: (o) => o.beskrivelse },
  { header: 'Status', render: (o) => <StatusTag status={o.status} /> },
  { header: 'Prioritet', render: (o) => <PrioritetTag prioritet={o.prioritet} /> },
  { header: 'Opprettet av', render: (o) => o.opprettetAv },
  { header: 'Opprettet', render: (o) => formatDato(o.opprettetAt) },
]
interface NavkontorOppgaveListeProps {
  oppgaver: Oppgave[]
}

export default function NavkontorOppgaveListe({ oppgaver }: NavkontorOppgaveListeProps) {
  if (oppgaver.length === 0) {
    return <InlineMessage status="info">Ingen oppgaver for denne enheten.</InlineMessage>
  }
  return <OppgaveListe oppgaver={oppgaver} kolonner={kolonner} />
}
