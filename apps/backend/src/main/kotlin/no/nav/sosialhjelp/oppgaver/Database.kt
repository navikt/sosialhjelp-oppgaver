package no.nav.sosialhjelp.oppgaver

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.v1.jdbc.Database

class Database(config: DatabaseConfig) {

    val dataSource: HikariDataSource = HikariDataSource(HikariConfig().apply {
        jdbcUrl = config.jdbcUrl
        username = config.username
        password = config.password
        maximumPoolSize = 3
        idleTimeout = 300_000
        maxLifetime = 1_800_000
        initializationFailTimeout = 60_000
    })

    init {
        migrate()
        Database.connect(dataSource)
    }

    private fun migrate() {
        Flyway.configure()
            .dataSource(dataSource)
            .lockRetryCount(10)
            .load()
            .migrate()
    }
}
