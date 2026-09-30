using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Atlas.Web.Pages;

public sealed class LaunchScopeModel : PageModel
{
    private const string PublicNoSignIn = "public-no-signin";
    private const string PublicLeadCapture = "public-lead-capture";
    private const string SignedInExperience = "signed-in";
    private const string SavedDataExperience = "saved-data";

    [BindProperty]
    public PlannerInput Input { get; set; } = new()
    {
        ExperienceMode = PublicNoSignIn
    };

    public ScopeRecommendation? Recommendation { get; private set; }

    public void OnGet()
    {
    }

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        Recommendation = BuildRecommendation(Input);
        return Page();
    }

    private static ScopeRecommendation BuildRecommendation(PlannerInput input)
    {
        var experienceModeLabel = GetExperienceModeLabel(input.ExperienceMode);
        var isTomorrowReady = input.ExperienceMode is PublicNoSignIn or PublicLeadCapture;

        var verdict = input.ExperienceMode switch
        {
            PublicNoSignIn => "Tomorrow-ready public MVP",
            PublicLeadCapture => "Tomorrow-ready if capture stays optional",
            SignedInExperience => "Possible tomorrow only with scope cuts",
            SavedDataExperience => "Not tomorrow-ready without major scope cuts",
            _ => "Needs a tighter public MVP"
        };

        var deliveryNote = input.ExperienceMode switch
        {
            PublicNoSignIn => "Ship the first version as a single public page with one clear result.",
            PublicLeadCapture => "Keep the tool usable before asking for contact details.",
            SignedInExperience => "Move sign-in to a follow-up step if you want a realistic tomorrow launch.",
            SavedDataExperience => "Saved state and account data should become a later phase, not tomorrow's release.",
            _ => "Tighten the workflow until the first result appears in one page."
        };

        var riskLabel = input.ExperienceMode switch
        {
            PublicNoSignIn => "Low delivery risk",
            PublicLeadCapture => "Low to medium delivery risk",
            SignedInExperience => "Medium delivery risk",
            SavedDataExperience => "High delivery risk",
            _ => "Medium delivery risk"
        };

        var riskTone = input.ExperienceMode switch
        {
            PublicNoSignIn => "low",
            PublicLeadCapture => "medium",
            SignedInExperience => "medium",
            SavedDataExperience => "high",
            _ => "medium"
        };

        var toolName = Normalize(input.ToolName);
        var audience = Normalize(input.PrimaryAudience);
        var problem = Normalize(input.ProblemToSolve);
        var primaryInput = Normalize(input.PrimaryInput);
        var expectedOutput = Normalize(input.ExpectedOutput);
        var trustSignal = Normalize(input.TrustSignal);

        var scopeItems = new List<string>
        {
            $"Build one public page for {toolName} aimed at {audience}.",
            $"Ask for {primaryInput} and return {expectedOutput} in a single submit-and-result flow.",
            string.IsNullOrWhiteSpace(trustSignal)
                ? "Add one lightweight trust signal such as a worked example, sample output, or next-step CTA."
                : $"Use {trustSignal} as the single trust signal instead of adding more product surface."
        };

        if (!isTomorrowReady)
        {
            scopeItems.Add("Convert account-specific behavior into optional follow-up messaging after the result is shown.");
        }

        var cutItems = new List<string>
        {
            "Saved histories, dashboards, and profile-aware personalization.",
            "Integrations, exports, automations, and background processing.",
            "Any workflow that prevents the visitor from seeing the first result immediately."
        };

        if (input.ExperienceMode is SignedInExperience or SavedDataExperience)
        {
            cutItems.Insert(0, "Mandatory sign-in and account creation before the first result.");
        }

        var successCriteria = new List<string>
        {
            $"{toolName} communicates its value in 10 seconds or less.",
            $"A visitor can submit {primaryInput} and receive {expectedOutput} on the same page.",
            "The result ends with one clear next action: continue, contact, or join early access."
        };

        var inputSummary = new List<string>
        {
            $"Audience: {audience}",
            $"Problem: {problem}",
            $"Core input: {primaryInput}",
            $"Expected output: {expectedOutput}"
        };

        var nextStep = isTomorrowReady
            ? $"Implement {toolName} as a single Razor Page on the current Atlas host and link it from the landing page."
            : $"Reduce {toolName} to a public no-sign-in workflow first, then add {experienceModeLabel.ToLowerInvariant()} as phase two.";

        return new ScopeRecommendation(
            verdict,
            deliveryNote,
            riskLabel,
            riskTone,
            experienceModeLabel,
            scopeItems,
            cutItems,
            successCriteria,
            inputSummary,
            nextStep);
    }

    private static string GetExperienceModeLabel(string experienceMode) =>
        experienceMode switch
        {
            PublicNoSignIn => "Public with no sign-in",
            PublicLeadCapture => "Public with optional lead capture",
            SignedInExperience => "Signed-in experience",
            SavedDataExperience => "Saved account data",
            _ => "Custom workflow"
        };

    private static string Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().TrimEnd('.');

    public sealed class PlannerInput
    {
        [Required]
        [Display(Name = "Tool name")]
        [StringLength(80)]
        public string ToolName { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Primary audience")]
        [StringLength(120)]
        public string PrimaryAudience { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Problem to solve")]
        [StringLength(240)]
        public string ProblemToSolve { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Core input")]
        [StringLength(140)]
        public string PrimaryInput { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Expected output")]
        [StringLength(140)]
        public string ExpectedOutput { get; set; } = string.Empty;

        [Display(Name = "Trust signal")]
        [StringLength(140)]
        public string? TrustSignal { get; set; }

        [Required]
        [Display(Name = "Experience mode")]
        public string ExperienceMode { get; set; } = PublicNoSignIn;
    }

    public sealed record ScopeRecommendation(
        string Verdict,
        string DeliveryNote,
        string RiskLabel,
        string RiskTone,
        string ExperienceModeLabel,
        IReadOnlyList<string> ScopeItems,
        IReadOnlyList<string> CutItems,
        IReadOnlyList<string> SuccessCriteria,
        IReadOnlyList<string> InputSummary,
        string NextStep);
}
