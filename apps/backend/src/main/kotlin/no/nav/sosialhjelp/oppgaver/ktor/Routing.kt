package no.nav.sosialhjelp.oppgaver.ktor

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.install
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import no.nav.sosialhjelp.oppgaver.oppgave.OppgaveService
import no.nav.sosialhjelp.oppgaver.oppgave.oppgaveRoutes

fun Application.configureRouting(
    oppgaveService: OppgaveService,
    skipAuth: Boolean = false,
) {
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, mapOf("melding" to (cause.message ?: "Ugyldig forespørsel")))
        }
        exception<NoSuchElementException> { call, _ ->
            call.respond(HttpStatusCode.NotFound, mapOf("melding" to "Ikke funnet"))
        }
        exception<ForbiddenException> { call, _ ->
            call.respond(HttpStatusCode.Forbidden, mapOf("melding" to "Ingen tilgang"))
        }
    }

    routing {
        get("/isalive") { call.respond(HttpStatusCode.OK, "OK") }
        get("/isready") { call.respond(HttpStatusCode.OK, "OK") }

        if (skipAuth) {
            oppgaveRoutes(oppgaveService, skipAuth = true)
        } else {
            authenticate(AUTH_ENTRA_ID) {
                oppgaveRoutes(oppgaveService)
            }
        }
    }
}

class ForbiddenException : RuntimeException()

fun ApplicationCall.requireScope(scope: String) {
    val principal = principal<JWTPrincipal>() ?: throw ForbiddenException()
    if (!principal.hasScope(scope)) throw ForbiddenException()
}
