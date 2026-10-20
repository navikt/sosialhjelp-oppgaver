FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/jre:openjdk-27@sha256:9eec756379ed5f12ebade505e5b7ecc26e2eb55b46c137c0c47aad8a1757913c
WORKDIR /app
COPY build/libs/*-all.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
