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
```

## Struktur

```
mise.toml               # rot-nivå task runner
apps/
  backend/              # Kotlin/Spring Boot API
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
| `mise check` | Bygg + test + lint |
| `mise backend:dev` | Start backend lokalt (port 8080) |

## Arkitektur

Se [docs/adr/](docs/adr/) for arkitekturbeslutninger.
