using Atlas.Apply.Domain;
using Atlas.Apply.Features.Profile;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.ComponentModel;
using System.Diagnostics;

namespace Atlas.Apply.Services;

public interface IProfileAssetService
{
    Task<StoredProfileAsset?> TryReadProfileImageAsync(UserProfile profile, CancellationToken cancellationToken = default);
    Task<StoredProfileImageResult> SaveProfileImageAsync(Guid userId, IFormFile file, string? existingRelativePath, CancellationToken cancellationToken = default);
    Task<StoredProfileAsset?> TryReadImportedResumeAsync(Guid userId, UserProfile profile, CancellationToken cancellationToken = default);
    Task<StoredProfileAsset?> TryReadImportedResumePreviewAsync(Guid userId, UserProfile profile, CancellationToken cancellationToken = default);
    Task<StoredImportedResumeResult> SaveImportedResumeAsync(Guid userId, IFormFile file, CancellationToken cancellationToken = default);
    Task<StoredProfileSectionDocumentResult> SaveProfileSectionDocumentAsync(
        Guid userId,
        string section,
        IFormFile file,
        CancellationToken cancellationToken = default);
    Task<StoredProfileAsset?> TryReadProfileSectionDocumentAsync(
        Guid userId,
        string section,
        ProfileSectionDocumentEntry entry,
        CancellationToken cancellationToken = default);
    Task<StoredProfileAsset?> TryReadProfileSectionDocumentPreviewAsync(
        Guid userId,
        string section,
        ProfileSectionDocumentEntry entry,
        CancellationToken cancellationToken = default);
    Task DeleteProfileSectionDocumentFilesAsync(Guid userId, string section, CancellationToken cancellationToken = default);
    Task DeleteAsync(string? relativePath, CancellationToken cancellationToken = default);
}

public sealed record StoredProfileAsset(byte[] Bytes, string ContentType, string FileName);

public sealed record StoredProfileImageResult(string RelativePath, string ContentType, string OriginalFileName);

public sealed record StoredImportedResumeResult(bool HasPreview, IReadOnlyList<string> Warnings);

public sealed record StoredProfileSectionDocumentResult(ProfileSectionDocumentEntry Entry, bool HasPreview, IReadOnlyList<string> Warnings);

