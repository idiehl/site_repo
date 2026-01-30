# Build Master Log PDF
# Atlas Universalis Documentation Build Script (Windows)
# 
# Prerequisites:
#   npm install -g markdown-pdf
#   OR
#   pip install markdown-pdf
#   OR
#   Use pandoc: choco install pandoc
#
# Usage: .\scripts\build_master_log.ps1

$ErrorActionPreference = "Stop"

$DocsDir = Join-Path $PSScriptRoot "..\docs\master_log"
$MasterLogMd = Join-Path $DocsDir "Master_Log.md"
$ProjectOverviewMd = Join-Path $DocsDir "PROJECT_OVERVIEW.md"
$CssFile = Join-Path $DocsDir "pdf.css"

Write-Host "Building Master Log PDFs..." -ForegroundColor Cyan

# Check for available tools
$usePandoc = Get-Command pandoc -ErrorAction SilentlyContinue
$useMarkdownPdf = Get-Command markdown-pdf -ErrorAction SilentlyContinue

if ($usePandoc) {
    Write-Host "Using Pandoc..." -ForegroundColor Green
    
    # Build Master_Log.pdf
    pandoc $MasterLogMd -o (Join-Path $DocsDir "Master_Log.pdf") `
        --pdf-engine=wkhtmltopdf `
        --css=$CssFile `
        --metadata title="Atlas Universalis Master Log"
    
    # Build PROJECT_OVERVIEW.pdf
    pandoc $ProjectOverviewMd -o (Join-Path $DocsDir "PROJECT_OVERVIEW.pdf") `
        --pdf-engine=wkhtmltopdf `
        --css=$CssFile `
        --metadata title="Atlas Universalis Project Overview"
    
    Write-Host "PDFs generated successfully!" -ForegroundColor Green
}
elseif ($useMarkdownPdf) {
    Write-Host "Using markdown-pdf..." -ForegroundColor Green
    
    markdown-pdf $MasterLogMd --css-path $CssFile
    markdown-pdf $ProjectOverviewMd --css-path $CssFile
    
    Write-Host "PDFs generated successfully!" -ForegroundColor Green
}
else {
    Write-Host "No PDF generator found. Please install one of:" -ForegroundColor Yellow
    Write-Host "  - Pandoc: choco install pandoc wkhtmltopdf" -ForegroundColor Yellow
    Write-Host "  - markdown-pdf: npm install -g markdown-pdf" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Markdown files are ready at:" -ForegroundColor Cyan
    Write-Host "  $MasterLogMd" -ForegroundColor White
    Write-Host "  $ProjectOverviewMd" -ForegroundColor White
    exit 1
}
