FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/jre:openjdk-21
WORKDIR /app
COPY build/libs/*-all.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
