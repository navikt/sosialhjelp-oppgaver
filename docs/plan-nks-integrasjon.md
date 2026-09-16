# Plan: NKS-integrasjon

NKS-veiledere i Salesforce (`crm-nks-base`) oppretter i dag alle oppgaver via NAVs felles
oppgave-API, som Gosys leser fra. Oppgaver på tema sosialhjelp (temakode `KOM`) skal i stedet gå
til `sosialhjelp-oppgaver-api`. Salesforce når oss via `saas-to-nav-api`-gatewayen.

Denne planen dekker kun endringene i dette repoet.

## Forutsetninger fra Salesforce-siden

- `NavTask__c.INT_External_Reference__c` er et Number-felt og brukes som upsert-nøkkel i
  `CRM_OppgaveSyncController.cls:204`. UUID kan ikke lagres der.
- `NavTask__c.NKS_Assignee__c` er Text(7), NAV-ident.
- Synk spør på veileder-akse: `tilordnetRessurs` + `statuskategori`
  (`NKS_NavTaskSyncCtrl.cls:10-12`). Dagens `/sok` tar kun `personId`.
- Prioritet sendes som `HOY`/`NORM`/`LAV`.

## Beslutninger

| # | Beslutning | Begrunnelse |
|---|---|---|
| 1 | Ny `referanse BIGINT` ved siden av UUID-PK | Salesforce trenger numerisk id; UUID beholdes som intern PK |
| 2 | `Prioritet` omdøpes til `HOY`/`NORM`/`LAV` | Matcher Salesforce direkte. `HØY` er non-ASCII i JSON-enum |
| 3 | `flyway.clean()` fjernes | Sletter databasen ved hver oppstart |

## Steg 1 — Fjern `flyway.clean()`

`src/main/kotlin/no/nav/sosialhjelp/oppgaver/Database.kt:27-37`

Koden kjører `.cleanDisabled(false)` og `flyway.clean()` før `migrate()`. Med `replicas: min 2,
max 2` kapper podene databasen for hverandre ved oppstart.

Fjern `.cleanDisabled(false)` og `flyway.clean()`. Behold `.lockRetryCount(10)`.

Dette er en selvstendig feil og kan fikses uavhengig av resten.

## Steg 2 — `V2__nks_integrasjon.sql`

```sql
ALTER TABLE oppgave ADD COLUMN referanse BIGINT GENERATED ALWAYS AS IDENTITY;
ALTER TABLE oppgave ADD CONSTRAINT oppgave_referanse_key UNIQUE (referanse);

ALTER TABLE oppgave ADD COLUMN tilordnet_ressurs VARCHAR(7);
CREATE INDEX oppgave_tilordnet_ressurs_idx ON oppgave (tilordnet_ressurs);

ALTER TABLE oppgave ALTER COLUMN tittel DROP NOT NULL;
```

## Steg 3 — `V3__prioritet_koder.sql`

```sql
UPDATE oppgave SET prioritet = 'HOY'  WHERE prioritet = 'HØY';
UPDATE oppgave SET prioritet = 'NORM' WHERE prioritet = 'NORMAL';
ALTER TABLE oppgave ALTER COLUMN prioritet SET DEFAULT 'NORM';
```

## Steg 4 — `oppgave/Oppgave.kt`

```kotlin
@Serializable
enum class Prioritet { HOY, NORM, LAV }

@Serializable
data class Oppgave(
    val id: Uuid,
    val referanse: Long,
    val tittel: String?,
    val beskrivelse: String,
    val opprettetAv: String,
    val tilordnetRessurs: String?,
    val personId: String,
    val enhet: String,
    val status: OppgaveStatus,
    val prioritet: Prioritet,
    @Serializable(with = InstantSerializer::class) val opprettetAt: Instant,
    @Serializable(with = InstantSerializer::class) val oppdatertAt: Instant,
)

@Serializable
data class OpprettOppgaveRequest(
    val beskrivelse: String,
    val enhet: String,
    val personId: String,
    val tittel: String? = null,
    val tilordnetRessurs: String? = null,
    val prioritet: Prioritet = Prioritet.NORM,
)

@Serializable
data class SokOppgaverRequest(
    val personId: String? = null,
    val tilordnetRessurs: String? = null,
    val status: List<OppgaveStatus>? = null,
)
```

`SokOppgaverRequest` erstatter `GetOppgaverResponse`, som var feilnavngitt — den er en request.

## Steg 5 — `oppgave/OppgaveRepository.kt`

