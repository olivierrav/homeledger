// FILENAME: src/views/accounts/AccountHeaderCard.jsx
import React from "react";
import { Button, Card, Flex, Space, Typography } from "antd";
import { SettingOutlined, SyncOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { formatMoney } from "@helpers/intl";

const { Text } = Typography;


function AccountHeaderCard({
    accountId,
    accountName,
    reconciliationStatus,
    currency,
    loading,
    onSwitchToReconciliationMode
}) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    function handleReconcileClick() {
        if (onSwitchToReconciliationMode) onSwitchToReconciliationMode()
    }

    function handleEditAccountClick() {
        navigate(`/app/accounts/${accountId}/edit`);
    }

    return (
        <Card
            size="small"
            loading={loading}
            styles={{ body: { padding: "12px 16px" } }}
        >
            <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                <Text strong style={{ fontSize: 16 }}>
                    {accountName}
                </Text>

                <Flex gap={24} align="center" wrap="wrap">
                    <Space size={4}>
                        <Text type="secondary">
                            {t("accounts.details.lastReconciliationDate")}:
                        </Text>
                        <Text>
                            {reconciliationStatus?.lastReconciliationDate
                                ? dayjs(
                                    reconciliationStatus.lastReconciliationDate
                                ).format("DD/MM/YYYY")
                                : "-"}
                        </Text>
                    </Space>

                    <Space size={4}>
                        <Text type="secondary">
                            {t("accounts.details.reconciledBalance")}:
                        </Text>
                        <Text
                            type={
                                reconciliationStatus?.lastReconciliationBalance <
                                    0
                                    ? "danger"
                                    : undefined
                            }
                        >
                            {reconciliationStatus?.lastReconciliationBalance !=
                                null
                                ? formatMoney(
                                    reconciliationStatus.lastReconciliationBalance,
                                    currency
                                )
                                : "-"}
                        </Text>
                    </Space>

                    <Space size={4}>
                        <Text type="secondary">
                            {t("accounts.details.theoreticalBalance")}:
                        </Text>
                        <Text
                            strong
                            type={
                                reconciliationStatus?.theoreticalBalance < 0
                                    ? "danger"
                                    : undefined
                            }
                        >
                            {reconciliationStatus?.theoreticalBalance != null
                                ? formatMoney(
                                    reconciliationStatus.theoreticalBalance,
                                    currency
                                )
                                : "-"}
                        </Text>
                    </Space>

                    <Space size={8}>
                        <Button
                            type="primary"
                            size="small"
                            icon={<SyncOutlined />}
                            onClick={handleReconcileClick}
                            disabled={!accountId}
                        >
                            {t("accounts.actions.reconcile")}
                        </Button>
                        <Button
                            size="small"
                            icon={<SettingOutlined />}
                            onClick={handleEditAccountClick}
                            disabled={!accountId}
                        />
                    </Space>
                </Flex>
            </Flex>
        </Card>
    );
}

export default AccountHeaderCard;