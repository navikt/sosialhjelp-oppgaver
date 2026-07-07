package no.nav.sosialhjelp.oppgaver

import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain
import no.nav.sosialhjelp.oppgaver.ktor.configureAuth
import no.nav.sosialhjelp.oppgaver.ktor.configureMonitoring
import no.nav.sosialhjelp.oppgaver.ktor.configureRouting
import no.nav.sosialhjelp.oppgaver.ktor.configureSerialization
import no.nav.sosialhjelp.oppgaver.oppgave.OppgaveRepository
import no.nav.sosialhjelp.oppgaver.oppgave.OppgaveService

fun main(args: Array<String>) = EngineMain.main(args)

fun Application.appModule() {
    val config = AppConfig.from(environment.config)
    Database(config.database)
    val oppgaveRepository = OppgaveRepository
    val oppgaveService = OppgaveService(oppgaveRepository)

    if (!config.auth.skipAuth) configureAuth(config.auth)
    configureSerialization()
    configureMonitoring()
    configureRouting(oppgaveService, skipAuth = config.auth.skipAuth)
}
