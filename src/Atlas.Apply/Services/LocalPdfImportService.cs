using System.Diagnostics;
using System.ComponentModel;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace Atlas.Apply.Services;

public interface ILocalPdfImportService
{
    Task<PdfImportExtractionResult> ExtractAsync(Stream pdfStream, CancellationToken cancellationToken = default);
}

public sealed class LocalPdfImportService(IOptions<PdfImportOptions> options) : ILocalPdfImportService
{
    private static readonly Regex PdfTextRegex = new(@"\((?<text>(?:\\.|[^\\)])*)\)\s*Tj|\[(?<array>.*?)\]\s*TJ", RegexOptions.Singleline | RegexOptions.Compiled);
    private readonly PdfImportOptions _options = options.Value;

    public async Task<PdfImportExtractionResult> ExtractAsync(Stream pdfStream, CancellationToken cancellationToken = default)
    {
        var warnings = new List<string>();
        var tempRoot = Path.Combine(Path.GetTempPath(), $"atlas-apply-pdf-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempRoot);

        try
        {
            var pdfPath = Path.Combine(tempRoot, "resume.pdf");
            await using (var fileStream = File.Create(pdfPath))
            {
                pdfStream.Position = 0;
                await pdfStream.CopyToAsync(fileStream, cancellationToken);
            }
            pdfStream.Position = 0;

            var extractedText = await ExtractWithPdfToTextAsync(pdfPath, tempRoot, warnings, cancellationToken);
            if (IsUsefulText(extractedText))
            {
                warnings.Add("The PDF text was extracted with the local text engine.");
                return new PdfImportExtractionResult(
                    NormalizeText(extractedText),
                    "pdftotext",
                    "The PDF was processed with the local PDF text engine.",
                    warnings);
            }

            if (_options.EnableOcrFallback)
            {
                var ocrText = await ExtractWithOcrAsync(pdfPath, tempRoot, warnings, cancellationToken);
                if (IsUsefulText(ocrText))
                {
                    warnings.Add("The PDF required OCR fallback, so page images were processed with Tesseract.");
                    return new PdfImportExtractionResult(
                        NormalizeText(ocrText),
                        "Tesseract OCR",
                        "The PDF was processed with OCR using local system tools.",
                        warnings);
                }
            }
            else
            {
                warnings.Add("OCR fallback is disabled, so only direct PDF text extraction was attempted.");
            }

            var fallbackText = ExtractPdfTextFallback(pdfPath, warnings);
            return new PdfImportExtractionResult(
                NormalizeText(fallbackText),
                "Built-in parser",
                "The PDF fell back to the built-in parser after local system tools could not extract enough text.",
                warnings);
        }
        finally
        {
            try
            {
                Directory.Delete(tempRoot, recursive: true);
            }
            catch
            {
                // Ignore temp cleanup failures.
            }
        }
    }

    private async Task<string> ExtractWithPdfToTextAsync(string pdfPath, string tempRoot, List<string> warnings, CancellationToken cancellationToken)
    {
        var outputPath = Path.Combine(tempRoot, "resume.txt");
        var result = await RunProcessAsync(
            _options.PdfToTextCommand,
            ["-layout", "-enc", "UTF-8", pdfPath, outputPath],
            cancellationToken);

        if (!result.Started)
        {
            warnings.Add($"`{_options.PdfToTextCommand}` is not available, so direct PDF text extraction was skipped.");
            return string.Empty;
        }

        if (result.ExitCode != 0)
        {
            warnings.Add($"`{_options.PdfToTextCommand}` could not extract text from this PDF ({result.ErrorSummary}).");
            return string.Empty;
        }

        return File.Exists(outputPath)
            ? await File.ReadAllTextAsync(outputPath, cancellationToken)
            : string.Empty;
    }

    private async Task<string> ExtractWithOcrAsync(string pdfPath, string tempRoot, List<string> warnings, CancellationToken cancellationToken)
    {
        var pagesPrefix = Path.Combine(tempRoot, "page");
        var renderArgs = new List<string>
        {
            "-png",
            "-r", _options.OcrDpi.ToString(),
            "-f", "1",
            "-l", Math.Max(1, _options.MaxOcrPages).ToString(),
            pdfPath,
            pagesPrefix
        };

        var renderResult = await RunProcessAsync(_options.PdfToPpmCommand, renderArgs, cancellationToken);
        if (!renderResult.Started)
        {
            warnings.Add($"`{_options.PdfToPpmCommand}` is not available, so OCR fallback was skipped.");
            return string.Empty;
        }

        if (renderResult.ExitCode != 0)
        {
            warnings.Add($"`{_options.PdfToPpmCommand}` could not render this PDF for OCR ({renderResult.ErrorSummary}).");
            return string.Empty;
        }

        var images = Directory.GetFiles(tempRoot, "page-*.png")
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (images.Length == 0)
        {
            warnings.Add("OCR fallback could not render any PDF pages to images.");
            return string.Empty;
        }

        var allText = new StringBuilder();
        foreach (var imagePath in images)
        {
            var ocrResult = await RunProcessAsync(
                _options.TesseractCommand,
                [imagePath, "stdout", "-l", "eng", "--psm", "6"],
                cancellationToken);

            if (!ocrResult.Started)
            {
                warnings.Add($"`{_options.TesseractCommand}` is not available, so OCR fallback was skipped.");
                return string.Empty;
            }

            if (ocrResult.ExitCode != 0)
            {
                warnings.Add($"`{_options.TesseractCommand}` failed on {Path.GetFileName(imagePath)} ({ocrResult.ErrorSummary}).");
                continue;
            }

            allText.AppendLine(ocrResult.StandardOutput);
        }

        return allText.ToString();
    }

    private static string ExtractPdfTextFallback(string pdfPath, List<string> warnings)
    {
        var builder = new StringBuilder();
        var raw = File.ReadAllText(pdfPath, Encoding.Latin1);

        foreach (Match match in PdfTextRegex.Matches(raw))
        {
            if (match.Groups["text"].Success)
            {
                builder.AppendLine(DecodePdfText(match.Groups["text"].Value));
                continue;
            }

            if (match.Groups["array"].Success)
            {
                foreach (Match nested in Regex.Matches(match.Groups["array"].Value, @"\((?<text>(?:\\.|[^\\)])*)\)"))
                {
                    builder.Append(DecodePdfText(nested.Groups["text"].Value));
                }

                builder.AppendLine();
            }
        }

        var text = NormalizeText(builder.ToString());
        if (string.IsNullOrWhiteSpace(text))
        {
            warnings.Add("The built-in PDF parser could not extract readable text from this file.");
        }
        else
        {
            warnings.Add("The PDF import fell back to the built-in parser. Results may need manual cleanup.");
        }

        return text;
    }

    private static bool IsUsefulText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return false;
        }

