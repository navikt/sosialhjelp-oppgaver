plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ktor.plugin)
    alias(libs.plugins.ktlint)
    application
}

group = "no.nav.sosialhjelp"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass.set("io.ktor.server.netty.EngineMain")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.auth)
    implementation(libs.ktor.server.auth.jwt)
    implementation(libs.ktor.server.metrics.micrometer)
    implementation(libs.ktor.server.call.logging)
    implementation(libs.ktor.server.status.pages)

    implementation(libs.exposed.core)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.java.time)

    implementation(libs.hikaricp)
    implementation(libs.flyway.core)
    implementation(libs.flyway.postgres)
    runtimeOnly(libs.postgresql)

    implementation(libs.logback.classic)
    implementation(libs.logstash.encoder)
    implementation(libs.micrometer.prometheus)

    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test)
    testImplementation(libs.mockk)
    testImplementation(libs.testcontainers.postgresql)
    testImplementation(libs.testcontainers.junit)
    testImplementation(libs.mock.oauth2.server)
}

tasks {
    test {
        useJUnitPlatform()
    }
    shadowJar {
        mergeServiceFiles()
        isZip64 = true
        duplicatesStrategy = DuplicatesStrategy.INCLUDE
    }
}
