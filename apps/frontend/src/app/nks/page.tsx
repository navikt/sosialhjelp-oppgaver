import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getToken, validateAzureToken } from '@navikt/oasis'
import ScopeNav from '@/components/ScopeNav'
import OppgaveForm from '@/components/OppgaveForm'

export default async function NksPage() {
  const headersList = await headers()
  const token = getToken(headersList)

  if (!token) {
    redirect('/ingen-tilgang')
  }

  const validation = await validateAzureToken(token)
  if (!validation.ok) {
    redirect('/ingen-tilgang')
  }

  return (
    <>
      <ScopeNav />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <OppgaveForm token={token} />
      </main>
    </>
  )
}
