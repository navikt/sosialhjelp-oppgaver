@file:OptIn(ExperimentalUuidApi::class)

package no.nav.sosialhjelp.oppgaver.oppgave

import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.core.and
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.core.inList
import org.jetbrains.exposed.v1.javatime.timestamp
import org.jetbrains.exposed.v1.jdbc.insertReturning
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.jetbrains.exposed.v1.jdbc.update
import java.time.Instant
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

object OppgaveTable : Table("oppgave") {
    val id = uuid("id")
    val referanse = long("referanse")
    val tittel = varchar("tittel", 500).nullable()
    val beskrivelse = text("beskrivelse")
    val opprettetAv = varchar("opprettet_av", 20)
    val tilordnetRessurs = varchar("tilordnet_ressurs", 7).nullable()
    val personId = varchar("person_id", 11)
    val enhet = varchar("enhet", 10)
    val status = enumerationByName<OppgaveStatus>("status", 20)
    val prioritet = enumerationByName<Prioritet>("prioritet", 10)
    val opprettetAt = timestamp("opprettet_at")
    val oppdatertAt = timestamp("oppdatert_at")

    override val primaryKey = PrimaryKey(id)
}

data class NyOppgave(
    val id: Uuid,
    val tittel: String?,
    val beskrivelse: String,
    val opprettetAv: String,
    val tilordnetRessurs: String?,
    val personId: String,
    val enhet: String,
    val status: OppgaveStatus,
    val prioritet: Prioritet,
    val opprettetAt: Instant,
    val oppdatertAt: Instant,
)

object OppgaveRepository {
    fun lagre(oppgave: NyOppgave): Oppgave =
        transaction {
            OppgaveTable.insertReturning {
                it[id] = oppgave.id
                it[tittel] = oppgave.tittel
                it[beskrivelse] = oppgave.beskrivelse
                it[opprettetAv] = oppgave.opprettetAv
                it[tilordnetRessurs] = oppgave.tilordnetRessurs
                it[personId] = oppgave.personId
                it[enhet] = oppgave.enhet
                it[status] = oppgave.status
                it[prioritet] = oppgave.prioritet
                it[opprettetAt] = oppgave.opprettetAt
                it[oppdatertAt] = oppgave.oppdatertAt
            }.single().toOppgave()
        }

    fun hentForEnhet(enhet: String): List<Oppgave> =
        transaction {
            OppgaveTable
                .selectAll()
                .where { OppgaveTable.enhet eq enhet }
                .map { it.toOppgave() }
        }

    fun sok(request: SokOppgaverRequest): List<Oppgave> =
        transaction {
            OppgaveTable
                .selectAll()
                .where {
                    listOfNotNull(
                        request.personId?.let { OppgaveTable.personId eq it },
                        request.tilordnetRessurs?.let { OppgaveTable.tilordnetRessurs eq it },
                        request.status?.takeIf { it.isNotEmpty() }?.let { OppgaveTable.status inList it },
                    ).reduce { predicate, next -> predicate and next }
                }
                .map { it.toOppgave() }
        }

    fun hentEn(id: Uuid): Oppgave? =
        transaction {
            OppgaveTable
                .selectAll()
                .where { OppgaveTable.id eq id }
                .singleOrNull()
                ?.toOppgave()
        }

    fun oppdaterStatus(
        id: Uuid,
        status: OppgaveStatus,
        oppdatertAt: Instant,
    ): Oppgave? =
        transaction {
            OppgaveTable.update({ OppgaveTable.id eq id }) {
                it[OppgaveTable.status] = status
                it[OppgaveTable.oppdatertAt] = oppdatertAt
            }
            hentEn(id)
        }

    private fun ResultRow.toOppgave() =
        Oppgave(
            id = this[OppgaveTable.id],
            referanse = this[OppgaveTable.referanse],
            tittel = this[OppgaveTable.tittel],
            beskrivelse = this[OppgaveTable.beskrivelse],
            opprettetAv = this[OppgaveTable.opprettetAv],
            tilordnetRessurs = this[OppgaveTable.tilordnetRessurs],
            personId = this[OppgaveTable.personId],
            enhet = this[OppgaveTable.enhet],
            status = this[OppgaveTable.status],
            prioritet = this[OppgaveTable.prioritet],
            opprettetAt = this[OppgaveTable.opprettetAt],
            oppdatertAt = this[OppgaveTable.oppdatertAt],
        )
}
