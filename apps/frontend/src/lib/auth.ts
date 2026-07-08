import { headers } from 'next/headers'
import { getToken, requestAzureOboToken, validateAzureToken } from '@navikt/oasis'
import { redirect } from 'next/navigation'

const SKIP_AUTH = process.env['SKIP_AUTH'] === 'true'

export async function authenticate() {
  let token: string | undefined

  if (SKIP_AUTH) {
    token = 'local-dev-token'
  } else {
    const headersList = await headers()
    token = getToken(headersList) ?? undefined

    if (!token) {
      redirect('/ingen-tilgang')
    }

    const validation = await validateAzureToken(token)
    if (!validation.ok) {
      redirect('/ingen-tilgang')
    }
  }
  return token
}

/**
 * Gjør OBO-exchange via @navikt/oasis. Oasis cacher tokens automatisk.
 *
 * Lokalt (uten BACKEND_AUDIENCE) returneres inngangstokenet uendret —
 * mock-oauth2-server utsteder tokens som backend godtar direkte.
 */
export async function exchangeToken(token: string, audience?: string): Promise<string> {
  if (!audience) {
    return token
  }

  const result = await requestAzureOboToken(token, audience)
  if (!result.ok) {
    throw result.error
  }

  return result.token
}