        var normalized = NormalizeText(text);
        return normalized.Length >= 180 || normalized.Contains('@') || normalized.Contains("experience", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var normalized = text
            .Replace("\r\n", "\n", StringComparison.Ordinal)
            .Replace('\r', '\n');
        normalized = Regex.Replace(normalized, @"[ \t]+\n", "\n");
        normalized = Regex.Replace(normalized, @"\n{3,}", "\n\n");
        return normalized.Trim();
    }

    private static string DecodePdfText(string encoded)
    {
        var builder = new StringBuilder();
        for (var i = 0; i < encoded.Length; i++)
        {
            var current = encoded[i];
            if (current != '\\')
            {
                builder.Append(current);
                continue;
            }

            if (i == encoded.Length - 1)
            {
                break;
            }

            var next = encoded[++i];
            builder.Append(next switch
            {
                'n' => '\n',
                'r' => '\r',
                't' => '\t',
                'b' => '\b',
                'f' => '\f',
                '(' => '(',
                ')' => ')',
                '\\' => '\\',
                _ => next
            });
        }

        return builder.ToString();
    }

    private async Task<ProcessResult> RunProcessAsync(string fileName, IReadOnlyList<string> arguments, CancellationToken cancellationToken)
    {
        try
        {
            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = fileName,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            foreach (var argument in arguments)
            {
                process.StartInfo.ArgumentList.Add(argument);
            }

            process.Start();
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(10, _options.ProcessTimeoutSeconds)));
            var stdoutTask = process.StandardOutput.ReadToEndAsync(timeoutCts.Token);
            var stderrTask = process.StandardError.ReadToEndAsync(timeoutCts.Token);

            try
            {
                await process.WaitForExitAsync(timeoutCts.Token);
            }
            catch (OperationCanceledException)
            {
                TryKill(process);
                return new ProcessResult(true, -2, string.Empty, $"Timed out after {_options.ProcessTimeoutSeconds} seconds.");
            }

            var stdout = await stdoutTask;
            var stderr = await stderrTask;

            return new ProcessResult(true, process.ExitCode, stdout, stderr);
        }
        catch (Exception ex) when (ex is Win32Exception or FileNotFoundException)
        {
            return new ProcessResult(false, -1, string.Empty, ex.Message);
        }
    }

    private static void TryKill(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }
        }
        catch
        {
            // Ignore kill failures.
        }
    }

    private sealed record ProcessResult(bool Started, int ExitCode, string StandardOutput, string StandardError)
    {
        public string ErrorSummary
        {
            get
            {
                if (string.IsNullOrWhiteSpace(StandardError))
                {
                    return ExitCode == 0 ? "ok" : $"exit code {ExitCode}";
                }

                var trimmed = StandardError.Trim();
                return trimmed.Length <= 240 ? trimmed : trimmed[..240];
            }
        }
    }
}
