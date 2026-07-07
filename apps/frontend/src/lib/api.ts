import { requestAzureOboToken } from '@navikt/oasis'

const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:8083'
const backendAudience = process.env['BACKEND_AUDIENCE']

export type OppgaveStatus = 'NY' | 'UNDER_BEHANDLING' | 'FERDIG'

export interface Oppgave {
  id: string
  tittel: string
  opprettetAv: string
  personId: string
  enhet: string
  status: OppgaveStatus
  opprettetAt: string
  oppdatertAt: string
}

export interface OpprettOppgaveRequest {
  tittel: string
  beskrivelse: string
  personId: string
  enhet: string
}

export interface HentOppgaverRequest {
  personId: string
}

export interface ApiError {
  message: string
  status: number
}

/**
 * Gjør OBO-exchange via @navikt/oasis. Oasis cacher tokens automatisk.
 *
 * Lokalt (uten BACKEND_AUDIENCE) returneres inngangstokenet uendret —
 * mock-oauth2-server utsteder tokens som backend godtar direkte.
 */
async function exchangeToken(incomingToken: string): Promise<string> {
  if (!backendAudience) {
    return incomingToken
  }

  const result = await requestAzureOboToken(incomingToken, backendAudience)
  if (!result.ok) {
    throw result.error
  }

  return result.token
}

export async function fetchOppgaver(
  incomingToken: string,
  enhet: string,
): Promise<{ oppgaver: Oppgave[] } | { error: ApiError }> {
  let token: string
  try {
    token = await exchangeToken(incomingToken)
  } catch {
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }

  const url = `${backendUrl}/api/oppgaver?enhet=${encodeURIComponent(enhet)}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })

  if (!response.ok) {
    return { error: { message: 'Kunne ikke hente oppgaver', status: response.status } }
  }

  const oppgaver = (await response.json()) as Oppgave[]
  return { oppgaver }
}

export async function createOppgave(
  incomingToken: string,
  data: Omit<OpprettOppgaveRequest, 'personId'>,
): Promise<{ oppgave: Oppgave } | { error: ApiError }> {
  let token: string
  try {
    token = await exchangeToken(incomingToken)
  } catch {
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }
  const response = await fetch(`${backendUrl}/api/oppgaver`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
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
  incomingToken: string,
): Promise<{ oppgaver: Oppgave[] } | { error: ApiError }> {
  let token: string
  try {
    token = await exchangeToken(incomingToken)
  } catch {
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }
  const response = await fetch(`${backendUrl}/api/oppgaver/sok`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
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
