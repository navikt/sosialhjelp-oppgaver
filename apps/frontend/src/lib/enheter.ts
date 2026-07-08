export const ENHETER: Record<string, string> = {
  '0301': 'Nav Gamle Oslo',
}

export function enhetNavn(enhet: string): string {
  return ENHETER[enhet] ?? enhet
}
