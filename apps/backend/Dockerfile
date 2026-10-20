FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/jre:openjdk-21@sha256:2033cce93075c7f4ee88372e35f8461065672f690acf54b61342639ced4fed8c
WORKDIR /app
COPY build/libs/*-all.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
