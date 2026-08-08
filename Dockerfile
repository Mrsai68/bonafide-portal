# Stage 1: Build Spring Boot Application using Maven + OpenJDK 17
FROM maven:3.9.6-openjdk-17 AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Runtime Container
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy compiled executable JAR
COPY --from=build /app/target/bonafide-portal-1.0.0-SNAPSHOT.jar app.jar

# Expose Spring Boot Port 8080
EXPOSE 8080

# Launch application
ENTRYPOINT ["java", "-jar", "app.jar"]
