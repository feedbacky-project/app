FROM gradle:6.5.0-jdk8 AS cache
LABEL org.label-schema.name = "Feedbacky Server"
LABEL org.label-schema.description = "Server side of Feedbacky Project made in Java with Spring Boot"
LABEL org.label-schema.vcs-url = "https://github.com/Plajer/feedbacky-project/tree/master/server"

RUN mkdir -p /home/gradle/cache_home
ENV GRADLE_USER_HOME /home/gradle/cache_home
COPY build.gradle /home/gradle/java-code/
WORKDIR /home/gradle/java-code
RUN gradle clean build -i --stacktrace

FROM gradle:6.5.0-jdk8 AS build
COPY --from=cache /home/gradle/cache_home /home/gradle/.gradle
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle bootJar --no-daemon -i --stacktrace

FROM openjdk:8-jre-alpine
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/feedbacky-server.jar
ENTRYPOINT ["java", "-server", "-Djava.security.egd=file:/dev/./urandom","-jar","/app/feedbacky-server.jar"]