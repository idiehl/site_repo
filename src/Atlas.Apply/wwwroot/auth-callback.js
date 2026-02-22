window.atlasAuth = window.atlasAuth || {};

window.atlasAuth.readOAuthTokensFromHash = function () {
    const rawHash = window.location.hash || "";
    const hash = rawHash.startsWith("#") ? rawHash.substring(1) : rawHash;
    const params = new URLSearchParams(hash);

    return {
        AccessToken: params.get("access_token"),
        RefreshToken: params.get("refresh_token")
    };
};

window.atlasAuth.clearOAuthHash = function () {
    const cleanPath = window.location.pathname + (window.location.search || "");
    window.history.replaceState(null, "", cleanPath);
};
