// FILENAME: src/helpers/authHelpers.js
import { useAuth } from "react-oidc-context";

export function useApiClient() {
    const auth = useAuth();

    const getAccessToken = async () => {
        if (auth.user && !auth.user.expired) {
            return auth.user.access_token;
        }
        return null;
    };

    return {
        apiClient: auth.isAuthenticated
            ? createLazyClient(getAccessToken)
            : null
    };
}

// petit wrapper pour ne créer l’instance que si nécessaire
import { createApiClient } from "@auth/api";

function createLazyClient(getAccessToken) {
    let instance = null;
    return () => {
        if (!instance) {
            instance = createApiClient(getAccessToken);
        }
        return instance;
    };
}