// FILENAME: src/auth/RequireAuth.jsx
import React from "react";
import { useAuth } from "react-oidc-context";
import { Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { HttpProvider } from "../context/HttpProvider";

const { Paragraph } = Typography;

export function RequireAuth({ children }) {
    const auth = useAuth();
    const { t } = useTranslation("common");

    if (auth.isLoading) {
        return (
            <div style={{ marginTop: 80, textAlign: "center" }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: 16 }}>
                    {t("auth.checkingSession")}
                </Paragraph>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        auth.signinRedirect();
        return null;
    }

    return <HttpProvider>{children}</HttpProvider>;
}