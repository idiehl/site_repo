param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("legacy", "web", "vnext")]
    [string]$Target,

    [string]$RouteMap = "/etc/nginx/conf.d/atlas-route-map.conf",
    [string]$ReadinessPacket = "",
    [switch]$DryRun,
    [switch]$SkipNginxReload
)

$ErrorActionPreference = "Stop"

$backendLookup = @{
    legacy = "atlas_legacy"
    web    = "atlas_dotnet_web"
    vnext  = "atlas_dotnet_web_vnext"
}

$backend = $backendLookup[$Target]
if (-not $backend) {
    throw "Unsupported target: $Target"
}

if (-not (Test-Path -LiteralPath $RouteMap)) {
    throw "Route map file not found: $RouteMap"
}

if ($Target -eq "vnext") {
    if ([string]::IsNullOrWhiteSpace($ReadinessPacket)) {
        throw "Switching to vnext requires -ReadinessPacket."
    }
    if (-not (Test-Path -LiteralPath $ReadinessPacket)) {
        throw "Readiness packet not found: $ReadinessPacket"
    }

    $packet = Get-Content -LiteralPath $ReadinessPacket -Raw
    if ($packet -notmatch "Overall:\s+PASS") {
        throw "Readiness packet does not indicate PASS: $ReadinessPacket"
    }
}

$lines = Get-Content -LiteralPath $RouteMap
$inMainMap = $false
$replaced = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^map \$request_uri \$main_backend\s*\{$') {
        $inMainMap = $true
        continue
    }

    if ($inMainMap -and $lines[$i].Trim().StartsWith("default ")) {
        $candidate = "default $backend;"
        if ($lines[$i].Trim() -eq $candidate) {
            Write-Output "No change required. main_backend already points to $backend."
            exit 0
        }

        $lines[$i] = "    $candidate"
        $replaced = $true
        break
    }
}

if (-not $replaced) {
    throw "Failed to find main_backend default line in route map: $RouteMap"
}

$newContent = [string]::Join([Environment]::NewLine, $lines)

if ($DryRun) {
    Write-Output "Dry run successful. main_backend would be set to $backend in $RouteMap."
    exit 0
}

$timestamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$backupPath = "$RouteMap.bak.$timestamp"
Copy-Item -LiteralPath $RouteMap -Destination $backupPath
Set-Content -LiteralPath $RouteMap -Value $newContent -NoNewline
Write-Output "Updated $RouteMap. Backup created at $backupPath."

if ($SkipNginxReload) {
    Write-Output "Skipping nginx validation/reload by request."
    exit 0
}

& nginx -t
if ($LASTEXITCODE -ne 0) {
    Copy-Item -LiteralPath $backupPath -Destination $RouteMap -Force
    throw "nginx -t failed. Restored backup."
}

& nginx -s reload
if ($LASTEXITCODE -ne 0) {
    Copy-Item -LiteralPath $backupPath -Destination $RouteMap -Force
    throw "nginx reload failed. Restored backup."
}

Write-Output "Switched main_backend to $backend and reloaded nginx."
