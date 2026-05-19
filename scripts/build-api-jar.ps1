$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Api = Join-Path $Root "api"
$JarName = "krishisetu-api-0.0.1-SNAPSHOT.jar"
$ReleaseJar = Join-Path $Api "release\app.jar"

Write-Host "==> Building API JAR (Maven runs only on this machine, not on EC2)..."
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

  Write-Host "==> Ready for EC2 Docker build:"
  Write-Host "    $ReleaseJar"
  Write-Host ""
  Write-Host "On EC2:"
  Write-Host "  docker compose -f docker-compose.ec2.yml up -d --build"
} finally {
  Pop-Location
}
