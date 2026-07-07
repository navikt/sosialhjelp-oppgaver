package no.nav.sosialhjelp.oppgaver

import io.ktor.server.config.*

data class AppConfig(
    val auth: AuthConfig,
    val database: DatabaseConfig,
) {
    companion object {
        fun from(config: ApplicationConfig): AppConfig = AppConfig(
            auth = AuthConfig(
                jwksUri = config.property("auth.jwksUri").getString(),
                issuer = config.property("auth.issuer").getString(),
                audience = config.property("auth.audience").getString(),
                skipAuth = System.getenv("AUTH_SKIP")?.lowercase() == "true",
            ),
            database = DatabaseConfig(
                jdbcUrl = config.property("database.jdbcUrl").getString(),
                username = config.property("database.username").getString(),
                password = config.property("database.password").getString(),
            ),
        )
    }
}

data class AuthConfig(
    val jwksUri: String,
    val issuer: String,
    val audience: String,
    val skipAuth: Boolean = false,
)

data class DatabaseConfig(
    val jdbcUrl: String,
    val username: String,
    val password: String,
)
