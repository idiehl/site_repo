# Atlas Apply (C# Rebuild)

## Local Run

```powershell
dotnet restore
dotnet build src/Atlas.Apply/Atlas.Apply.csproj
dotnet run --project src/Atlas.Apply/Atlas.Apply.csproj
```

## Database

- Provider: PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`)
- Connection string key: `ConnectionStrings:ApplyDb`
- Migrations live in `src/Atlas.Apply/Migrations`

Apply migrations:

```powershell
dotnet dotnet-ef database update --project src/Atlas.Apply/Atlas.Apply.csproj --startup-project src/Atlas.Apply/Atlas.Apply.csproj
```

## Core API Surface

- `POST /api/v2/auth/register`
- `POST /api/v2/auth/login`
- `POST /api/v2/auth/logout`
- `GET /api/v2/auth/session`
- `GET|PUT /api/v2/profile`
- `GET|POST /api/v2/opportunities`
- `GET|POST /api/v2/applications`
- `PUT /api/v2/applications/{applicationId}/status`
- `POST /api/v2/ingestion/extension`
- `GET /api/v2/workspace/summary`
- `GET /healthz`

## Resume Import

`Atlas.Apply` now uses a stronger local PDF pipeline:

1. `pdftotext` for normal text-based PDFs
2. `pdftoppm + tesseract` OCR fallback for scanned/image PDFs
3. a built-in parser only as a final fallback when system tools fail

Configuration keys:

```json
"PdfImport": {
  "PdfToTextCommand": "pdftotext",
  "PdfToPpmCommand": "pdftoppm",
  "TesseractCommand": "tesseract",
  "EnableOcrFallback": true,
  "MaxOcrPages": 3,
  "OcrDpi": 300,
  "MinimumExtractedCharacters": 180
}
```

Production can also be configured through environment variables:

```text
PdfImport__PdfToTextCommand=pdftotext
PdfImport__PdfToPpmCommand=pdftoppm
PdfImport__TesseractCommand=tesseract
PdfImport__EnableOcrFallback=true
PdfImport__MaxOcrPages=3
PdfImport__OcrDpi=300
PdfImport__MinimumExtractedCharacters=180
```

Linux packages required on the server:

```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends poppler-utils tesseract-ocr tesseract-ocr-eng
```
