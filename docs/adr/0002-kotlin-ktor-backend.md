# ADR-0002: Kotlin + Ktor backend

**Dato:** 2026-07-06  
**Status:** Godkjent

## Kontekst

Prosjektet trenger et backend-API for å opprette og lagre oppgaver fra NKS til Nav-kontor.
Tjenesten behandler potensielt sensitiv informasjon (kan være fri tekst fra saksbehandler, kan inneholde fnr, navn og saksinformasjon).
Ulike klienter kaller APIet med forskjellige tilganger.

## Beslutning

Vi bruker **Kotlin + Ktor** som backend-stack, deployet på Nais.

### Byggverktøy

Gradle med `libs.versions.toml` (version catalog) for sentral versjonsstyring av avhengigheter.
Applikasjonen pakkes som en fat JAR med Shadow-plugin (`shadowJar`-task).

### Autentisering og tilgangskontroll

Entra ID med OBO-flow (on-behalf-of). Se [ADR-0003](0003-autentisering-og-tilgangskontroll.md) for detaljer.

Tokens valideres manuelt med `ktor-server-auth-jwt` ved hjelp av Nais-injiserte env-vars:
- `AZURE_OPENID_CONFIG_JWKS_URI`
- `AZURE_OPENID_CONFIG_ISSUER`
- `AZURE_APP_CLIENT_ID`

### Dependency injection

Ktor sitt innebygde DI-system (`ktor-di`). Ingen eksterne DI-rammeverk.

### Database

PostgreSQL via Nais (`gcp.sqlInstances`), migrert med Flyway. Exposed DSL (`exposed-core`, `exposed-jdbc`, `exposed-java-time`) med HikariCP for databasetilgang. Flyway håndterer alle skjemamigrasjoner — Exposed brukes kun til spørringer, ikke skjemaoppsett (`SchemaUtils` brukes ikke i produksjon).

```
maximumPoolSize=3
idleTimeout=300000
maxLifetime=1800000
```

### Observabilitet

Ktor Micrometer-plugin med Prometheus-eksponering på `/metrics`.
OpenTelemetry Java-agent via Nais for distribuert tracing.
Ingen egendefinerte metrikker i POC-fasen.

Health-endepunkter:
- Liveness: `/isalive`
- Readiness: `/isready`

### Personvern

Oppgaveinnhold (kan være fri tekst) logges aldri. Kun `taskId` og statusinformasjon er tillatt i logger.

## Konsekvenser

### Fordeler

- Lavere minnefotavtrykk enn Spring Boot — relevant for Nais-ressurskvote
- Ktor er eksplisitt og komposerbar — kun det som trengs installeres som plugin
- Innebygd DI (`ktor-di`) eliminerer en ekstern avhengighet
- `ktor-server-auth-jwt` gir full kontroll over JWT-validering uten wrapper-biblioteker
- `libs.versions.toml` gir ett sted å oppdatere avhengighetsversjoner

### Ulemper og risikoer

- Mer manuell konfigurasjon enn Spring Boot — auth, health og metrics må settes opp eksplisitt
- `accessPolicy.inbound` må fylles inn med de faktiske Nais-appnavnene til klientene før første deploy

## Alternativer vurdert

**Spring Boot:** Gir mer autoconfigurasjon (Actuator, Spring Security) og er kjent teknologi for mange. Ikke valgt fordi Ktor gir lavere ressursbruk og mer eksplisitt kontroll, og fordi Spring Boot-autoconfigurasjon skjuler mer enn det hjelper for en liten tjeneste.

**Kafka/Rapids & Rivers for oppgavelevering:** Gir bedre dekoblet arkitektur, men over-engineered for POC. Kan vurderes om polling-løsningen ikke skalerer.
