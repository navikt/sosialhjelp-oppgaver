# sosialhjelp-oppgaver

Tjeneste for å opprette og sende oppgaver fra NKS (Navs kontaktsenter) til Nav-kontor.

## Komme i gang

Installer [mise](https://mise.jdx.dev) hvis du ikke har det:

```bash
curl https://mise.run | sh
```

Bygg og test:

```bash
mise build
mise test
```

Start lokalt:

```bash
mise backend:dev   # backend på http://localhost:8083
mise frontend:dev  # frontend på http://localhost:3000
```

## Struktur

```
mise.toml               # rot-nivå task runner
apps/
  backend/              # Kotlin/Ktor API (port 8083 lokalt)
  frontend/             # Next.js 16 (port 3000 lokalt)
docs/
  adr/                  # Architecture Decision Records
.github/
  workflows/            # CI/CD
```

## Utvikling

Alle kommandoer kjøres fra rotmappen:

| Kommando | Beskrivelse |
|---|---|
| `mise build` | Bygg backend |
| `mise test` | Kjør tester |
| `mise check` | Bygg + test + lint backend (ktlint) |
| `mise backend:dev` | Start backend lokalt (port 8083) |
| `mise frontend:dev` | Start frontend lokalt (port 3000) |
| `mise frontend:check` | Bygg + typecheck + lint + fmt:check + test frontend |

## Lokale avhengigheter

| Tjeneste | Port | Formål |
|---|---|---|
| PostgreSQL | 54323 | Database |
| mock-oauth2-server | 8888 | Lokal JWT-utsteder |
| Wonderwall | — | Injiserer `Authorization`-header på innkommende requests |

Frontend forutsetter at Wonderwall (eller tilsvarende) injiserer `Authorization: Bearer <token>` på innkommende requests. Token valideres mot Azure AD JWKS i server components via `@navikt/oasis`.

Frontend krever `NODE_AUTH_TOKEN` med `read:packages`-tilgang til GitHub npm registry for å installere `@navikt`-pakker:

```
//npm.pkg.github.com/:_authToken=<token>
@navikt:registry=https://npm.pkg.github.com
```

## API

| Metode | Sti | Scope |
|---|---|---|
| `POST` | `/api/oppgaver` | `nks` |
| `GET` | `/api/oppgaver?enhet=<enhet>` | `navkontor` |
| `GET` | `/api/oppgaver/{id}` | `navkontor` |
| `PATCH` | `/api/oppgaver/{id}` | `navkontor` |

## Arkitektur

Se [docs/adr/](docs/adr/) for arkitekturbeslutninger.

| ADR | Beslutning |
|---|---|
| [ADR-0001](docs/adr/0001-monorepo.md) | Monorepo med `mise` som task runner |
| [ADR-0002](docs/adr/0002-kotlin-ktor-backend.md) | Kotlin + Ktor backend |
| [ADR-0003](docs/adr/0003-autentisering-og-tilgangskontroll.md) | Entra ID OBO-flow, `scp`-basert tilgangskontroll |
| [ADR-0004](docs/adr/0004-nextjs-frontend.md) | Next.js 16 frontend (midlertidig, én app for begge brukergrupper) |
