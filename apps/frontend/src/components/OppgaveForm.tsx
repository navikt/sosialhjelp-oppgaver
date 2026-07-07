'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Heading, Textarea, TextField, VStack } from '@navikt/ds-react'
import type { OpprettOppgaveRequest, Oppgave, ApiError } from '@/lib/api'

interface FormValues {
  tittel: string
  beskrivelse: string
  enhet: string
}

interface OppgaveFormProps {
  opprettOppgave: (
    data: Omit<OpprettOppgaveRequest, 'personId'>,
  ) => Promise<{ oppgave: Oppgave } | { error: ApiError }>
}

export default function OppgaveForm({ opprettOppgave }: OppgaveFormProps) {
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  async function onSubmit(data: FormValues) {
    setSuccess(false)
    setApiError(null)

    const result = await opprettOppgave(data)

    if ('error' in result) {
      setApiError(result.error.message)
      return
    }

    setSuccess(true)
    reset()
  }

  return (
    <VStack gap="space-24">
      <Heading level="1" size="large">
        Opprett oppgave
      </Heading>

      {success && (
        <Alert variant="success">Oppgaven ble opprettet og sendt til Nav-kontoret.</Alert>
      )}

      {apiError && <Alert variant="error">{apiError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <VStack gap="space-16">
          <TextField
            label="Tittel"
            description="Kort beskrivelse av oppgaven"
            error={errors.tittel?.message}
            {...register('tittel', {
              required: 'Tittel er påkrevd',
              maxLength: { value: 200, message: 'Tittel kan ikke være lengre enn 200 tegn' },
            })}
          />

          <Textarea
            label="Beskrivelse"
            description="Detaljert beskrivelse av oppgaven"
            error={errors.beskrivelse?.message}
            {...register('beskrivelse', {
              required: 'Beskrivelse er påkrevd',
            })}
          />

          <TextField
            label="Enhetsnummer"
            description="Nav-kontorets 4-sifrede enhetsnummer"
            error={errors.enhet?.message}
            {...register('enhet', {
              required: 'Enhetsnummer er påkrevd',
              pattern: {
                value: /^\d{4}$/,
                message: 'Enhetsnummer må være 4 siffer',
              },
            })}
          />

          <Button type="submit" loading={isSubmitting}>
            Send oppgave
          </Button>
        </VStack>
      </form>
    </VStack>
  )
}
