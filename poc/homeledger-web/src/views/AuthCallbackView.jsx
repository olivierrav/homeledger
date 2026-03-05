// FILENAME: src/views/AuthCallbackView.jsx
import React, { useEffect } from "react";
import { Spin, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { useTranslation } from "react-i18next";

const { Paragraph } = Typography;

export function AuthCallbackView() {
    const auth = useAuth();
    const { t } = useTranslation("common");

    useEffect(() => {
        if (auth.isAuthenticated) {
            window.location.href = "/app";
        }
    }, [auth.isAuthenticated]);

    return (
        <div style={{ marginTop: 80, textAlign: "center" }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>
                {t("auth.finalizing")}
            </Paragraph>
        </div>
    );
}