public sealed class ProfileAssetService : IProfileAssetService
{
    private static readonly Dictionary<string, string> ImageContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg",
        [".jpeg"] = "image/jpeg",
        [".png"] = "image/png",
        [".gif"] = "image/gif",
        [".webp"] = "image/webp"
    };

    private static readonly Dictionary<string, string> ResumeContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".pdf"] = "application/pdf",
        [".txt"] = "text/plain",
        [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".json"] = "application/json"
    };

    private static readonly HashSet<string> SectionDocumentKeys = new(StringComparer.OrdinalIgnoreCase)
    {
        "bio",
        "experience"
    };

    private readonly string _rootPath;
    private readonly PdfImportOptions _pdfOptions;

    public ProfileAssetService(IConfiguration configuration, IOptions<PdfImportOptions> pdfOptions)
    {
        _rootPath = ResolveRootPath(configuration);
        _pdfOptions = pdfOptions.Value;
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<StoredProfileAsset?> TryReadProfileImageAsync(UserProfile profile, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(profile.ProfileImagePath))
        {
            return null;
        }

        var fullPath = ResolveAssetPath(profile.ProfileImagePath);
        if (!File.Exists(fullPath))
        {
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(fullPath, cancellationToken);
        var contentType = !string.IsNullOrWhiteSpace(profile.ProfileImageContentType)
            ? profile.ProfileImageContentType
            : GetContentTypeFromExtension(Path.GetExtension(fullPath));
        var fileName = string.IsNullOrWhiteSpace(profile.ProfileImageFileName)
            ? Path.GetFileName(fullPath)
            : profile.ProfileImageFileName;
        return new StoredProfileAsset(bytes, contentType, fileName);
    }

    public async Task<StoredProfileImageResult> SaveProfileImageAsync(
        Guid userId,
        IFormFile file,
        string? existingRelativePath,
        CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Select an image file to upload.");
        }

        if (file.Length > 4 * 1024 * 1024)
        {
            throw new InvalidOperationException("Profile images must be 4 MB or smaller.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !ImageContentTypes.TryGetValue(extension, out var contentType))
        {
            throw new InvalidOperationException("Supported image types are JPG, PNG, GIF, and WebP.");
        }

        await DeleteAsync(existingRelativePath, cancellationToken);

        var userFolder = Path.Combine(_rootPath, userId.ToString("N"));
        Directory.CreateDirectory(userFolder);

        var normalizedExtension = extension.ToLowerInvariant();
        var savedFileName = $"profile{normalizedExtension}";
        var fullPath = Path.Combine(userFolder, savedFileName);
        await using (var stream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var relativePath = $"{userId:N}/{savedFileName}".Replace('\\', '/');
        return new StoredProfileImageResult(relativePath, contentType, SanitizeFileName(file.FileName));
    }

    public async Task<StoredProfileSectionDocumentResult> SaveProfileSectionDocumentAsync(
        Guid userId,
        string section,
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Select a file to upload.");
        }

        if (!SectionDocumentKeys.Contains(section))
        {
            throw new InvalidOperationException("Unsupported document section.");
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            throw new InvalidOperationException("Section documents must be 5 MB or smaller.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension) || !ResumeContentTypes.ContainsKey(extension))
        {
            throw new InvalidOperationException("Supported document types are DOCX, TXT, JSON, and PDF.");
        }

        var warnings = new List<string>();
        var userFolder = Path.Combine(_rootPath, userId.ToString("N"));
        Directory.CreateDirectory(userFolder);
        await DeleteProfileSectionDocumentFilesAsync(userId, section, cancellationToken);

        var safeKey = section.ToLowerInvariant();
        var documentPath = Path.Combine(userFolder, $"section-doc-{safeKey}{extension}");
        await using (var stream = new FileStream(documentPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var contentType = ResumeContentTypes[extension];
        var previewPath = Path.Combine(userFolder, $"section-doc-{safeKey}-preview.png");
        var hasPreview = false;
        if (extension.Equals(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            hasPreview = await TryGeneratePdfPreviewAsync(documentPath, previewPath, warnings, cancellationToken);
        }
        else if (File.Exists(previewPath))
        {
            File.Delete(previewPath);
        }

        var entry = new ProfileSectionDocumentEntry
        {
            OriginalFileName = SanitizeFileName(file.FileName),
            ContentType = contentType,
            FileExtension = extension,
            UploadedUtc = DateTime.UtcNow
        };

        return new StoredProfileSectionDocumentResult(entry, hasPreview, warnings);
    }

    public async Task<StoredProfileAsset?> TryReadProfileSectionDocumentAsync(
        Guid userId,
        string section,
        ProfileSectionDocumentEntry entry,
        CancellationToken cancellationToken = default)
    {
        if (!SectionDocumentKeys.Contains(section) || string.IsNullOrWhiteSpace(entry.FileExtension))
        {
            return null;
        }

        var userFolder = Path.Combine(_rootPath, userId.ToString("N"));
        var safeKey = section.ToLowerInvariant();
        var ext = entry.FileExtension.StartsWith('.') ? entry.FileExtension : "." + entry.FileExtension;
        var path = Path.Combine(userFolder, $"section-doc-{safeKey}{ext}");
        if (!File.Exists(path))
        {
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(path, cancellationToken);
        var fileLabel = !string.IsNullOrWhiteSpace(entry.OriginalFileName)
            ? entry.OriginalFileName
            : $"document{ext}";
        return new StoredProfileAsset(bytes, entry.ContentType, fileLabel);
    }

    public async Task<StoredProfileAsset?> TryReadProfileSectionDocumentPreviewAsync(
        Guid userId,
        string section,
        ProfileSectionDocumentEntry entry,
        CancellationToken cancellationToken = default)
    {
        if (!SectionDocumentKeys.Contains(section)
            || !string.Equals(entry.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var userFolder = Path.Combine(_rootPath, userId.ToString("N"));
        var safeKey = section.ToLowerInvariant();
        var path = Path.Combine(userFolder, $"section-doc-{safeKey}-preview.png");
        if (!File.Exists(path))
        {
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(path, cancellationToken);
        return new StoredProfileAsset(bytes, "image/png", "preview.png");
    }

    public Task DeleteProfileSectionDocumentFilesAsync(Guid userId, string section, CancellationToken cancellationToken = default)
    {
        if (!SectionDocumentKeys.Contains(section))
        {
            return Task.CompletedTask;
        }

        var userFolder = Path.Combine(_rootPath, userId.ToString("N"));
        if (!Directory.Exists(userFolder))
        {
            return Task.CompletedTask;
        }

        var safeKey = section.ToLowerInvariant();
        foreach (var file in Directory.GetFiles(userFolder, $"section-doc-{safeKey}*"))
        {
            File.Delete(file);
        }

        return Task.CompletedTask;
    }

    public async Task<StoredImportedResumeResult> SaveImportedResumeAsync(Guid userId, IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Select a resume file to import.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension) || !ResumeContentTypes.ContainsKey(extension))
        {
            throw new InvalidOperationException("Supported resume types are DOCX, TXT, JSON, and PDF.");
        }

        var warnings = new List<string>();
        var userFolder = Path.Combine(_rootPath, userId.ToString("N"));
        Directory.CreateDirectory(userFolder);

        foreach (var existing in Directory.GetFiles(userFolder, "resume-import*"))
        {
            File.Delete(existing);
        }

        var resumePath = Path.Combine(userFolder, $"resume-import{extension}");
        await using (var stream = new FileStream(resumePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var previewPath = Path.Combine(userFolder, "resume-import-preview.png");
        var hasPreview = false;
        if (extension.Equals(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            hasPreview = await TryGeneratePdfPreviewAsync(resumePath, previewPath, warnings, cancellationToken);
        }
        else if (File.Exists(previewPath))
        {
            File.Delete(previewPath);
        }

        return new StoredImportedResumeResult(hasPreview, warnings);
    }

    public async Task<StoredProfileAsset?> TryReadImportedResumeAsync(Guid userId, UserProfile profile, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(profile.ImportedResumeFileName))
        {
            return null;
        }

        var extension = Path.GetExtension(profile.ImportedResumeFileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
        {
            return null;
        }

        var path = Path.Combine(_rootPath, userId.ToString("N"), $"resume-import{extension}");
        if (!File.Exists(path))
        {
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(path, cancellationToken);
        var contentType = !string.IsNullOrWhiteSpace(profile.ImportedResumeContentType)
            ? profile.ImportedResumeContentType
            : GetResumeContentType(extension);
        return new StoredProfileAsset(bytes, contentType, profile.ImportedResumeFileName);
    }

    public async Task<StoredProfileAsset?> TryReadImportedResumePreviewAsync(Guid userId, UserProfile profile, CancellationToken cancellationToken = default)
    {
        if (!string.Equals(profile.ImportedResumeContentType, "application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var path = Path.Combine(_rootPath, userId.ToString("N"), "resume-import-preview.png");
        if (!File.Exists(path))
        {
            return null;
        }

        var bytes = await File.ReadAllBytesAsync(path, cancellationToken);
        return new StoredProfileAsset(bytes, "image/png", "resume-preview.png");
    }

    public Task DeleteAsync(string? relativePath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return Task.CompletedTask;
        }

        var fullPath = ResolveAssetPath(relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    private string ResolveAssetPath(string relativePath)
    {
        var segments = relativePath
            .Split(['/', '\\'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return Path.Combine([_rootPath, .. segments]);
    }

    private static string ResolveRootPath(IConfiguration configuration)
    {
        var configured = configuration["ProfileAssetsPath"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured;
        }

        if (OperatingSystem.IsWindows())
        {
            var localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return Path.Combine(localAppData, "AtlasApply", "profile-assets");
        }

        return "/var/lib/atlas-apply/profile-assets";
    }

    private static string GetContentTypeFromExtension(string extension)
    {
        return ImageContentTypes.TryGetValue(extension, out var contentType)
            ? contentType
            : "application/octet-stream";
    }

    private static string GetResumeContentType(string extension)
    {
        return ResumeContentTypes.TryGetValue(extension, out var contentType)
            ? contentType
            : "application/octet-stream";
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(fileName.Where(c => !invalid.Contains(c)).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(cleaned) ? "file" : cleaned;
    }

    private async Task<bool> TryGeneratePdfPreviewAsync(string pdfPath, string previewPath, List<string> warnings, CancellationToken cancellationToken)
    {
        var tempPrefix = Path.Combine(Path.GetDirectoryName(previewPath)!, "resume-preview-temp");
        foreach (var file in Directory.GetFiles(Path.GetDirectoryName(previewPath)!, "resume-preview-temp*"))
        {
            File.Delete(file);
        }

        var renderResult = await RunProcessAsync(
            _pdfOptions.PdfToPpmCommand,
            ["-png", "-f", "1", "-l", "1", "-r", Math.Max(150, _pdfOptions.OcrDpi).ToString(), pdfPath, tempPrefix],
            cancellationToken);

        if (!renderResult.Started)
        {
            warnings.Add($"`{_pdfOptions.PdfToPpmCommand}` is not available, so no PDF preview image was generated.");
            return false;
        }

        if (renderResult.ExitCode != 0)
        {
            warnings.Add($"The PDF preview image could not be generated ({renderResult.ErrorSummary}).");
            return false;
        }

        var generated = Directory.GetFiles(Path.GetDirectoryName(previewPath)!, "resume-preview-temp-*.png")
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault();
        if (string.IsNullOrWhiteSpace(generated))
        {
            warnings.Add("The PDF preview image could not be generated.");
            return false;
        }

        if (File.Exists(previewPath))
        {
            File.Delete(previewPath);
        }

        File.Move(generated, previewPath, true);
        return true;
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
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(10, _pdfOptions.ProcessTimeoutSeconds)));
            var stdoutTask = process.StandardOutput.ReadToEndAsync(timeoutCts.Token);
            var stderrTask = process.StandardError.ReadToEndAsync(timeoutCts.Token);

            try
            {
                await process.WaitForExitAsync(timeoutCts.Token);
            }
            catch (OperationCanceledException)
            {
                TryKill(process);
                return new ProcessResult(true, -2, string.Empty, $"Timed out after {_pdfOptions.ProcessTimeoutSeconds} seconds.");
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
