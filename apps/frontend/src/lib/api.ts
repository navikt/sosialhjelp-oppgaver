import { logger } from '@navikt/next-logger'
import { exchangeToken } from '@/lib/auth'

const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:8083'
const backendAudience = process.env['BACKEND_AUDIENCE']

export type OppgaveStatus = 'NY' | 'UNDER_BEHANDLING' | 'FERDIG'
export type Prioritet = 'HØY' | 'NORMAL' | 'LAV'

export interface Oppgave {
  id: string
  tittel: string
  beskrivelse: string
  opprettetAv: string
  personId: string
  enhet: string
  status: OppgaveStatus
  prioritet: Prioritet
  opprettetAt: string
  oppdatertAt: string
}

export interface OpprettOppgaveRequest {
  tittel: string
  beskrivelse: string
  personId: string
  enhet: string
  prioritet: Prioritet
}

export interface ApiError {
  message: string
  status: number
}

export async function fetchOppgaver(
  token: string,
  enhet: string,
): Promise<{ oppgaver: Oppgave[] } | { error: ApiError }> {
  let exhangedToken: string
  try {
    exhangedToken = await exchangeToken(token, backendAudience)
  } catch (e: unknown) {
    logger.error(e, 'Failed to exchange token')
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }

  const url = `${backendUrl}/api/oppgaver?enhet=${encodeURIComponent(enhet)}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${exhangedToken}` },
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    return { error: { message: 'Kunne ikke hente oppgaver', status: response.status } }
  }

  const oppgaver = (await response.json()) as Oppgave[]
  return { oppgaver }
}

export async function createOppgave(
  token: string,
  data: Omit<OpprettOppgaveRequest, 'personId'>,
): Promise<{ oppgave: Oppgave } | { error: ApiError }> {
  let exchangedToken: string
  try {
    exchangedToken = await exchangeToken(token, backendAudience)
  } catch (e: unknown) {
    logger.error(e, 'Failed to exchange token')
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }
  const response = await fetch(`${backendUrl}/api/oppgaver`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${exchangedToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, personId: '16109127384' }),
  })

  if (!response.ok) {
    return { error: { message: 'Kunne ikke opprette oppgave', status: response.status } }
  }

  const oppgave = (await response.json()) as Oppgave
  return { oppgave }
}

export async function getOppgaver(
  token: string,
): Promise<{ oppgaver: Oppgave[] } | { error: ApiError }> {
  let exchangedToken: string
  try {
    exchangedToken = await exchangeToken(token, backendAudience)
  } catch (e: unknown) {
    logger.error(e, 'Failed to exchange token')
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }
  const response = await fetch(`${backendUrl}/api/oppgaver/sok`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${exchangedToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ personId: '16109127384' }),
  })

  if (!response.ok) {
    return { error: { message: 'Kunne ikke hente oppgaver', status: response.status } }
  }

  const oppgaver = (await response.json()) as Oppgave[]
  return { oppgaver }
}
