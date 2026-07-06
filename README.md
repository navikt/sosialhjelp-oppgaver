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

Start backend lokalt:

```bash
mise backend:dev
# tilgjengelig på http://localhost:8083
```

## Struktur

```
mise.toml               # rot-nivå task runner
apps/
  backend/              # Kotlin/Ktor API (port 8083 lokalt)
  frontend-nks/         # fremtidig — NKS-flate
  frontend-navkontor/   # fremtidig — Nav-kontor-flate
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
| `mise check` | Bygg + test + lint (ktlint) |
| `mise backend:dev` | Start backend lokalt (port 8083) |

## Lokale avhengigheter

| Tjeneste | Port  | Formål |
|---|-------|---|
| PostgreSQL | 54323 | Database |
| mock-oauth2-server | 8888  | Lokal JWT-utsteder |

## API

| Metode | Sti | Scope |
|---|---|---|
| `POST` | `/api/oppgaver` | `nks` |
| `GET` | `/api/oppgaver?enhet=<enhet>` | `navkontor` |
| `GET` | `/api/oppgaver/{id}` | `navkontor` |
| `PATCH` | `/api/oppgaver/{id}` | `navkontor` |

## Arkitektur

Se [docs/adr/](docs/adr/) for arkitekturbeslutninger.
