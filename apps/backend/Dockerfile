FROM gradle:8.12-jdk21 AS build
WORKDIR /app
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN gradle dependencies --no-daemon --configuration runtimeClasspath
COPY src ./src
RUN gradle shadowJar --no-daemon

FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=build /app/build/libs/*-all.jar app.jar
CMD ["app.jar"]
