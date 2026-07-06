package no.nav.sosialhjelp.oppgaver.ktor

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.http.HttpStatusCode.Companion.Unauthorized
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.respond
import no.nav.sosialhjelp.oppgaver.AuthConfig
import java.net.URI
import java.util.concurrent.TimeUnit

const val AUTH_ENTRA_ID = "entra-id"

fun Application.configureAuth(config: AuthConfig) {
    val jwkProvider = JwkProviderBuilder(URI(config.jwksUri).toURL())
        .cached(10, 24, TimeUnit.HOURS)
        .rateLimited(10, 1, TimeUnit.MINUTES)
        .build()

    install(Authentication) {
        jwt(AUTH_ENTRA_ID) {
            verifier(jwkProvider, config.issuer) {
                acceptLeeway(10)
            }
            validate { credential ->
                if (credential.payload.audience.contains(config.audience)) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
            challenge { _, _ ->
                call.respondUnauthorized()
            }
        }
    }
}

fun JWTPrincipal.hasScope(scope: String): Boolean =
    payload.getClaim("scp").asString()?.split(" ")?.contains(scope) == true

suspend fun ApplicationCall.respondUnauthorized() {
    respond(Unauthorized, mapOf("melding" to "Ikke autentisert"))
}
