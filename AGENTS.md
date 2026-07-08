# AGENTS.md — sosialhjelp-oppgaver

Tjeneste for å opprette og sende oppgaver fra NKS (Navs kontaktsenter) til Nav-kontor.
Prosjektet er organisert som et monorepo (se [ADR-0001](docs/adr/0001-monorepo.md)).

## Build & Test Commands

Kjør fra rotmappen med `mise`:

```bash
mise check            # bygg + test + lint backend og frontend
mise test             # kjør tester for backend og frontend
mise backend:build    # bygg backend
mise backend:test     # kjør backend-tester
mise backend:check    # bygg + test + lint backend (inkl. ktlint)
mise frontend:check   # bygg + typecheck + lint + fmt:check + test frontend
mise frontend:test    # kjør frontend-tester (Vitest)
mise backend:dev      # start backend lokalt (port 8083)
mise frontend:dev     # start frontend lokalt (port 3003)
mise dev              # start backend og frontend lokalt
```

> First time: run `gradle wrapper --gradle-version=8.12` inside `apps/backend/` to generate `gradlew` and `gradle-wrapper.jar`.

> Frontend krever `NODE_AUTH_TOKEN` med `read:packages`-tilgang til GitHub npm registry for å installere `@navikt`-pakker.

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
  frontend/             # Next.js 16 — NKS og Nav-kontor UI
    src/
      proxy.ts          # Next.js proxy (renamed from middleware in Next 16)
      lib/
        auth.ts         # Re-eksport av @navikt/oasis (getToken, validateAzureToken)
        api.ts          # fetchOppgaver, createOppgave — OBO-exchange via oasis
      app/
        layout.tsx      # Root layout (Aksel Provider)
        page.tsx        # Redirect til /nks
        nks/
          page.tsx      # NKS-skjema (opprett oppgave)
        navkontor/
          page.tsx      # Nav-kontor oppgaveliste
        ingen-tilgang/
          page.tsx      # Feil-side
      components/
        Header.tsx    # Navigasjon mellom /nks og /navkontor
        OppgaveForm.tsx # React Hook Form skjema (client component)
        OppgaveListe.tsx # Aksel Table (server component)
    Dockerfile
    .nais/
      app.yaml
      app-dev.yaml
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

## Frontend — teknisk oversikt

- **Rammeverk**: Next.js 16, App Router, React Server Components
- **Auth**: `@navikt/oasis` — `getToken` henter token fra Wonderwall-injisert header, `validateAzureToken` validerer mot Azure AD JWKS i server components
- **OBO-exchange**: `requestAzureOboToken` fra oasis bytter Wonderwall-token mot backend-token før API-kall. Caches automatisk av oasis.
- **UI**: `@navikt/ds-react` (Aksel) + Tailwind CSS v4
- **Linting/formatering**: oxlint + oxfmt
- **Testing**: Vitest + Testing Library
- **Nais**: app `sosialhjelp-oppgaver-frontend`, team `teamdigisos`, Wonderwall aktivert

### Auth-flyt (frontend)

```
Bruker → Wonderwall (OIDC) → Next.js server component
                                  └─ getToken(headers)          # hent token fra header
                                  └─ validateAzureToken(token)  # valider signatur mot JWKS
                                  └─ requestAzureOboToken(...)  # bytt til backend-token
                                  └─ fetch(backend, Bearer oboToken)
```

Merk: Auth-sjekk gjøres i server components, **ikke** i `proxy.ts` — se Next.js Data Security guide.

### Midlertidighet

NKS-fronten (`/nks`) er eksplisitt midlertidig og vil erstattes av en Salesforce-plugin.
Nav-kontor-løsningen (`/navkontor`) er fortsatt uavklart.
Se [ADR-0004](docs/adr/0004-nextjs-frontend.md) for begrunnelse.

## Lokalt oppsett

Krav:
- Postgres på `localhost:54323` (docker-compose, separat)
- `mock-oauth2-server` på `localhost:8888` (docker-compose, separat)
- Wonderwall (eller tilsvarende) som injiserer `Authorization`-header på innkommende requests

Start backend:
```bash
mise backend:dev
# tilgjengelig på http://localhost:8083
```

Start frontend:
```bash
mise frontend:dev
# tilgjengelig på http://localhost:3000
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

- Run tests after changes (`mise check` / `mise frontend:check`)
- Follow existing code patterns in the project
- Preserve existing code structure — do not reorganize or refactor beyond the task
- Validate all external input
- Never log `beskrivelse` or other oppgave content — only `id` and status
- Put auth checks in server components, not in `proxy.ts`

### ⚠️ Ask First

- Changing authentication mechanisms
- Adding new dependencies
- Modifying database schema

### 🚫 Never

- Commit secrets or credentials
- Skip input validation on external boundaries
- Log oppgave content (beskrivelse, tittel) — can contain PII
