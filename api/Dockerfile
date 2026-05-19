# Runtime-only image — copies a pre-built JAR (no Maven in Docker).
#
# Build the JAR on the host first:
#   ./scripts/build-api-jar.sh   (Linux/macOS)
#   .\scripts\build-api-jar.ps1  (Windows)
#
# Then from the repo root:
#   docker compose up -d --build
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -g 1001 appgroup \
    && useradd -u 1001 -g appgroup -m -s /bin/bash appuser

COPY release/app.jar app.jar
RUN chown appuser:appgroup app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

USER appuser

ENV JAVA_OPTS="-XX:+UseG1GC"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
