$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Api = Join-Path $Root "api"
$JarName = "krishisetu-api-0.0.1-SNAPSHOT.jar"
$ReleaseJar = Join-Path $Api "release\app.jar"

Write-Host "==> Building API JAR (Maven runs on the host, not inside Docker)..."
Push-Location $Api
try {
  if (Test-Path ".\mvnw.cmd") {
    & .\mvnw.cmd clean package -DskipTests "-Dspotless.check.skip=true" "-Dcheckstyle.skip=true"
  } else {
    mvn clean package -DskipTests "-Dspotless.check.skip=true" "-Dcheckstyle.skip=true"
  }

  $BuiltJar = Join-Path $Api "target\$JarName"
  if (-not (Test-Path $BuiltJar)) {
    throw "Expected $BuiltJar - check pom.xml version/name."
  }

  New-Item -ItemType Directory -Force -Path (Join-Path $Api "release") | Out-Null
  Copy-Item -Force $BuiltJar $ReleaseJar

  Write-Host "==> Ready for Docker build:"
  Write-Host "    $ReleaseJar"
  Write-Host ""
  Write-Host "On server:"
  Write-Host "  docker compose up -d --build"
} finally {
  Pop-Location
}
