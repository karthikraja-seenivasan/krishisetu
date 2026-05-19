#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="$ROOT/api"
JAR_NAME="krishisetu-api-0.0.1-SNAPSHOT.jar"
RELEASE_JAR="$API/release/app.jar"

echo "==> Building API JAR (Maven runs on the host, not inside Docker)..."
cd "$API"
./mvnw clean package -DskipTests -Dspotless.check.skip=true -Dcheckstyle.skip=true

if [[ ! -f "target/$JAR_NAME" ]]; then
  echo "ERROR: expected target/$JAR_NAME — check pom.xml version/name." >&2
  exit 1
fi

mkdir -p release
cp "target/$JAR_NAME" "$RELEASE_JAR"

echo "==> Ready for Docker build:"
echo "    $RELEASE_JAR"
echo ""
echo "Copy to server:"
echo "  scp -r api/release api/Dockerfile docker-compose.yml .env user@host:/opt/krishisetu/"
echo ""
echo "On server:"
echo "  docker compose up -d --build"
