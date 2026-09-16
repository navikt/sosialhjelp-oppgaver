package no.nav.sosialhjelp.oppgaver.oppgave

import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkObject
import io.mockk.verify
import kotlin.test.AfterTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class OppgaveServiceTest {
    private val service = OppgaveService(OppgaveRepository)

    @AfterTest
    fun tearDown() = unmockkObject(OppgaveRepository)

    @Test
    fun `oppretter oppgave uten tittel`() {
        mockkObject(OppgaveRepository)
        every { OppgaveRepository.lagre(any()) } answers { firstArg<NyOppgave>().toOppgave() }

        val oppgave = service.opprettOppgave(request(), "Z123456")

        assertEquals(null, oppgave.tittel)
        assertEquals(OppgaveStatus.NY, oppgave.status)
        verify { OppgaveRepository.lagre(any()) }
    }

    @Test
    fun `avviser sok uten kriterier`() {
        assertFailsWith<IllegalArgumentException> { service.sok(SokOppgaverRequest()) }
        assertFailsWith<IllegalArgumentException> { service.sok(SokOppgaverRequest(status = emptyList())) }
    }

    private fun request() =
        OpprettOppgaveRequest(
            beskrivelse = "Beskrivelse",
            enhet = "1234",
            personId = "12345678901",
        )

    private fun NyOppgave.toOppgave() =
        Oppgave(
            id = id,
            referanse = 1,
            tittel = tittel,
            beskrivelse = beskrivelse,
            opprettetAv = opprettetAv,
            tilordnetRessurs = tilordnetRessurs,
            personId = personId,
            enhet = enhet,
            status = status,
            prioritet = prioritet,
            opprettetAt = opprettetAt,
            oppdatertAt = oppdatertAt,
        )
}
