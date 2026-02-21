namespace Atlas.Contracts.Auth;

public sealed record PasswordResetConfirm(string Token, string NewPassword);
