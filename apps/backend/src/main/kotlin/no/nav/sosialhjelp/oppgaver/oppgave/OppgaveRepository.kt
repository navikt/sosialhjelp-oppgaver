package no.nav.sosialhjelp.oppgaver.oppgave

import no.nav.sosialhjelp.oppgaver.Database
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.update
import org.jetbrains.exposed.v1.javatime.timestamp
import java.time.Instant
import kotlin.uuid.Uuid

object OppgaveTable : Table("oppgave") {
    val id = uuid("id")
    val tittel = varchar("tittel", 500)
    val beskrivelse = text("beskrivelse")
    val opprettetAv = varchar("opprettet_av", 20)
    val enhet = varchar("enhet", 10)
    val status = enumerationByName<OppgaveStatus>("status", 20)
    val opprettetAt = timestamp("opprettet_at")
    val oppdatertAt = timestamp("oppdatert_at")

    override val primaryKey = PrimaryKey(id)
}

class OppgaveRepository(private val database: Database) {

    fun lagre(oppgave: Oppgave): Oppgave = transaction {
        OppgaveTable.insert {
            it[id] = oppgave.id
            it[tittel] = oppgave.tittel
            it[beskrivelse] = oppgave.beskrivelse
            it[opprettetAv] = oppgave.opprettetAv
            it[enhet] = oppgave.enhet
            it[status] = oppgave.status
            it[opprettetAt] = oppgave.opprettetAt
            it[oppdatertAt] = oppgave.oppdatertAt
        }
        oppgave
    }

    fun hentForEnhet(enhet: String): List<Oppgave> = transaction {
        OppgaveTable
            .selectAll()
            .where { OppgaveTable.enhet eq enhet }
            .map { it.toOppgave() }
    }

    fun hentEn(id: Uuid): Oppgave? = transaction {
        OppgaveTable
            .selectAll()
            .where { OppgaveTable.id eq id }
            .singleOrNull()
            ?.toOppgave()
    }

    fun oppdaterStatus(id: Uuid, status: OppgaveStatus, oppdatertAt: Instant): Oppgave? = transaction {
        OppgaveTable.update({ OppgaveTable.id eq id }) {
            it[OppgaveTable.status] = status
            it[OppgaveTable.oppdatertAt] = oppdatertAt
        }
        hentEn(id)
    }

    private fun ResultRow.toOppgave() = Oppgave(
        id = this[OppgaveTable.id],
        tittel = this[OppgaveTable.tittel],
        beskrivelse = this[OppgaveTable.beskrivelse],
        opprettetAv = this[OppgaveTable.opprettetAv],
        enhet = this[OppgaveTable.enhet],
        status = this[OppgaveTable.status],
        opprettetAt = this[OppgaveTable.opprettetAt],
        oppdatertAt = this[OppgaveTable.oppdatertAt],
    )
}
