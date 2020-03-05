FROM gradle:6.2.0-jdk8 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon

FROM openjdk:8-jre-alpine
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/feedbacky-server.jar
ENTRYPOINT ["java", "-Dserver.port=8081", "-server", "-Djava.security.egd=file:/dev/./urandom","-jar","/app/feedbacky-server.jar"]