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
  const url = `${backendUrl}/api/oppgaver?enhet=${encodeURIComponent(enhet)}`
  const response = await exchangedFetch(url, token, {
    next: { revalidate: 0 },
  })

  if ('error' in response) {
    return response
  }

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
  const response = await exchangedFetch(`${backendUrl}/api/oppgaver`, token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, personId: '16109127384' }),
  })

  if ('error' in response) {
    return response
  }
  if (!response.ok) {
    return { error: { message: 'Kunne ikke opprette oppgave', status: response.status } }
  }

  const oppgave = (await response.json()) as Oppgave
  return { oppgave }
}

export async function updateOppgaveStatus(
  token: string,
  id: string,
  status: OppgaveStatus,
): Promise<{ oppgave: Oppgave } | { error: ApiError }> {
  const response = await exchangedFetch(
    `${backendUrl}/api/oppgaver/${encodeURIComponent(id)}`,
    token,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
  )

  if ('error' in response) {
    return response
  }

  if (!response.ok) {
    return { error: { message: 'Kunne ikke oppdatere status', status: response.status } }
  }

  const oppgave = (await response.json()) as Oppgave
  return { oppgave }
}

export async function getOppgaver(
  token: string,
): Promise<{ oppgaver: Oppgave[] } | { error: ApiError }> {
  const response = await exchangedFetch(`${backendUrl}/api/oppgaver/sok`, token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ personId: '16109127384' }),
  })

  if ('error' in response) {
    return response
  }
  if (!response.ok) {
    return { error: { message: 'Kunne ikke hente oppgaver', status: response.status } }
  }

  const oppgaver = (await response.json()) as Oppgave[]
  return { oppgaver }
}

async function exchangedFetch(
  url: string,
  token: string,
  options: RequestInit,
): Promise<Response | { error: ApiError }> {
  let exchangedToken: string
  try {
    exchangedToken = await exchangeToken(token, backendAudience)
  } catch (e: unknown) {
    logger.error(e, 'Failed to exchange token')
    return { error: { message: 'Autentisering feilet', status: 401 } }
  }
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${exchangedToken}`,
      ...options.headers,
    },
  })
}
