package no.nav.sosialhjelp.oppgaver.oppgave

import java.time.Instant
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

@OptIn(ExperimentalUuidApi::class)
class OppgaveService(private val repository: OppgaveRepository) {
    @OptIn(ExperimentalUuidApi::class)
    fun opprettOppgave(
        request: OpprettOppgaveRequest,
        navIdent: String,
    ): Oppgave {
        require(request.enhet.isNotBlank()) { "Enhet kan ikke være tom" }
        require(request.beskrivelse.isNotBlank()) { "Beskrivelse kan ikke være tom" }
        require(request.personId.isNotBlank()) { "PersonId kan ikke være tom" }
        require(
            request.tilordnetRessurs == null || request.tilordnetRessurs.length <= 7,
        ) { "Tilordnet ressurs kan ikke være lengre enn 7 tegn" }
        val now = Instant.now()
        val oppgave =
            NyOppgave(
                id = Uuid.random(),
                tittel = request.tittel,
                beskrivelse = request.beskrivelse,
                opprettetAv = navIdent,
                tilordnetRessurs = request.tilordnetRessurs,
                personId = request.personId,
                enhet = request.enhet,
                status = OppgaveStatus.NY,
                prioritet = request.prioritet,
                opprettetAt = now,
                oppdatertAt = now,
            )
        return repository.lagre(oppgave)
    }

    fun hentOppgaverForEnhet(enhet: String): List<Oppgave> {
        require(enhet.isNotBlank()) { "Enhet kan ikke være tom" }
        return repository.hentForEnhet(enhet)
    }

    fun hentOppgave(id: Uuid): Oppgave = repository.hentEn(id) ?: throw NoSuchElementException("Oppgave $id ikke funnet")

    fun oppdaterStatus(
        id: Uuid,
        status: OppgaveStatus,
    ): Oppgave {
        repository.hentEn(id) ?: throw NoSuchElementException("Oppgave $id ikke funnet")
        return repository.oppdaterStatus(id, status, Instant.now())
            ?: throw NoSuchElementException("Oppgave $id ikke funnet")
    }

    fun sok(request: SokOppgaverRequest): List<Oppgave> {
        require(request.personId != null || request.tilordnetRessurs != null || !request.status.isNullOrEmpty()) {
            "Minst ett søkekriterium er påkrevd"
        }
        return repository.sok(request)
    }
}
