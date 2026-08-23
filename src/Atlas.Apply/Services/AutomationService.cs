namespace Atlas.Apply.Services;

public interface IAutomationService
{
    string NormalizeDescription(string? rawDescription);
}

public class AutomationService : IAutomationService
{
    public string NormalizeDescription(string? rawDescription)
    {
        if (string.IsNullOrWhiteSpace(rawDescription))
        {
            return string.Empty;
        }

        var normalized = rawDescription.Trim();
        if (normalized.Length > 600)
        {
            normalized = normalized[..600] + "...";
        }

        return normalized;
    }
}
