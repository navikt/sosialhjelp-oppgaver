# ADR-0002: Kotlin + Spring Boot backend

**Dato:** 2026-07-06  
**Status:** Godkjent

## Kontekst

Prosjektet trenger et backend-API for å opprette og lagre oppgaver fra NKS til Nav-kontor.
Tjenesten behandler potensielt sensitiv informasjon (kan være fri tekst fra saksbehandler, kan inneholde fnr, navn og saksinformasjon).
To saksbehandlerflater kaller APIet: ett for NKS og ett for Nav-kontor.

## Beslutning

Vi bruker **Kotlin + Spring Boot** som backend-stack, deployet på Nais.

### Byggverktøy

Gradle med `libs.versions.toml` (version catalog) for sentral versjonsstyring av avhengigheter.

### Autentisering

Begge frontender bruker Azure AD + Wonderwall. Når de kaller backenden, gjør de en TokenX-utveksling slik at brukerens identitet er bevart i hele kjeden.

Backenden aktiverer `tokenx.enabled: true` og validerer innkommende TokenX-tokens. Azure AD er ikke aktivert på backenden i POC-fasen, siden tjenesten ikke kaller andre tjenester.

Spring-security brukes for å validere tokens.

### Database

PostgreSQL via Nais (`gcp.sqlInstances`), migrert med Flyway. HikariCP konfigureres med:

```
maximumPoolSize=3
idleTimeout=300000
maxLifetime=1800000
```

### Observabilitet

Spring Boot Actuator med Micrometer (Prometheus-eksponering på `/actuator/prometheus`).
OpenTelemetry Java-agent via Nais for distribuert tracing.
Ingen egendefinerte metrikker i POC-fasen.

Health-endepunkter:
- Liveness: `/actuator/health/liveness`
- Readiness: `/actuator/health/readiness`

### Personvern

Oppgaveinnhold (kan være fri tekst) logges aldri. Kun `taskId` og statusinformasjon er tillatt i logger.

## Konsekvenser

### Fordeler

- Kjent teknologi for teamet — kort tid til første fungerende tjeneste
- Spring Boot Actuator og Micrometer gir observabilitet uten ekstra konfigurasjon
- TokenX bevarer brukerens identitet og gir korrekt revisjonslogg
- `libs.versions.toml` gir ett sted å oppdatere avhengighetsversjoner på tvers av moduler i monorepoet

### Ulemper og risikoer

- Spring Boot har større minnefotavtrykk enn Ktor — akseptabelt for POC
- `accessPolicy.inbound` må fylles inn med de faktiske Nais-appnavnene til frontendene før første deploy

## Alternativer vurdert

**Ktor:** Lavere ressursbruk, men krever mer manuell konfigurasjon av auth og observabilitet. Ikke valgt fordi teamet har mer Spring Boot-erfaring.

**Kafka/Rapids & Rivers for oppgavelevering:** Gir bedre dekoblet arkitektur, men over-engineered for POC. Kan vurderes om polling-løsningen ikke skalerer.
