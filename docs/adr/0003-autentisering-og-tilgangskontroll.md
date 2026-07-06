# ADR-0003: Autentisering og tilgangskontroll

**Dato:** 2026-07-06  
**Status:** Godkjent

## Kontekst

Backenden eksponerer et API som kalles av klienter på vegne av innloggede Nav-ansatte.
Vi trenger å autentisere innkommende requests og styre hvilke operasjoner ulike klienter har tilgang til.

## Beslutning

### Autentisering

Vi bruker **Entra ID med OBO-flow (on-behalf-of)**. Klienter logger inn brukere via Wonderwall og sender OBO-tokens i `Authorization`-headeren til backenden.

Backenden validerer tokens manuelt med `ktor-server-auth-jwt`. Følgende valideres:

- **Signatur** — verifisert mot JWKS-endepunktet (`AZURE_OPENID_CONFIG_JWKS_URI`)
- **Issuer** — må matche `AZURE_OPENID_CONFIG_ISSUER`
- **Audience** — må matche `AZURE_APP_CLIENT_ID`

Alle nødvendige verdier injiseres automatisk av Nais som miljøvariabler — ingen hardkoding.

### Tilgangskontroll

Tilgang differensieres via **`scp`-claimet** (scopes) i OBO-tokenet. Scopes tildeles per klient i Nais-manifestet:

```yaml
accessPolicy:
  inbound:
    rules:
      - application: <klientapplikasjon>
        permissions:
          scopes:
            - "<scope-navn>"
```

Backenden håndhever scopes på rutenivå — hvilke operasjoner en klient kan utføre styres av hvilke scopes den er tildelt i manifestet. For å gi en ny klient tilgang legges det til en ny inbound-regel med passende scopes — ingen kodeendring er nødvendig.

## Konsekvenser

### Fordeler

- Entra ID OBO bevarer brukerens identitet gjennom hele kjeden — `NAVident` er tilgjengelig i backenden for revisjonslogg
- `scp`-basert tilgangskontroll er deklarativ og manifeststyrt — ny klient krever kun en manifestendring
- Manuell JWT-validering med `ktor-server-auth-jwt` gir full kontroll uten wrapper-biblioteker
- Ingen ekstra nettverkskall per request (i motsetning til introspection endpoint)

### Ulemper og risikoer

- Manuell JWT-validering krever at man selv holder JWKS-cache og håndterer nøkkelrotasjon — `ktor-server-auth-jwt` håndterer dette
- `accessPolicy.inbound` må oppdateres med korrekte appnavn før første deploy

## Alternativer vurdert

**Token introspection endpoint (`NAIS_TOKEN_INTROSPECTION_ENDPOINT`):** Enklere å implementere — backenden sender tokenet til et Nais-endepunkt som validerer det og returnerer claims. Ikke valgt fordi det krever et ekstra nettverkskall per request, og `ktor-server-auth-jwt` dekker behovet uten denne overheaden.

**`token-validation-ktor` (Nav-bibliotek):** Wrapper rundt JWT-validering for Ktor. Ikke valgt fordi `ktor-server-auth-jwt` dekker behovet uten en ekstra avhengighet, og fordi manuell konfigurasjon gir bedre innsyn i hva som faktisk valideres.

**`azp`-claim for tilgangskontroll:** Fungerer, men krever at klienters client-IDer konfigureres som env-vars i appkoden. `scp` er idiomatisk for OBO og holder autorisasjonslogikken i manifestet.

**`roles`-claim for tilgangskontroll:** Finnes kun i M2M-tokens (client credentials flow). Irrelevant her siden klientene bruker OBO.
