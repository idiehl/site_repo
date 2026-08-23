using System.Text;
using System.Text.RegularExpressions;
using Atlas.Apply.Features.Profile;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Http;

namespace Atlas.Apply.Services;

public interface IResumeImportService
{
    Task<ResumeImportResult> ParseAsync(IFormFile file, CancellationToken cancellationToken = default);
}

public sealed class ResumeImportService(
    IResumeTextParsingService textParser,
    ILocalPdfImportService localPdfImportService) : IResumeImportService
{
    private static readonly HashSet<string> SupportedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".docx",
        ".txt",
        ".pdf",
        ".json"
    };

    public async Task<ResumeImportResult> ParseAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Select a resume file to import.");
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            throw new InvalidOperationException("Resume uploads must be 5 MB or smaller.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !SupportedExtensions.Contains(extension))
        {
            throw new InvalidOperationException("Supported resume types are DOCX, TXT, JSON, and text-based PDF.");
        }

        await using var buffer = new MemoryStream();
        await file.CopyToAsync(buffer, cancellationToken);
        buffer.Position = 0;

        var warnings = new List<string>();
        ImportedProfileData parsedProfile;
        string extractedText;
        var importProcessor = "Built-in parser";
        var importSummary = "The resume was processed with the built-in local parser.";

        if (extension.Equals(".json", StringComparison.OrdinalIgnoreCase))
        {
            extractedText = await ReadTextAsync(buffer, cancellationToken);
            if (!textParser.TryParseStructuredJson(extractedText, out parsedProfile))
            {
                throw new InvalidOperationException("The JSON file does not match the expected profile import shape.");
            }
        }
        else
        {
            extractedText = extension.ToLowerInvariant() switch
            {
                ".docx" => ExtractDocxText(buffer),
                ".txt" => await ReadTextAsync(buffer, cancellationToken),
                ".pdf" => await ExtractPdfTextAsync(buffer, warnings, cancellationToken, summary =>
                {
                    importProcessor = summary.Processor;
                    importSummary = summary.Summary;
                }),
                _ => throw new InvalidOperationException("Unsupported resume format.")
            };

            extractedText = NormalizeText(extractedText);
            if (string.IsNullOrWhiteSpace(extractedText))
            {
                throw new InvalidOperationException("The uploaded file did not contain readable text. Try a DOCX resume or use a text-based PDF.");
            }

            parsedProfile = textParser.ParseResumeText(extractedText, warnings);
        }

        if (parsedProfile.Experience.Count == 0
            && parsedProfile.Education.Count == 0
            && parsedProfile.Projects.Count == 0
            && parsedProfile.Certifications.Count == 0
            && parsedProfile.Skills.Count == 0)
        {
            warnings.Add("The import could only extract limited structure. Review the profile sections and fill in anything that was missed.");
        }

        return new ResumeImportResult
        {
            FileName = SanitizeFileName(file.FileName),
            ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
            ExtractedText = extractedText,
            Profile = NormalizeImportedProfile(parsedProfile),
            ImportProcessor = importProcessor,
            ImportSummary = importSummary,
            Warnings = warnings
        };
    }

    private static ImportedProfileData NormalizeImportedProfile(ImportedProfileData data)
    {
        return new ImportedProfileData
        {
            DisplayName = data.DisplayName?.Trim(),
            Headline = data.Headline?.Trim(),
            Summary = data.Summary?.Trim(),
            Location = data.Location?.Trim(),
            PhoneNumber = data.PhoneNumber?.Trim(),
            LinkedInUrl = data.LinkedInUrl?.Trim(),
            GithubUrl = data.GithubUrl?.Trim(),
            PortfolioUrl = data.PortfolioUrl?.Trim(),
            Skills = ProfileDocument.NormalizeSkills(data.Skills),
            Experience = ProfileDocument.ParseExperience(ProfileDocument.SerializeExperience(data.Experience, data.Skills)),
            Education = ProfileDocument.ParseEducation(ProfileDocument.SerializeEducation(data.Education)),
            Projects = ProfileDocument.ParseProjects(ProfileDocument.SerializeProjects(data.Projects)),
            Certifications = ProfileDocument.ParseCertifications(ProfileDocument.SerializeCertifications(data.Certifications))
        };
    }

    private static async Task<string> ReadTextAsync(Stream stream, CancellationToken cancellationToken)
    {
        stream.Position = 0;
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: true);
        var text = await reader.ReadToEndAsync(cancellationToken);
        stream.Position = 0;
        return text;
    }

    private static string ExtractDocxText(Stream stream)
    {
        stream.Position = 0;
        using var document = WordprocessingDocument.Open(stream, false);
        var body = document.MainDocumentPart?.Document?.Body;
        if (body is null)
        {
            return string.Empty;
        }

        var paragraphs = body
            .Descendants<Paragraph>()
            .Select(GetParagraphText)
            .Where(x => !string.IsNullOrWhiteSpace(x));
        stream.Position = 0;
        return string.Join(Environment.NewLine, paragraphs);
    }

    private static string GetParagraphText(Paragraph paragraph)
    {
        var builder = new StringBuilder();
        foreach (var text in paragraph.Descendants<Text>())
        {
            builder.Append(text.Text);
        }

        return builder.ToString().Trim();
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

    private async Task<string> ExtractPdfTextAsync(Stream stream, List<string> warnings, CancellationToken cancellationToken, Action<PdfImportExtractionResult> setProcessor)
    {
        var extraction = await localPdfImportService.ExtractAsync(stream, cancellationToken);
        foreach (var warning in extraction.Warnings)
        {
            warnings.Add(warning);
        }

        setProcessor(extraction);
        return extraction.Text;
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(fileName.Where(c => !invalid.Contains(c)).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "resume" : cleaned;
    }
}
