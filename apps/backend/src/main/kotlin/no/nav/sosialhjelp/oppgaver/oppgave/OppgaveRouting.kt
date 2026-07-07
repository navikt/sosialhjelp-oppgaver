package no.nav.sosialhjelp.oppgaver.oppgave

import io.ktor.http.HttpStatusCode
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.patch
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import no.nav.sosialhjelp.oppgaver.ktor.requireScope
import kotlin.uuid.Uuid

fun Route.oppgaveRoutes(
    oppgaveService: OppgaveService,
    skipAuth: Boolean = false,
) {
    route("/api/oppgaver") {
        post {
            if (!skipAuth) call.requireScope("nks")
            val navIdent =
                if (skipAuth) {
                    "local-dev"
                } else {
                    val principal = call.principal<JWTPrincipal>()!!
                    principal.payload.getClaim("NAVident").asString()
                        ?: throw IllegalArgumentException("NAVident mangler i token")
                }
            val request = call.receive<OpprettOppgaveRequest>()
            val oppgave = oppgaveService.opprettOppgave(request, navIdent)
            call.respond(HttpStatusCode.Created, oppgave)
        }

        post("/sok") {
            if (!skipAuth) call.requireScope("nks")
            val navIdent =
                if (skipAuth) {
                    "local-dev"
                } else {
                    val principal = call.principal<JWTPrincipal>()!!
                    principal.payload.getClaim("NAVident").asString()
                        ?: throw IllegalArgumentException("NAVident mangler i token")
                }
            val request = call.receive<GetOppgaverResponse>()
            val oppgaver = oppgaveService.hentOppgaverForPerson(request.personId)
            call.respond(HttpStatusCode.Created, oppgaver)
        }

        get {
            if (!skipAuth) call.requireScope("navkontor")
            val enhet =
                call.request.queryParameters["enhet"]
                    ?: throw IllegalArgumentException("enhet er påkrevd")
            val oppgaver = oppgaveService.hentOppgaverForEnhet(enhet)
            call.respond(oppgaver)
        }

        get("/{id}") {
            if (!skipAuth) call.requireScope("navkontor")
            val id =
                call.parameters["id"]?.let { Uuid.parse(it) }
                    ?: throw IllegalArgumentException("Ugyldig id")
            val oppgave = oppgaveService.hentOppgave(id)
            call.respond(oppgave)
        }

        patch("/{id}") {
            if (!skipAuth) call.requireScope("navkontor")
            val id =
                call.parameters["id"]?.let { Uuid.parse(it) }
                    ?: throw IllegalArgumentException("Ugyldig id")
            val request = call.receive<OppdaterStatusRequest>()
            val oppgave = oppgaveService.oppdaterStatus(id, request.status)
            call.respond(oppgave)
        }
    }
}
