package no.nav.sosialhjelp.oppgaver.ktor

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.nav.sosialhjelp.oppgaver.oppgave.OppgaveService
import no.nav.sosialhjelp.oppgaver.oppgave.oppgaveRoutes

fun Application.configureRouting(oppgaveService: OppgaveService) {
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

        authenticate(AUTH_ENTRA_ID) {
            oppgaveRoutes(oppgaveService)
        }
    }
}

class ForbiddenException : RuntimeException()

fun ApplicationCall.requireScope(scope: String) {
    val principal = principal<io.ktor.server.auth.jwt.JWTPrincipal>() ?: throw ForbiddenException()
    if (!principal.hasScope(scope)) throw ForbiddenException()
}
