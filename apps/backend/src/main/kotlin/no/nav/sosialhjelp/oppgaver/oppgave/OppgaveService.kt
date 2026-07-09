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
        require(request.tittel.isNotBlank()) { "Tittel kan ikke være tom" }
        require(request.enhet.isNotBlank()) { "Enhet kan ikke være tom" }
        require(request.beskrivelse.isNotBlank()) { "Beskrivelse kan ikke være tom" }
        require(request.personId.isNotBlank()) { "PersonId kan ikke være tom" }

        val now = Instant.now()
        val oppgave =
            Oppgave(
                id = Uuid.random(),
                tittel = request.tittel,
                beskrivelse = request.beskrivelse,
                opprettetAv = navIdent,
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

    fun hentOppgaverForPerson(personId: String): List<Oppgave> {
        require(personId.isNotBlank()) { "PersonId kan ikke være tom" }
        return repository.hentForPersonId(personId)
    }
}
