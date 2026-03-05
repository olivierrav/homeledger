// FILENAME: src/auth/AuthProvider.jsx
import React from "react";
import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { oidcConfig } from "./oidcConfig";

export function AuthProvider({ children }) {
    return (
        <OidcAuthProvider {...oidcConfig}>
            {children}
        </OidcAuthProvider>
    );
}