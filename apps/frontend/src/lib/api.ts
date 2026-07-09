import createClient, { type Middleware } from 'openapi-fetch'
import { logger } from '@navikt/next-logger'
import type { components, paths } from '@/api/types/openapi'
import { exchangeToken } from '@/lib/auth'

export type Oppgave = components['schemas']['Oppgave']
export type OppgaveStatus = components['schemas']['OppdaterStatusRequest']['status']
export type Prioritet = NonNullable<components['schemas']['OpprettOppgaveRequest']['prioritet']>
export type OpprettOppgaveRequest = components['schemas']['OpprettOppgaveRequest']
export interface ApiError {
  message: string
  status: number
}

const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:8083'
const backendAudience = process.env['BACKEND_AUDIENCE']

function oboMiddleware(token: string): Middleware {
  return {
    async onRequest({ request }) {
      let exchanged: string
      try {
        exchanged = await exchangeToken(token, backendAudience)
      } catch (e) {
        logger.error(e, 'Failed to exchange token')
        throw e
      }
      request.headers.set('Authorization', `Bearer ${exchanged}`)
      return request
    },
  }
}

export function createApiClient(token: string) {
  const client = createClient<paths>({ baseUrl: backendUrl })
  client.use(oboMiddleware(token))
  return client
}
