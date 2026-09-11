import { describe, expect, it } from 'vitest'
import { enhetNavn } from './enheter'

// Opprettet for å få `pnpm check` grønn i CI, vitest avslutter med exit code 1
// når det ikke finnes testfiler

describe('enhetNavn', () => {
  it('gir visningsnavn for kjent enhet', () => {
    expect(enhetNavn('0301')).toBe('Nav Gamle Oslo')
  })

  it('faller tilbake til enhetsnummeret for ukjent enhet', () => {
    expect(enhetNavn('9999')).toBe('9999')
  })
})
