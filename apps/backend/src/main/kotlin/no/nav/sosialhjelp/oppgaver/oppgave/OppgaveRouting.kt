package no.nav.sosialhjelp.oppgaver.oppgave

import io.ktor.http.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.auth.principal
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.nav.sosialhjelp.oppgaver.ktor.requireScope
import kotlin.uuid.Uuid

fun Route.oppgaveRoutes(oppgaveService: OppgaveService) {
    route("/api/oppgaver") {
        post {
            call.requireScope("nks")
            val principal = call.principal<JWTPrincipal>()!!
            val navIdent = principal.payload.getClaim("NAVident").asString()
                ?: throw IllegalArgumentException("NAVident mangler i token")
            val request = call.receive<OpprettOppgaveRequest>()
            val oppgave = oppgaveService.opprettOppgave(request, navIdent)
            call.respond(HttpStatusCode.Created, oppgave)
        }

        get {
            call.requireScope("navkontor")
            val enhet = call.request.queryParameters["enhet"]
                ?: throw IllegalArgumentException("enhet er påkrevd")
            val oppgaver = oppgaveService.hentOppgaverForEnhet(enhet)
            call.respond(oppgaver)
        }

        get("/{id}") {
            call.requireScope("navkontor")
            val id = call.parameters["id"]?.let { Uuid.parse(it) }
                ?: throw IllegalArgumentException("Ugyldig id")
            val oppgave = oppgaveService.hentOppgave(id)
            call.respond(oppgave)
        }

        patch("/{id}") {
            call.requireScope("navkontor")
            val id = call.parameters["id"]?.let { Uuid.parse(it) }
                ?: throw IllegalArgumentException("Ugyldig id")
            val request = call.receive<OppdaterStatusRequest>()
            val oppgave = oppgaveService.oppdaterStatus(id, request.status)
            call.respond(oppgave)
        }
    }
}
