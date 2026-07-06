package no.nav.sosialhjelp.oppgaver

data class AppConfig(
    val auth: AuthConfig,
    val database: DatabaseConfig,
) {
    companion object {
        fun from(env: Map<String, String>): AppConfig = AppConfig(
            auth = AuthConfig(
                jwksUri = env.getValue("AZURE_OPENID_CONFIG_JWKS_URI"),
                issuer = env.getValue("AZURE_OPENID_CONFIG_ISSUER"),
                audience = env.getValue("AZURE_APP_CLIENT_ID"),
            ),
            database = DatabaseConfig(
                jdbcUrl = env.getValue("DB_JDBC_URL"),
                username = env.getValue("DB_USERNAME"),
                password = env.getValue("DB_PASSWORD"),
            ),
        )
    }
}

data class AuthConfig(
    val jwksUri: String,
    val issuer: String,
    val audience: String,
)

data class DatabaseConfig(
    val jdbcUrl: String,
    val username: String,
    val password: String,
)
