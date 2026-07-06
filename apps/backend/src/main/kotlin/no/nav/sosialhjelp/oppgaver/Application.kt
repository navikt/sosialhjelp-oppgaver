package no.nav.sosialhjelp.oppgaver

import io.ktor.server.application.*
import io.ktor.server.netty.*
import no.nav.sosialhjelp.oppgaver.ktor.configureAuth
import no.nav.sosialhjelp.oppgaver.ktor.configureMonitoring
import no.nav.sosialhjelp.oppgaver.ktor.configureRouting
import no.nav.sosialhjelp.oppgaver.ktor.configureSerialization
import no.nav.sosialhjelp.oppgaver.oppgave.OppgaveRepository
import no.nav.sosialhjelp.oppgaver.oppgave.OppgaveService

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.appModule() {
    val config = AppConfig.from(environment.config)
    val database = Database(config.database)
    val oppgaveRepository = OppgaveRepository(database)
    val oppgaveService = OppgaveService(oppgaveRepository)

    configureAuth(config.auth)
    configureSerialization()
    configureMonitoring()
    configureRouting(oppgaveService)
}
