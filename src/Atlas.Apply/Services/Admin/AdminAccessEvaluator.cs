using System.Text;
using System.Text.Json;

namespace Atlas.Apply.Services.Admin;

public static class AdminAccessEvaluator
{
    public static bool TokenHasAdminAccess(string jwt)
    {
        if (!TryReadJwtPayload(jwt, out var payload))
        {
            return false;
        }

        if (TryReadBoolean(payload, "is_admin", out var isAdmin) && isAdmin)
        {
            return true;
        }

        if (HasAdminRole(payload, "role") ||
            HasAdminRole(payload, "roles") ||
            HasAdminRole(payload, "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"))
        {
            return true;
        }

        return false;
    }

    private static bool TryReadJwtPayload(string jwt, out JsonElement payload)
    {
        payload = default;
        try
        {
            var segments = jwt.Split('.');
            if (segments.Length < 2)
            {
                return false;
            }

            var body = segments[1].Replace('-', '+').Replace('_', '/');
            var remainder = body.Length % 4;
            if (remainder > 0)
            {
                body = body.PadRight(body.Length + (4 - remainder), '=');
            }

            var bytes = Convert.FromBase64String(body);
            using var doc = JsonDocument.Parse(Encoding.UTF8.GetString(bytes));
            payload = doc.RootElement.Clone();
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static bool TryReadBoolean(JsonElement payload, string name, out bool value)
    {
        value = false;
        if (!payload.TryGetProperty(name, out var element))
        {
            return false;
        }

        switch (element.ValueKind)
        {
            case JsonValueKind.True:
                value = true;
                return true;
            case JsonValueKind.False:
                value = false;
                return true;
            case JsonValueKind.String:
                if (bool.TryParse(element.GetString(), out value))
                {
                    return true;
                }
                break;
        }

        return false;
    }

    private static bool HasAdminRole(JsonElement payload, string propertyName)
    {
        if (!payload.TryGetProperty(propertyName, out var roleNode))
        {
            return false;
        }

        if (roleNode.ValueKind == JsonValueKind.String)
        {
            return string.Equals(roleNode.GetString(), "admin", StringComparison.OrdinalIgnoreCase);
        }

        if (roleNode.ValueKind == JsonValueKind.Array)
        {
            foreach (var role in roleNode.EnumerateArray())
            {
                if (role.ValueKind == JsonValueKind.String &&
                    string.Equals(role.GetString(), "admin", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
        }

        return false;
    }
}
