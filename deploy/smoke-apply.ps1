param(
    [int]$Port = 0
)

$ErrorActionPreference = "Stop"
$requestTimeoutSec = 20
$Port = if ($Port -le 0) { Get-Random -Minimum 5200 -Maximum 6200 } else { $Port }
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$projectPath = Join-Path $repoRoot "src/Atlas.Apply/Atlas.Apply.csproj"
$sqlitePath = Join-Path $repoRoot ".deploy/atlas-apply-smoke-$([guid]::NewGuid()).db"
$env:ASPNETCORE_URLS = "http://127.0.0.1:$Port"
$env:ASPNETCORE_ENVIRONMENT = "Development"
$env:ApplyDbProvider = "Sqlite"
$env:ConnectionStrings__ApplyDb = "Data Source=$sqlitePath"
$stdoutLogPath = Join-Path $repoRoot ".deploy/atlas-apply-smoke-$([guid]::NewGuid()).out.log"
$stderrLogPath = Join-Path $repoRoot ".deploy/atlas-apply-smoke-$([guid]::NewGuid()).err.log"

$process = Start-Process -FilePath "dotnet" -ArgumentList @("run", "--project", "$projectPath", "--no-build", "--no-launch-profile") -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdoutLogPath -RedirectStandardError $stderrLogPath
try {
    $baseUrl = "http://127.0.0.1:$Port"
    $healthOk = $false
    for ($i = 0; $i -lt 100; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $health = Invoke-WebRequest -Uri "$baseUrl/healthz" -Method Get -TimeoutSec 3
            if ($health.StatusCode -eq 200) {
                $healthOk = $true
                break
            }
        } catch { }
    }

    if (-not $healthOk) {
        if (Test-Path $stdoutLogPath) {
            Write-Host "Smoke startup stdout:"
            Get-Content $stdoutLogPath
        }
        if (Test-Path $stderrLogPath) {
            Write-Host "Smoke startup stderr:"
            Get-Content $stderrLogPath
        }
        throw "Health endpoint did not become ready."
    }

    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $email = "smoke.user+$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"

    $registerBody = @{
        email = $email
        password = "Pass!12345"
        displayName = "Smoke User"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/v2/auth/register" -Method Post -ContentType "application/json" -Body $registerBody -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null

    $oppBody = @{
        sourceType = "Manual"
        company = "Atlas Test Co"
        roleTitle = "CSharp Engineer"
        location = "Remote"
        compensationText = "$120k"
        postingUrl = "https://example.com/jobs/1"
        descriptionRaw = "Build reliable backend services"
        metadataJson = "{}"
    } | ConvertTo-Json
    $opp = Invoke-RestMethod -Uri "$baseUrl/api/v2/opportunities" -Method Post -ContentType "application/json" -Body $oppBody -WebSession $session -TimeoutSec $requestTimeoutSec

    $appBody = @{
        opportunityId = $opp.id
        status = "Saved"
        priority = "Normal"
        notes = "Created by smoke test"
    } | ConvertTo-Json
    $app = Invoke-RestMethod -Uri "$baseUrl/api/v2/applications" -Method Post -ContentType "application/json" -Body $appBody -WebSession $session -TimeoutSec $requestTimeoutSec

    $statusBody = @{ status = "Applied" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/v2/applications/$($app.id)/status" -Method Put -ContentType "application/json" -Body $statusBody -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null

    $priorityBody = @{ priority = "High" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/v2/applications/$($app.id)/priority" -Method Put -ContentType "application/json" -Body $priorityBody -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null

    $noteBody = @{ note = "Smoke history note for workflow validation." } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/v2/applications/$($app.id)/note" -Method Post -ContentType "application/json" -Body $noteBody -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null

    $invalidTransitionBlocked = $false
    try {
        $invalidBody = @{ status = "Offer" } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/v2/applications/$($app.id)/status" -Method Put -ContentType "application/json" -Body $invalidBody -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null
    }
    catch {
        $invalidTransitionBlocked = $true
    }
    if (-not $invalidTransitionBlocked) {
        throw "Invalid status transition was unexpectedly accepted."
    }

    $ingestBody = @{
        sourceDomain = "example.com"
        pageUrl = "https://example.com/jobs/1"
        roleTitle = "CSharp Engineer"
        company = "Atlas Test Co"
        location = "Remote"
        rawDescription = "A browser-captured posting payload"
        metadataJson = "{}"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/v2/ingestion/extension" -Method Post -ContentType "application/json" -Body $ingestBody -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null

    $packageBody = @{
        opportunityId = $opp.id
        resumeVariant = "General"
        coverLetterTone = "Direct"
        focusAreasCsv = "delivery,collaboration"
    } | ConvertTo-Json
    $package = Invoke-RestMethod -Uri "$baseUrl/api/v2/automation/application-package" -Method Post -ContentType "application/json" -Body $packageBody -WebSession $session -TimeoutSec $requestTimeoutSec
    if ([string]::IsNullOrWhiteSpace($package.coverLetter)) {
        throw "Application package did not return a cover letter."
    }

    $questionsBody = @{
        opportunityId = $opp.id
        questionType = "technical"
        saveToMetadata = $true
    } | ConvertTo-Json
    $questions = Invoke-RestMethod -Uri "$baseUrl/api/v2/automation/interview-questions" -Method Post -ContentType "application/json" -Body $questionsBody -WebSession $session -TimeoutSec $requestTimeoutSec
    if ($questions.questions.Count -lt 3) {
        throw "Interview question generation returned too few items."
    }

    $history = Invoke-RestMethod -Uri "$baseUrl/api/v2/applications/$($app.id)/history" -Method Get -WebSession $session -TimeoutSec $requestTimeoutSec
    if ($history.events.Count -lt 2) {
        throw "Application history endpoint did not return expected events."
    }

    Invoke-RestMethod -Uri "$baseUrl/api/v2/applications/$($app.id)" -Method Delete -WebSession $session -TimeoutSec $requestTimeoutSec | Out-Null

    $summary = Invoke-RestMethod -Uri "$baseUrl/api/v2/workspace/summary" -Method Get -WebSession $session -TimeoutSec $requestTimeoutSec
    if ($summary.opportunities -lt 1 -or $summary.applications -lt 1 -or $summary.ingestions -lt 1) {
        throw "Workspace summary did not reflect expected records."
    }

    Write-Host "Atlas Apply smoke test passed."
}
finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
    }
}