- `OppgaveTable`: legg til `referanse = long("referanse")`,
  `tilordnetRessurs = varchar("tilordnet_ressurs", 7).nullable()`. Gjør `tittel` nullable.
- `lagre()` må lese tilbake DB-generert `referanse`. Bruk `insertReturning` — `GENERATED ALWAYS AS
  IDENTITY` kan ikke settes fra klienten.
- Erstatt `hentForPersonId` med `sok(request: SokOppgaverRequest)` som bygger predikater betinget.
- Oppdater `toOppgave()`-mapperen.

## Steg 6 — `oppgave/OppgaveService.kt`

- Fjern `require(request.tittel.isNotBlank())` (linje 14).
- Send `tilordnetRessurs` videre til repository.
- `hentOppgaverForPerson` → `sok(request)`. Kast `IllegalArgumentException` hvis alle felt er null,
  ellers returneres hele tabellen.
- Behold validering av `beskrivelse`, `enhet` og `personId`.

## Steg 7 — `oppgave/OppgaveRouting.kt`

- Trekk ut duplisert `navIdent`-oppslag (linje 25-32 og 40-47) til én hjelpefunksjon.
- `POST /api/oppgaver/sok`: ta imot `SokOppgaverRequest`. Svar `OK`, ikke `Created` (linje 50).

## Steg 8 — `.nais/app.yaml`

```yaml
spec:
  env:
    - name: PORT
      value: "8080"
  accessPolicy:
    inbound:
      rules:
        - application: sosialhjelp-oppgaver
          permissions:
            scopes: [nks, navkontor]
        - application: <saas-to-nav-api>
          namespace: <gateway-namespace>
          permissions:
            scopes: [nks]
```

`PORT` mangler i dag: manifestet sier `port: 8080`, mens appen defaulter til 8083.

Gatewayruten på `saas-to-nav-api` bestilles separat og eies av et annet team.

## Steg 9 — Frontend

Enum-omdøpingen treffer fire filer:

| Fil | Endring |
|---|---|
| `src/components/OppgaveForm.tsx:70-71` | `value="HØY"` → `"HOY"`, `defaultValue="NORMAL"` → `"NORM"` |
| `src/components/OppgaveListe.tsx:36-43` | `PrioritetTag`-nøkler `HØY`/`NORMAL` → `HOY`/`NORM`. Visningstekst «Høy»/«Normal» beholdes |
| `src/app/nks/actions.ts:14-19` | `tittel` er nå valgfri |
| `src/components/NksOppgaveListe.tsx:24-25` | `/sok`-body mot `SokOppgaverRequest` |

Regenerer `src/api/types/openapi.ts`. `/sok` mangler i committet spec i dag.

## Steg 10 — Tester

Dette blir de første backend-testene i repoet. Avhengighetene finnes allerede i
`build.gradle.kts:51-56`: testcontainers, MockK, mock-oauth2-server, ktor-server-test-host.

- `POST` gir 201, setter `referanse`, `status = NY`, og godtar request uten `tittel`.
- `/sok`: på `personId`, på `tilordnetRessurs`, på `status`, kombinert, og alle felt null → 400.
- Manglende `nks`-scope gir 403. Feil audience gir 401.
- `beskrivelse` og `tittel` havner aldri i logg (`AGENTS.md:178-191`).
- `V2` og `V3` kjører rent mot tom database.

## Steg 11 — Verifiser

```bash
mise check
```

## Rekkefølge

Steg 1 er uavhengig og haster mest. Steg 2-7 henger sammen og bør gjøres samlet. Steg 9 følger
steg 4. Steg 8 kan gjøres når som helst, men gatewayruten er kritisk sti mot faktisk integrasjon.

## Åpne punkter

- Gateway-app og namespace i steg 8 er ikke kjent.
- Statusmapping er ikke avklart. Vi har `NY`/`UNDER_BEHANDLING`/`FERDIG`, mens Salesforce har
  `OppgaveStatuskategori` med `AAPEN`/`AAPNET`/`AVSLUTTET`/`OPPRETTET`/`UNDER_BEHANDLING`/
  `FERDIGSTILT`/`FEILREGISTRERT`. `NavTask__c.NKS_Status__c` er en restricted picklist som kun tar
  `OPPRETTET`/`AAPNET`/`UNDER_BEHANDLING`/`FERDIGSTILT`/`FEILREGISTRERT`. Noen må eie mappingen.
- `enhet` er `VARCHAR(10)`, mens NAV-enhetsnummer er fire siffer. Ingen validering i dag.
