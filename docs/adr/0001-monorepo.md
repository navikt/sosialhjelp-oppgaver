# ADR-0001: Monorepo

**Dato:** 2026-07-06  
**Status:** Godkjent

## Kontekst

Prosjektet er en POC for å opprette og sende oppgaver fra NKS (Navs kontaktsenter) til Nav-kontor. Løsningen vil bestå av flere komponenter: frontend, backend-API og eventuelt støttetjenester. Vi trenger å bestemme hvordan vi organiserer kodebasen.

## Beslutning

Vi bruker monorepo. Ett Git-repository for alle komponenter i prosjektet.

## Konsekvenser

### Fordeler

- Enklere å holde frontend og backend i sync (f.eks. API-kontrakter, typer)
- Delt CI/CD-konfigurasjon og verktøy på ett sted
- Lettere å gjøre tverrgående endringer atomisk (én PR dekker hele endringen)
- Lavere overhead for en liten POC-fase: ingen koordinering mellom repoer

### Ulemper

- Krever disiplin rundt mappestruktur etter hvert som prosjektet vokser
- CI/CD må konfigureres til å bare bygge og deploye det som faktisk er endret

## Alternativer vurdert

**Polyrepo (ett repo per komponent):** Gir tydeligere eierskap og uavhengig deploy, men øker koordineringskostnaden og kompleksiteten tidlig i en POC-fase.
