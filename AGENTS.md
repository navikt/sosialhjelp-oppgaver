# AGENTS.md — sosialhjelp-oppgaver

Tjeneste for å opprette og sende oppgaver fra NKS (Navs kontaktsenter) til Nav-kontor.
Prosjektet er organisert som et monorepo (se [ADR-0001](docs/adr/0001-monorepo.md)).

## Build & Test Commands

Kjør fra rotmappen med `mise`:

```bash
mise build        # bygg backend
mise test         # kjør tester
mise check        # bygg + test + lint (inkl. ktlint)
mise backend:dev  # start backend lokalt (port 8083)
```

> First time: run `gradle wrapper --gradle-version=8.12` inside `apps/backend/` to generate `gradlew` and `gradle-wrapper.jar`.

## Project Structure

```text
mise.toml               # Root task runner
apps/
  backend/              # Kotlin/Ktor API
    gradle/
      libs.versions.toml  # Central dependency version catalog
      wrapper/
    gradlew
    build.gradle.kts
    settings.gradle.kts
    Dockerfile
    .nais/
      app.yaml
      app-dev.yaml
    src/main/kotlin/no/nav/sosialhjelp/oppgaver/
      Application.kt    # Entrypoint (EngineMain)
      Config.kt         # AppConfig, AuthConfig, DatabaseConfig
      Database.kt       # HikariCP + Flyway + Exposed init
      ktor/
        Auth.kt         # JWT-validering, hasScope()
        Plugins.kt      # Serialisering, metrikker
        Routing.kt      # Health-endepunkter, StatusPages
      oppgave/
        Oppgave.kt      # Domenemodell, DTOs, InstantSerializer
        OppgaveRepository.kt
        OppgaveRouting.kt
        OppgaveService.kt
    src/main/resources/
      application.conf  # HOCON-konfig med lokale standardverdier
      logback.xml
      db/migration/
        V1__oppgave.sql
docs/
  adr/                  # Architecture Decision Records
.github/
  workflows/            # CI/CD (build-and-deploy.yaml)
```

## Backend — teknisk oversikt

- **Rammeverk**: Ktor med `EngineMain`, konfig fra `application.conf` (HOCON)
- **Serialisering**: kotlinx-serialization (ikke Jackson)
- **Database**: Exposed DSL + HikariCP + Flyway, PostgreSQL
- **Auth**: Entra ID OBO-flow, manuell JWT-validering med `ktor-server-auth-jwt`
- **Tilgangskontroll**: `scp`-claim på rutenivå (se [ADR-0003](docs/adr/0003-autentisering-og-tilgangskontroll.md))
- **Linting**: ktlint som Gradle-plugin
- **Nais**: app `sosialhjelp-oppgaver-api`, team `teamdigisos`

## Lokalt oppsett

Krav:
- Postgres på `localhost:54323` (docker-compose, separat)
- `mock-oauth2-server` på `localhost:8888` (docker-compose, separat)

Start backend:
```bash
mise backend:dev
# tilgjengelig på http://localhost:8083
```

## API

| Metode | Sti | Scope |
|---|---|---|
| `POST` | `/api/oppgaver` | `nks` |
| `GET` | `/api/oppgaver?enhet=<enhet>` | `navkontor` |
| `GET` | `/api/oppgaver/{id}` | `navkontor` |
| `PATCH` | `/api/oppgaver/{id}` | `navkontor` |

## Code Style

### Minimal Editing

When fixing a bug or implementing a feature, change only what is necessary.
Do not rename variables, restructure working code, or refactor beyond the task at hand.
Keep diffs small and focused so they are easy to review.

## Git Workflow

- Feature-brancher fra `main`, navn på formen `feat/kort-beskrivelse`
- Squash-merge til `main` via pull request
- Direktepush til `main` er ikke tillatt

## Boundaries

### ✅ Always

- Run tests after changes (`mise check`)
- Follow existing code patterns in the project
- Preserve existing code structure — do not reorganize or refactor beyond the task
- Validate all external input
- Never log `beskrivelse` or other oppgave content — only `id` and status

### ⚠️ Ask First

- Changing authentication mechanisms
- Adding new dependencies
- Modifying database schema

### 🚫 Never

- Commit secrets or credentials
- Skip input validation on external boundaries
- Log oppgave content (beskrivelse, tittel) — can contain PII
