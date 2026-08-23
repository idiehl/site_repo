param(
    [string]$SourceDir = "src/Atlas.Apply/extension",
    [string]$OutputZip = "src/Atlas.Apply/wwwroot/atlas-apply-extension.zip"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourcePath = Join-Path $repoRoot $SourceDir
$outputPath = Join-Path $repoRoot $OutputZip
$outputDir = Split-Path -Parent $outputPath

if (-not (Test-Path $sourcePath)) {
    throw "Extension source folder not found: $sourcePath"
}

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

if (Test-Path $outputPath) {
    Remove-Item $outputPath -Force
}

Compress-Archive -Path (Join-Path $sourcePath "*") -DestinationPath $outputPath -CompressionLevel Optimal
Write-Host "Created extension package: $outputPath"
