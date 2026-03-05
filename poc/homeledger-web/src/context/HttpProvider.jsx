import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Spin } from "antd";
import { createApiClient } from "../auth/api";

const HttpContext = createContext(null);

export function HttpProvider({ children }) {
    const auth = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Garder une référence à auth pour que getAccessToken ait toujours la version courante
    const authRef = useRef(auth);
    authRef.current = auth;

    const httpClient = useMemo(() => {
        // Fonction async qui récupère un token frais
        const getAccessToken = async () => {
            const currentAuth = authRef.current;

            // Si pas d'utilisateur, pas de token
            if (!currentAuth.user) {
                return null;
            }

            // Vérifier si le token est expiré ou va expirer dans les 60 secondes
            const expiresAt = currentAuth.user.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const tokenExpiresSoon = expiresAt && (expiresAt - now) < 60;

            if (tokenExpiresSoon) {
                try {
                    // Rafraîchir le token silencieusement
                    const newUser = await currentAuth.signinSilent();
                    return newUser?.access_token || null;
                } catch (error) {
                    console.error("Failed to refresh token silently", error);
                    // Si le refresh échoue, rediriger vers login
                    currentAuth.signinRedirect();
                    return null;
                }
            }

            return currentAuth.user.access_token;
        };

        return createApiClient(getAccessToken, setIsLoading);
    }, []); // Pas de dépendances car on utilise authRef

    return (
        <HttpContext.Provider value={httpClient}>
            {isLoading && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        cursor: "wait"
                    }}
                >
                    <Spin size="large" />
                </div>
            )}
            {children}
        </HttpContext.Provider>
    );
}

export function useApi() {
    const context = useContext(HttpContext);
    if (!context) {
        throw new Error("useApi must be used within HttpProvider");
    }
    return context;
}
