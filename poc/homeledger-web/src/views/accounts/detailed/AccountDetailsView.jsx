// FILENAME: src/views/accounts/AccountDetailsView.jsx
import { pickAll } from "ramda";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Space } from "antd";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useApi } from "@context/HttpProvider";
import { useUser } from "@context/UserContext";
import { useSafeRequest } from "@hooks/useSafeRequest";
import { usePromptModal } from "@components/modals/PromptModal";
import { useImportOperationsModal } from "@components/modals/ImportOperationsModal";

import AccountHeaderCard from "./AccountHeaderCard";
import AccountBudgetsCard from "./AccountBudgetsCard";
import AccountOperationsCard from "./AccountOperationsCard";
import AccountReconciliationCard from "./AccountReconciliationCard";

import logger from "@logger";

const formatOperation = (operation) => {
  return {
    ...operation,
    debit: operation.amount < 0 ? Math.abs(operation.amount) : 0,
    credit: operation.amount > 0 ? operation.amount : 0,
  };
};

function AccountDetailsView() {
  const { accountId } = useParams();
  const { t } = useTranslation();
  const api = useApi();
  const { accounts } = useUser();
  const safeRequest = useSafeRequest();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [reconciliationStatus, setReconciliationStatus] = useState(null);
  const [operations, setOperations] = useState([]);
  const [operationsWithBalance, setOperationsWithBalance] = useState([]);
  const [mode, setMode] = useState("view"); // "view" | "reconciliation"
  const [selectedOperationIds, setSelectedOperationIds] = useState([]);
  const [newBalance, setNewBalance] = useState(null);
  const [reconciliationDate, setReconciliationDate] = useState(null);

  const [askPrompt, _PromptModal] = usePromptModal();
  const [showImportOperationsModal, _ImportOperationsModal] = useImportOperationsModal();

  const currentAccount = useMemo(() => {
    if (!accounts || !accountId) return null;
    return accounts.find((a) => String(a.id) === String(accountId)) || null;
  }, [accounts, accountId]);

  const load = useCallback(async () => {
    setLoading(true);

    safeRequest(
      [
        api.getAccount(accountId),
        api.getReconciliationStatus(accountId),
        api.loadOperations(accountId),
      ],
      (error) => {
        logger.error("Error loading account details", error);
      },
      ([accountData, reconciliationData, operationsData]) => {
        setAccount(accountData);
        setReconciliationStatus(reconciliationData);
        setOperations(operationsData || []);
      },
      () => setLoading(false),
    );
  }, [api, accountId, safeRequest]);

  const updateReconciliationStatus = useCallback(async () => {
    if (!accountId) return;

    try {
      const status = await api.getReconciliationStatus(accountId);
      setReconciliationStatus(status);
    } catch (error) {
      logger.error("Error updating reconciliation status", error);
    }
  }, [api, accountId]);

  useEffect(() => {
    let runningBalance =
      (reconciliationStatus?.lastReconciliationBalance || 0) -
      (reconciliationStatus?.budgetBalance || 0);
    const opsWithBalance = operations
      .sort((a, b) => dayjs(a.dateTime).unix() - dayjs(b.dateTime).unix())
      .map((op) => {
        runningBalance += op.amount;
        return formatOperation({
          ...op,
          currentBalance: runningBalance,
        });
      });

    setOperationsWithBalance(opsWithBalance);
  }, [operations, reconciliationStatus]);

  useEffect(() => {
    if (!accountId) return;

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const handleSwitchToReconciliationMode = useCallback(async () => {
    const answer = await askPrompt({
      title: t("reconciliation.enterNewBalanceTitle"),
      message: t("reconciliation.enterNewBalanceMessage"),
      dateLabel: t("reconciliation.reconciliationDateLabel"),
      amountLabel: t("reconciliation.newBalanceLabel"),
      type: "date-money",

      width: 400,
    });

    if (answer !== null && answer.amount !== undefined) {
      setNewBalance(answer.amount);
      setReconciliationDate(answer.date);
      setMode("reconciliation");
      setSelectedOperationIds([]);
    }
  }, [askPrompt, t]);

  const handleValidateReconciliation = useCallback(async () => {
    safeRequest(
      api.createReconciliation(
        accountId,
        reconciliationDate || new Date().toISOString(),
        newBalance,
        selectedOperationIds,
      ),
      (error) => {
        logger.error("Error creating reconciliation", error);
      },
      async () => {
        setMode("view");
        load();
      },
    );
  }, [accountId, newBalance, selectedOperationIds, api, safeRequest, load, reconciliationDate]);

  const handleCreateOperation = useCallback(async () => {
    if (!accountId) return;

    const tempKey = `temp_${Date.now()}`;
    const newOperation = {
      _tempKey: tempKey,
      _isNew: true,
      description: t("operations.newOperation"),
      dateTime: dayjs().toISOString(),
      amount: 0,
      type: "other",
    };

    setOperations((prev) => [...prev, newOperation]);

    try {
      const createdOperation = await api.createOperation(
        accountId,
        pickAll(["description", "dateTime", "amount", "type"], newOperation),
      );

      setOperations((prev) => prev.map((b) => (b._tempKey === tempKey ? createdOperation : b)));
      updateReconciliationStatus();
    } catch (error) {
      logger.error("Error creating operation", error);
      setOperations((prev) => prev.filter((b) => b._tempKey !== tempKey));
    }
  }, [accountId, api, t, updateReconciliationStatus]);

  const handleDeleteOperation = useCallback(
    async (operationId) => {
      try {
        await api.deleteOperation(accountId, operationId);
        setOperations((prev) => prev.filter((operation) => operation.id !== operationId));
        updateReconciliationStatus();
      } catch (error) {
        logger.error("Error deleting operation", error);
      }
    },
    [accountId, api, updateReconciliationStatus],
  );

  const handleUpdateOperation = useCallback(
    async (index, operation, field, value) => {
      try {
        const changes = {};
        if (["debit", "credit"].includes(field)) {
          changes["amount"] = field === "debit" ? -value : value;
        } else changes[field] = value;

        // le changement de date est peu particulier car on utilise l'heure pour le tri. On doit donc convertir la date en datetime et regarder si il y a des operations sur le même journée, si non on met 12:00, si oui on ajoute 1 minute à la dernière opération de la journée
        if (field === "dateTime") {
          const dateOnly = dayjs(value).startOf("day");
          const operationsOnSameDay = operations
            .filter((op, i) => i !== index)
            .filter((op) => dayjs(op.dateTime).isSame(dateOnly, "day"))
            .sort((a, b) => dayjs(a.dateTime).unix() - dayjs(b.dateTime).unix());

          if (operationsOnSameDay.length === 0) {
            changes["dateTime"] = dateOnly.add(12, "hour").toISOString();
          } else {
            const lastOp = operationsOnSameDay[operationsOnSameDay.length - 1];
            changes["dateTime"] = dayjs(lastOp.dateTime).add(1, "minute").toISOString();
          }
        }

        const updatedOperation = await api.updateOperation(accountId, operation.id, changes);
        setOperations((prev) => prev.map((b, i) => (i === index ? updatedOperation : b)));
        updateReconciliationStatus();
      } catch (error) {
        logger.error("Error updating operation", error);
      }
    },
    [accountId, api, operations, updateReconciliationStatus],
  );

  const handleImportOperations = useCallback(async () => {
    const imported = await showImportOperationsModal({});

    if (!imported || imported.length === 0) return;

    const operationsToImport = (imported || []).map((op) => ({
      ...op,
      imported: true,
      status: "posted",
    }));

    safeRequest(
      api.createOperationsBulk(accountId, operationsToImport),
      (error) => {
        logger.error("Error importing operations", error);
      },
      async () => {
        load();
      },
    );
  }, [accountId, api, showImportOperationsModal, safeRequest, load]);

  const currency = account?.currency || currentAccount?.currency || "EUR";
  const accountName = account?.name || currentAccount?.name || t("accounts.details.untitled");

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {_PromptModal}
      {_ImportOperationsModal}
      {mode === "view" && (
        <AccountHeaderCard
          accountId={accountId}
          accountName={accountName}
          reconciliationStatus={reconciliationStatus}
          currency={currency}
          loading={loading}
          onSwitchToReconciliationMode={handleSwitchToReconciliationMode}
        />
      )}

      {mode === "reconciliation" && (
        <AccountReconciliationCard
          accountId={accountId}
          accountName={accountName}
          operations={operationsWithBalance}
          pointedOperationIds={selectedOperationIds}
          currency={currency}
          loading={loading}
          currentBalance={reconciliationStatus?.lastReconciliationBalance || 0}
          newBalance={newBalance}
          onExitReconciliationMode={() => setMode("view")}
          onValidateReconciliation={handleValidateReconciliation}
          onOperationsUpdated={setOperations}
          onCreateOperation={handleCreateOperation}
          onDeleteOperation={handleDeleteOperation}
          onUpdateOperation={handleUpdateOperation}
        />
      )}

      <AccountBudgetsCard
        accountId={accountId}
        currency={currency}
        onUpdateReconciliationStatus={updateReconciliationStatus}
      />

      <AccountOperationsCard
        accountId={accountId}
        currency={currency}
        mode={mode}
        operations={operationsWithBalance}
        pointedOperationIds={selectedOperationIds}
        onUpdateReconciliationStatus={updateReconciliationStatus}
        onUpdatePointedOperationIds={setSelectedOperationIds}
        onOperationsUpdated={setOperations}
        onCreateOperation={handleCreateOperation}
        onDeleteOperation={handleDeleteOperation}
        onUpdateOperation={handleUpdateOperation}
        onImportOperationsFile={handleImportOperations}
      />
    </Space>
  );
}

export default AccountDetailsView;
