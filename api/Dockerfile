# Full build inside Docker (Maven + sources). Fine for local/CI image builds.
# For EC2: build the JAR elsewhere and use Dockerfile.runtime + docker-compose.ec2.yml
# (see scripts/build-api-jar.sh).
#
# ==============================================================================
# Builder Stage
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy the pom.xml and dependency files first to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the rest of the source code and build the application package
COPY src ./src
# Skip checkstyle/spotless on docker build to speed up, or include if strict enforcement is desired
RUN mvn clean package -DskipTests -Dspotless.check.skip=true -Dcheckstyle.skip=true

# ==============================================================================
# Runtime Stage
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Create a non-root system user and group for security baseline compliance
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -s /bin/bash appuser

# Copy the built jar from the builder stage
COPY --from=builder /app/target/krishisetu-api-0.0.1-SNAPSHOT.jar app.jar

# Ensure the jar is owned by the appuser
RUN chown appuser:appgroup app.jar

# Expose standard container port
EXPOSE 8080

# Configure health check for Railway / Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run as non-root user
USER appuser

# Set runtime JVM arguments (e.g. enable virtual threads, optimization)
ENTRYPOINT ["java", "-XX:+UseG1GC", "-jar", "app.jar"]
