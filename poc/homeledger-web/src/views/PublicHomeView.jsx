// FILENAME: src/views/PublicHomeView.jsx
import React from "react";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

export function PublicHomeView() {
    const navigate = useNavigate();
    const { t } = useTranslation("common");

    return (
        <div style={{ maxWidth: 600, margin: "80px auto" }}>
            <Title>{t("publicHome.title")}</Title>
            <Paragraph>{t("publicHome.description")}</Paragraph>
            <Button
                type="primary"
                size="large"
                onClick={() => navigate("/auth/login")}
            >
                {t("publicHome.loginButton")}
            </Button>
        </div>
    );
}