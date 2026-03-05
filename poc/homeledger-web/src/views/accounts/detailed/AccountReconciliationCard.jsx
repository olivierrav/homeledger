// FILENAME: src/views/accounts/AccountHeaderCard.jsx
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Flex, Space, Typography } from "antd";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@helpers/intl";

const { Text } = Typography;



function AccountReconciliationCard({
    accountId,
    accountName,
    operations,
    pointedOperationIds,
    currency,
    loading,
    currentBalance,
    newBalance,
    onExitReconciliationMode,
    onValidateReconciliation,
}) {
    const [reconciledSum, setReconciledSum] = useState(0);
    const [leftToReconcile, setLeftToReconcile] = useState(0);

    const { t } = useTranslation();

    function handleReconcileFinishedClick() {
        if (onValidateReconciliation) onValidateReconciliation()
    }

    function handleCancelReconciliation() {
        if (onExitReconciliationMode) onExitReconciliationMode()
    }

    const calculateReconciliationValues = useCallback(() => {
        let reconciledSum = 0;
        pointedOperationIds.forEach((opId) => {
            const op = operations.find((o) => String(o.id) === String(opId));
            if (op) {
                reconciledSum += op.amount;
            }
        });
        setReconciledSum(reconciledSum);

        const diffBalance = newBalance - currentBalance;
        setLeftToReconcile(diffBalance - reconciledSum);
    }, [pointedOperationIds, operations, newBalance, currentBalance]);

    useEffect(() => {
        calculateReconciliationValues();
    }, [calculateReconciliationValues, pointedOperationIds, operations, newBalance]);

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
                            {t("reconciliation.newBalance")}:
                        </Text>

                    </Space>
                    <Text>
                        {formatMoney(newBalance, currency)}
                    </Text>

                    <Space size={4}>
                        <Text type="secondary">
                            {t("reconciliation.reconciledSum")}:
                        </Text>
                        <Text

                        >
                            {formatMoney(reconciledSum, currency)}
                        </Text>
                    </Space>

                    <Space size={4}>
                        <Text type="secondary">
                            {t("reconciliation.leftToReconcile")}:
                        </Text>
                        <Text
                            strong
                            type={
                                leftToReconcile > 0
                                    ? "danger"
                                    : undefined
                            }
                        >
                            {formatMoney(leftToReconcile, currency)}
                        </Text>
                    </Space>

                    <Space size={8}>
                        <Button
                            type="danger"
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={handleCancelReconciliation}
                            disabled={!accountId}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={handleReconcileFinishedClick}
                            disabled={leftToReconcile !== 0 || !accountId}
                        >{t("validate")}</Button>
                    </Space>
                </Flex>
            </Flex>
        </Card >
    );
}

export default AccountReconciliationCard;