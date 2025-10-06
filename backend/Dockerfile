# syntax=docker/dockerfile:1

# --- Build Stage ---
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Gradle wrapper and build files first for dependency caching
COPY --link build.gradle settings.gradle gradlew ./
COPY --link gradle gradle/

# Download dependencies (caching layer)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code
COPY --link src ./src

# Build the application (skip tests for faster build)
RUN ./gradlew build --no-daemon -x test

# --- Runtime Stage ---
FROM eclipse-temurin:21-jre
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/*.jar /app/app.jar

# Set permissions
RUN chown -R appuser:appgroup /app
USER appuser

# JVM options: container-aware memory settings
ENV JAVA_OPTS="-XX:MaxRAMPercentage=80.0 -Djava.security.egd=file:/dev/./urandom"

# Expose port (default Spring Boot port)
EXPOSE 8080

# Use exec form for proper signal handling
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
