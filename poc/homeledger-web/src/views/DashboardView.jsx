// FILENAME: src/views/DashboardView.jsx
import React, { useEffect } from "react";
import { Card, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useUser } from "@context/UserContext";


const { Title, Paragraph } = Typography;

export function DashboardView() {
    const auth = useAuth();
    const user = auth.user;
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    const { accounts, reloadAccounts } = useUser();


    useEffect(() => {
        const go = async () => {
            const accs = await reloadAccounts();
            if (!accs || accs.length === 0) {
                navigate("/app/accounts/new");
            }
        }
        go();
    }, []);

    const displayName =
        user?.profile?.given_name || user?.profile?.name || "utilisateur";

    return (
        <Card>
            <Title level={3}>{t("dashboard.title")}</Title>
            <Paragraph>
                {t("dashboard.welcome", { name: displayName })}
            </Paragraph>
            <Paragraph>{t("dashboard.placeholder")}</Paragraph>
        </Card>
    );
}