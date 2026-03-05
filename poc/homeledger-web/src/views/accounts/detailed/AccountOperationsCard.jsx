// FILENAME: src/views/accounts/AccountOperationsCard.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Popconfirm, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { useApi } from "@context/HttpProvider";
import { useUser } from "@context/UserContext";
import ConfigurableTable from "@components/ConfigurableTable";
import InlineEditableInput from "@components/InlineEditableInput";
import InlineEditableSelect from "@components/InlineEditableSelect";
import MaterialIcon from "@components/MaterialIcon";
import logger from "@logger";

const OPERATIONS_CONTEXTUAL_MENU = [
  {
    key: "markAsPending",
    label: "operations.contextMenu.markAsPending",
  },
  {
    key: "markAsPosted",
    label: "operations.contextMenu.markAsPosted",
  },
  {
    key: "merge",
    label: "operations.contextMenu.merge",
    strict: 2,
  },
  {
    key: "delete",
    label: "operations.contextMenu.delete",
    danger: true,
  },
];

const { Text } = Typography;

const OPERATIONS_TYPES = [
  { value: "card", label: "operations.type.card" },
  { value: "transfer", label: "operations.type.transfer" },
  { value: "deposit", label: "operations.type.deposit" },
  { value: "cheque", label: "operations.type.cheque" },
  { value: "direct_debit", label: "operations.type.direct_debit" },
  { value: "other", label: "operations.type.other" },
];

