package no.nav.sosialhjelp.oppgaver.oppgave

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import java.time.Instant
import kotlin.uuid.Uuid

object InstantSerializer : KSerializer<Instant> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)

    override fun serialize(
        encoder: Encoder,
        value: Instant,
    ) = encoder.encodeString(value.toString())

    override fun deserialize(decoder: Decoder): Instant = Instant.parse(decoder.decodeString())
}

@Serializable
enum class OppgaveStatus {
    NY,
    UNDER_BEHANDLING,
    FERDIG,
}

@Serializable
enum class Prioritet {
    HØY,
    NORMAL,
    LAV,
}

@Serializable
data class Oppgave(
    val id: Uuid,
    val tittel: String,
    val beskrivelse: String,
    val opprettetAv: String,
    val personId: String,
    val enhet: String,
    val status: OppgaveStatus,
    val prioritet: Prioritet,
    @Serializable(with = InstantSerializer::class)
    val opprettetAt: Instant,
    @Serializable(with = InstantSerializer::class)
    val oppdatertAt: Instant,
)

@Serializable
data class OpprettOppgaveRequest(
    val tittel: String,
    val beskrivelse: String,
    val enhet: String,
    val personId: String,
    val prioritet: Prioritet = Prioritet.NORMAL,
)

@Serializable
data class OppdaterStatusRequest(
    val status: OppgaveStatus,
)

@Serializable
data class GetOppgaverResponse(
    val personId: String,
)
