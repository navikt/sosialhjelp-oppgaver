# AGENTS.md — sosialhjelp-oppgaver

Tjeneste for å opprette og sende oppgaver fra NKS (Navs kontaktsenter) til Nav-kontor.
Prosjektet er organisert som et monorepo (se [ADR-0001](docs/adr/0001-monorepo.md)).

## Build & Test Commands

```bash
# TODO: legg til build- og testkommandoer når stack er valgt
```

## Project Structure

```text
docs/
  adr/          # Architecture Decision Records
```

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

- Run tests after changes
- Follow existing code patterns in the project
- Preserve existing code structure — do not reorganize or refactor beyond the task
- Validate all external input

### ⚠️ Ask First

- Changing authentication mechanisms
- Adding new dependencies
- Modifying database schema

### 🚫 Never

- Commit secrets or credentials
- Skip input validation on external boundaries
