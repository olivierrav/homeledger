// FILENAME: src/views/AuthLoginView.jsx
import React, { useEffect } from "react";
import { Button, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

export function AuthLoginView() {
    const auth = useAuth();
    const { t } = useTranslation("common");

    useEffect(() => {
        if (auth.isAuthenticated) {
            window.location.href = "/app";
        }
    }, [auth.isAuthenticated]);

    const handleLogin = () => {
        auth.signinRedirect();
    };

    return (
        <div style={{ maxWidth: 600, margin: "80px auto" }}>
            <Title>{t("auth.title")}</Title>
            <Paragraph>{t("auth.description")}</Paragraph>
            <Button type="primary" onClick={handleLogin}>
                {t("auth.loginButton")}
            </Button>
        </div>
    );
}