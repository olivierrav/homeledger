// FILENAME: src/views/accounts/AccountBudgetsCard.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Card,
    Popconfirm,
    Spin,
    Typography
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { useApi } from "@context/HttpProvider";
import ConfigurableTable from "@components/ConfigurableTable";
import InlineEditableInput from "@components/InlineEditableInput";
import logger from "@logger";

const { Text } = Typography;

function AccountBudgetsCard({ accountId, currency, onUpdateReconciliationStatus }) {
    const { t } = useTranslation();
    const api = useApi();

    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState([]);
    const [loadingBudgetRows, setLoadingBudgetRows] = useState([]);

    // Chargement initial des budgets pour le compte
    useEffect(() => {
        if (!accountId) {
            setBudgets([]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await api.loadBudgetsForAccount(accountId);
                if (!cancelled) {
                    setBudgets(data || []);
                }
            } catch (error) {
                logger.error("Error loading budgets", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [accountId, api]);

    // Récupère la clé d'un budget (id ou clé temporaire)
    const getBudgetKey = useCallback((budget, index) => {
        return budget.id || budget._tempKey || index;
    }, []);

    // Ajouter un budget
    const handleAddBudget = useCallback(async () => {
        if (!accountId) return;

        const tempKey = `temp_${Date.now()}`;
        const newBudget = {
            _tempKey: tempKey,
            _isNew: true,
            label: t("budgets.newBudget"),
            monthlyAmount: 0,
            currentBalance: 0
        };

        setBudgets((prev) => [...prev, newBudget]);
        setLoadingBudgetRows((prev) => [...prev, tempKey]);

        try {
            const createdBudget = await api.createBudgetForAccount(accountId, {
                label: newBudget.label,
                monthlyAmount: newBudget.monthlyAmount,
                iconKey: "default",
                color: "#1890ff"
            });

            setBudgets((prev) =>
                prev.map((b) => (b._tempKey === tempKey ? createdBudget : b))
            );
            if (onUpdateReconciliationStatus) onUpdateReconciliationStatus();
        } catch (error) {
            logger.error("Error creating budget", error);
            setBudgets((prev) => prev.filter((b) => b._tempKey !== tempKey));
        } finally {
            setLoadingBudgetRows((prev) => prev.filter((k) => k !== tempKey));
        }
    }, [accountId, api, t, onUpdateReconciliationStatus]);

    // Stocker un changement en attente pour une ligne
    const handleBudgetFieldChange = useCallback(async (index, budget, field, value) => {

        setLoadingBudgetRows((prev) => [...prev, budget.id]);
        try {
            const changes = {}
            changes[field] = value;
            const updatedBudget = await api.updateBudget(
                budget.accountId,
                budget.id,
                changes
            );
            setBudgets((prev) =>
                prev.map((b, i) => (i === index ? updatedBudget : b))
            );
            if (onUpdateReconciliationStatus) onUpdateReconciliationStatus();
        } catch (error) {
            console.error("Error updating budget", error);
        } finally {
            setLoadingBudgetRows((prev) =>
                prev.filter((k) => k !== budget.id)
            );
        }

    }, []);


    // Supprimer un budget
    const handleDeleteBudget = useCallback(
        async (budget, index) => {
            if (!budget?.id) return;

            const budgetKey = getBudgetKey(budget, index);
            setLoadingBudgetRows((prev) => [...prev, budgetKey]);

            try {
                await api.deleteBudget(accountId, budget.id);
                setBudgets((prev) => prev.filter((_, i) => i !== index));
                if (onUpdateReconciliationStatus) onUpdateReconciliationStatus();
            } catch (error) {
                logger.error("Error deleting budget", error);
            } finally {
                setLoadingBudgetRows((prev) =>
                    prev.filter((k) => k !== budgetKey)
                );
            }
        },
        [accountId, api, getBudgetKey]
    );

    const budgetColumns = [
        {
            key: "label",
            title: t("budgets.columns.label"),
            render: (_, record, index) => {
                const budgetKey = getBudgetKey(record, index);
                const isRowLoading = loadingBudgetRows.includes(budgetKey);
                return (
                    <InlineEditableInput
                        value={record.label}
                        editable={!isRowLoading}
                        onChange={(val) =>
                            handleBudgetFieldChange(index, record, "label", val)
                        }
                    />
                );
            }
        },
        {
            key: "monthlyAmount",
            title: t("budgets.monthlyAmount"),
            align: "center",
            render: (_, record, index) => {
                const budgetKey = getBudgetKey(record, index);
                const isRowLoading = loadingBudgetRows.includes(budgetKey);
                return (
                    <InlineEditableInput
                        value={record.monthlyAmount}
                        type="money"
                        editable={!isRowLoading}
                        currency={currency}
                        onChange={(val) =>
                            handleBudgetFieldChange(
                                index, record,
                                "monthlyAmount",
                                val
                            )
                        }
                    />
                );
            }
        },
        {
            key: "currentBalance",
            title: t("budgets.currentBalance"),
            align: "center",
            render: (_, record, index) => {
                const budgetKey = getBudgetKey(record, index);
                const isRowLoading = loadingBudgetRows.includes(budgetKey);
                return (
                    <InlineEditableInput
                        value={record.currentBalance}
                        type="money"
                        editable={!isRowLoading}
                        currency={currency}
                        onChange={(val) =>
                            handleBudgetFieldChange(
                                index, record,
                                "currentBalance",
                                val
                            )
                        }
                    />
                );
            }
        },
        {
            key: "lastUpdated",
            title: t("budgets.lastUpdated"),
            align: "center",
            render: (_, record) => {
                const value = record.lastUpdatedAt || record.updatedAt || null;
                if (!value) return t("budgets.lastUpdatedUnknown");
                return dayjs(value).format(t("dateFormat"));
            }
        },
        {
            key: "actions",
            title: "",
            resizable: false,
            moveable: false,
            align: "center",
            width: 50,
            render: (_, record, index) => {
                const budgetKey = getBudgetKey(record, index);
                const isRowLoading = loadingBudgetRows.includes(budgetKey);

                if (isRowLoading) {
                    return (
                        <Spin
                            indicator={
                                <LoadingOutlined
                                    style={{ fontSize: 14 }}
                                    spin
                                />
                            }
                        />
                    );
                }

                return (
                    <Popconfirm
                        title={t("budgets.actions.deleteConfirmTitle")}
                        description={t(
                            "budgets.actions.deleteConfirmDescription"
                        )}
                        onConfirm={() => handleDeleteBudget(record, index)}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                        />
                    </Popconfirm>
                );
            }
        }
    ];

    return (
        <Card
            title={t("accounts.details.budgetsTitle")}
            extra={
                <Button
                    type="dashed"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleAddBudget}
                    disabled={!accountId}
                >
                    {t("add")}
                </Button>
            }
        >
            {accountId ? (
                <ConfigurableTable
                    dataSource={budgets}
                    columns={budgetColumns}
                    rowKey={(record, index) => getBudgetKey(record, index)}
                    pagination={false}
                    size="middle"
                    storageKey={`account-${accountId}-budgets-table`}
                    loadingRows={loadingBudgetRows}
                    loading={loading}
                />
            ) : (
                <Text type="secondary">
                    {t("budgets.noAccountSelected")}
                </Text>
            )}
        </Card>
    );
}

export default AccountBudgetsCard;