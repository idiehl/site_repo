namespace Atlas.Apply.Services;

public sealed class PdfImportOptions
{
    public string PdfToTextCommand { get; set; } = "pdftotext";
    public string PdfToPpmCommand { get; set; } = "pdftoppm";
    public string TesseractCommand { get; set; } = "tesseract";
    public bool EnableOcrFallback { get; set; } = true;
    public int MaxOcrPages { get; set; } = 3;
    public int OcrDpi { get; set; } = 300;
    public int MinimumExtractedCharacters { get; set; } = 180;
    public int ProcessTimeoutSeconds { get; set; } = 60;
}

public sealed record PdfImportExtractionResult(
    string Text,
    string Processor,
    string Summary,
    IReadOnlyList<string> Warnings);