function AccountOperationsCard({
  accountId,
  currency,
  mode,
  pointedOperationIds,
  operations,
  onUpdatePointedOperationIds,
  onCreateOperation,
  onDeleteOperation,
  onUpdateOperation,
  onImportOperationsFile,
}) {
  const { t } = useTranslation();
  const api = useApi();
  const { categories } = useUser();

  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState([]);
  const [loadingOperationRows, setLoadingOperationRows] = useState([]);

  useEffect(() => {
    console.log("AccountOperationsCard mode changed:", mode);
  }, [mode]);

  // Chargement initial des opérations pour le compte
  useEffect(() => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const tiers = await api.loadTiers();

        if (cancelled) return;
        setTiers(tiers || []);
      } catch (error) {
        logger.error("Error loading tiers", error);
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
  }, [accountId, mode, api]);

  // Récupère la clé d'une opération (id ou clé temporaire)
  const getOperationKey = useCallback((operation, index) => {
    return operation.id || operation._tempKey || index;
  }, []);

  // Ajouter une opération
  const handleAddOperation = useCallback(async () => {
    if (onCreateOperation) onCreateOperation();
  }, [onCreateOperation]);

  // Stocker un changement en attente pour une ligne
  const handleOperationFieldChange = useCallback(
    async (index, operation, field, value) => {
      setLoadingOperationRows((prev) => [...prev, operation.id]);
      try {
        await onUpdateOperation(index, operation, field, value);
      } finally {
        setLoadingOperationRows((prev) => prev.filter((k) => k !== operation.id));
      }
    },
    [onUpdateOperation],
  );

  // Handler spécifique pour le changement de tiers avec auto-remplissage de la catégorie
  const handleTierChange = useCallback(
    async (index, operation, tierId) => {
      setLoadingOperationRows((prev) => [...prev, operation.id]);
      try {
        await onUpdateOperation(index, operation, "tierId", tierId);

        // Si aucune catégorie n'est définie et que le tiers a une catégorie par défaut
        if (!operation.categoryId && tierId) {
          const selectedTier = tiers.find((t) => t.id === tierId);
          if (selectedTier?.categoryId) {
            await onUpdateOperation(index, operation, "categoryId", selectedTier.categoryId);
          }
        }
      } finally {
        setLoadingOperationRows((prev) => prev.filter((k) => k !== operation.id));
      }
    },
    [onUpdateOperation, tiers],
  );

  // Supprimer un operation
  const handleDeleteOperation = useCallback(
    async (operation, index) => {
      if (!operation?.id) return;

      const operationId = getOperationKey(operation, index);
      setLoadingOperationRows((prev) => [...prev, operationId]);

      try {
        await onDeleteOperation(operation.id);
      } catch (error) {
        logger.error("Error deleting operation", error);
      } finally {
        setLoadingOperationRows((prev) => prev.filter((k) => k !== operationId));
      }
    },
    [getOperationKey, onDeleteOperation],
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "default";
      case "posted":
        return "processing";
      case "pointed":
        return "success";
      default:
        return "default";
    }
  };

  const operationColumns = [
    {
      key: "status",
      title: "",
      align: "center",
      width: 60,
      resizable: false,
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        const status = record.status || "pending";
        const isPointed = status === "pointed";

        if (isPointed) {
          const shortLabel = t(`operations.status.short.${status}`, { defaultValue: "?" });
          const fullLabel = t(`operations.status.${status}`, {
            defaultValue: t("operations.status.unknown"),
          });
          return (
            <Tooltip title={fullLabel}>
              <Tag
                color={getStatusColor(status)}
                style={{ margin: 0, minWidth: 24, textAlign: "center" }}
              >
                {shortLabel}
              </Tag>
            </Tooltip>
          );
        }

        return (
          <InlineEditableSelect
            align="center"
            options={[
              { value: "pending", label: t("operations.status.short.pending") },
              { value: "posted", label: t("operations.status.short.posted") },
            ]}
            value={status}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "status", val)}
          />
        );
      },
    },
    {
      key: "dateTime",
      title: t("operations.columns.dateTime"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableInput
            type="date"
            value={record.dateTime ? dayjs(record.dateTime).format("YYYY-MM-DD") : null}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "dateTime", val)}
          />
        );
      },
    },
    {
      key: "description",
      title: t("operations.columns.label"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableInput
            value={record.description}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "description", val)}
          />
        );
      },
    },
    {
      key: "tiers",
      title: t("operations.columns.tier"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableSelect
            allowClear
            align="center"
            options={tiers.map((tier) => ({
              value: tier.id,
              label: tier.name,
            }))}
            value={record.tierId}
            editable={!isRowLoading}
            onChange={(val) => handleTierChange(index, record, val)}
          />
        );
      },
    },
    {
      key: "category",
      title: t("operations.columns.category"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableSelect
            allowClear
            align="center"
            options={categories.map((cat) => ({
              value: cat.id,
              label: (
                <span>
                  <MaterialIcon
                    icon={cat.iconKey}
                    size={16}
                    color={cat.color || "#1890ff"}
                    style={{ marginRight: 6 }}
                  />
                  {cat.name}
                </span>
              ),
            }))}
            value={record.categoryId}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "categoryId", val)}
          />
        );
      },
    },
    {
      key: "type",
      title: t("operations.columns.type"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableSelect
            allowClear
            align="center"
            options={OPERATIONS_TYPES.map((type) => ({
              value: type.value,
              label: t(type.label),
            }))}
            value={record.type}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "type", val)}
          />
        );
      },
    },
    {
      key: "debit",
      title: t("operations.columns.debit"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableInput
            type="money"
            hideOnZeroValue={true}
            currency={currency}
            value={record.debit}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "debit", val)}
          />
        );
      },
    },
    {
      key: "credit",
      title: t("operations.columns.credit"),
      align: "center",
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);
        return (
          <InlineEditableInput
            type="money"
            hideOnZeroValue={true}
            currency={currency}
            value={record.credit}
            editable={!isRowLoading}
            onChange={(val) => handleOperationFieldChange(index, record, "credit", val)}
          />
        );
      },
    },
    {
      key: "currentBalance",
      title: t("budgets.columns.currentBalance"),
      align: "center",
      render: (_, record) => {
        return (
          <InlineEditableInput
            type="money"
            currency={currency}
            alertOnNegativeValue={true}
            value={record.currentBalance}
            editable={false}
            style={{ color: "lightgray" }}
          />
        );
      },
    },
    {
      key: "actions",
      title: "",
      resizable: false,
      moveable: false,
      align: "center",
      width: 50,
      render: (_, record, index) => {
        const operationKey = getOperationKey(record, index);
        const isRowLoading = loadingOperationRows.includes(operationKey);

        if (isRowLoading) {
          return <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />;
        }

        return (
          <Popconfirm
            title={t("operation.actions.deleteConfirmTitle")}
            description={t("operation.actions.deleteConfirmDescription")}
            onConfirm={() => handleDeleteOperation(record, index)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          {" "}
          {t("accounts.details.operationsTitle")}
          {mode === "reconciliation" && (
            <Tag color="volcano" variant="outlined">
              {t("accounts.details.reconciliationMode")}
            </Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          <Button
            type="dashed"
            size="small"
            icon={<UploadOutlined />}
            onClick={onImportOperationsFile}
            disabled={!accountId}
          >
            {t("operations.actions.importFile")}
          </Button>
          <Button
            type="secondary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddOperation}
            disabled={!accountId}
          >
            {t("add")}
          </Button>
        </Space>
      }
    >
      {accountId ? (
        <>
          <ConfigurableTable
            extraLeft={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("operations.status.legend")}
              </Text>
            }
            dataSource={operations}
            columns={operationColumns}
            compact={true}
            rowKey={(record, index) => getOperationKey(record, index)}
            pagination={false}
            size="middle"
            storageKey={`account-${accountId}-operations-table`}
            loadingRows={loadingOperationRows}
            loading={loading}
            selectable={mode === "reconciliation"}
            isReconciliationMode={mode === "reconciliation"}
            selectedRowKeys={pointedOperationIds}
            onSelectChange={onUpdatePointedOperationIds}
            multiSelectMenuItems={OPERATIONS_CONTEXTUAL_MENU}
            onMultiSelectAction={(actionKey, selectedOps) => {
              logger.info("Multi-select action", { actionKey, selectedOps });
            }}
          />
        </>
      ) : (
        <Text type="secondary">{t("operations.noAccountSelected")}</Text>
      )}
    </Card>
  );
}

export default AccountOperationsCard;
