# ADR-0004: Next.js frontend

**Dato:** 2026-07-06  
**Status:** Godkjent

## Kontekst

To brukergrupper trenger et grensesnitt mot backend-API:

- **NKS-saksbehandlere** — oppretter oppgaver til Nav-kontor (scope: `nks`)
- **Nav-kontor-ansatte** — behandler og oppdaterer oppgaver (scope: `navkontor`)

**NKS-fronten er eksplisitt midlertidig.** NKS bruker Salesforce som sitt primære arbeidsverktøy, og endelig løsning vil være en Salesforce-plugin. Fronten som lages nå er utelukkende et utviklingsverktøy for POC-perioden — den forventes å kastes når Salesforce-integrasjonen er klar.

Nav-kontor-løsningen er fortsatt uavklart. Den kan ende opp som en standalone-applikasjon, som del av et eksisterende Nav-verktøy, eller som noe annet. Det er for tidlig å binde seg til en langsiktig arkitektur.

## Beslutning

Vi lager **én felles Next.js 16-app** for begge brukergrupper, deployet på Nais.

Dette er et bevisst pragmatisk valg for POC-fasen — ikke den ideelle langsiktige arkitekturen. Én app minimerer operasjonell overhead (én deployment, én Nais-konfig, delt kode) i en periode der begge frontends har kort forventet levetid og stor usikkerhet.

### Appstruktur

Rute-basert separasjon mellom brukergruppene:

```
/nks/*          → NKS-saksbehandlere (midlertidig, erstattes av Salesforce-plugin)
/navkontor/*    → Nav-kontor-ansatte
```

Next.js middleware sjekker scope-claim fra JWT og redirecter til feil-side ved manglende tilgang.

### Autentisering

Wonderwall-sidecar håndterer OIDC-flyten mot Entra ID. Appen implementerer ikke auth selv — Wonderwall injiserer `Authorization`-headeren på innkommende requests. Next.js middleware leser JWT-claims for rute-basert tilgangskontroll.

### Teknologivalg

| Valg | Beslutning |
|---|---|
| Rammeverk | Next.js, App Router |
| Rendering | React Server Components; API-kall fra server components |
| UI | `@navikt/ds-react` (Aksel) + Tailwind CSS |
| Språk | TypeScript, `strict: true` |
| Testing | Vitest + Testing Library |
| Pakkebehandler | pnpm |
| Deploy | Node-container på Nais |

### Observabilitet

Health-endepunkter:
- Liveness: `/isalive`
- Readiness: `/isready`

### Personvern

Oppgaveinnhold (tittel, beskrivelse) logges aldri — kan inneholde PII. Samme prinsipp som backend (se ADR-0002).

## Konsekvenser

### Fordeler

- Én deployment og én Nais-konfig — lavt overhead for en POC
- Delt kode for felles UI-elementer (f.eks. oppgavekort, statusindikatorer)
- Enklere å holde i sync med backend-API under iterasjon
- Wonderwall eliminerer behovet for egenimplementert auth i frontend

### Ulemper og risikoer

- Middleware-basert tilgangskontroll krever at JWT-claims er korrekt mappet til ruter
- Begge brukergrupper er avhengige av samme deploy-syklus
- Når NKS-fronten kastes, gjenstår en app med `navkontor`-delen — må vurderes om den skal beholdes som standalone eller migreres

### Forventet levetid

NKS-delen (`/nks/*`) har begrenset levetid og skal fjernes når Salesforce-plugin er på plass. Nav-kontor-delen (`/navkontor/*`) har uavklart fremtid. Hele frontend-appen bør revurderes arkitektonisk når POC-fasen er over.

## Alternativer vurdert

**To separate Next.js-apper (`apps/frontend-nks/` og `apps/frontend-navkontor/`):** Mer korrekt langsiktig arkitektur med tydelig deploy-grense og uavhengig scope per app. Ikke valgt fordi NKS-fronten uansett kastes — overhead med to apper er ikke forsvart når én av dem er eksplisitt midlertidig.
