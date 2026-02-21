namespace Atlas.Web.Services;

public record DevDocResult(string Title, string ContentMd, string ContentHtml, string? LastModified);

public record DevStatus(string Status, string? Message, string? UpdatedAt, string? UpdatedBy);

public record AppInfo(string Id, string Name, string Description);

public interface IDevDocService
{
    DevDocResult GetDocument(string filename, string title);
    DevDocResult? GetAppDocument(string appId, string docType);
    void AppendChecklistTask(string appId, string task);
    DevStatus GetStatus();
    DevStatus UpdateStatus(string status, string? message, string? updatedBy);
    IReadOnlyList<AppInfo> GetApps();
    string? GetAppName(string appId);
}
