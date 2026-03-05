// FILENAME: src/auth/oidcConfig.js
const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI;

export const oidcConfig = {
    authority,
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email offline_access",
    automaticSilentRenew: true
};