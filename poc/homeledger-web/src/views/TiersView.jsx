// FILENAME: src/views/TiersView.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Input, Popconfirm, Space, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useApi } from "@context/HttpProvider";
import { useUser } from "@context/UserContext";
import { useSafeRequest } from "@hooks/useSafeRequest";
import ConfigurableTable from "@components/ConfigurableTable";
import InlineEditableInput from "@components/InlineEditableInput";
import InlineEditableSelect from "@components/InlineEditableSelect";
import MaterialIcon from "@components/MaterialIcon";
import logger from "@logger";

function TiersView() {
  const { t } = useTranslation();
  const api = useApi();
  const { categories } = useUser();
  const safeRequest = useSafeRequest();

  const [tiers, setTiers] = useState([]);
  const [loadingRows, setLoadingRows] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Load tiers on mount (global loading via useSafeRequest)
  useEffect(() => {
    safeRequest(
      api.loadTiers(),
      (error) => {
        logger.error("Error loading tiers", error);
      },
      (data) => {
        setTiers(data || []);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get tier key (id or temp key)
  const getTierKey = useCallback((tier, index) => {
    return tier.id || tier._tempKey || index;
  }, []);

  // Add a new tier
  const handleAddTier = useCallback(async () => {
    const tempKey = `temp_${Date.now()}`;
    const newTier = {
      _tempKey: tempKey,
      name: t("tiers.newTier"),
      description: null,
      categoryId: null,
    };

    setTiers((prev) => [newTier, ...prev]);
    setLoadingRows((prev) => [...prev, tempKey]);

    try {
      const createdTier = await api.createTier({
        name: newTier.name,
        description: newTier.description,
        categoryId: newTier.categoryId,
      });

      setTiers((prev) => prev.map((t) => (t._tempKey === tempKey ? createdTier : t)));
    } catch (error) {
      logger.error("Error creating tier", error);
      setTiers((prev) => prev.filter((t) => t._tempKey !== tempKey));
    } finally {
      setLoadingRows((prev) => prev.filter((k) => k !== tempKey));
    }
  }, [api, t]);

  // Update a tier field
  const handleTierFieldChange = useCallback(
    async (index, tier, field, value) => {
      if (!tier.id) return;

      const tierKey = getTierKey(tier, index);
      setLoadingRows((prev) => [...prev, tierKey]);

      try {
        const updated = await api.updateTier(tier.id, { [field]: value });
        setTiers((prev) => prev.map((t) => (t.id === tier.id ? updated : t)));
      } catch (error) {
        logger.error("Error updating tier", error);
      } finally {
        setLoadingRows((prev) => prev.filter((k) => k !== tierKey));
      }
    },
    [api, getTierKey],
  );

  // Delete a tier
  const handleDeleteTier = useCallback(
    async (tier, index) => {
      if (!tier?.id) return;

      const tierKey = getTierKey(tier, index);
      setLoadingRows((prev) => [...prev, tierKey]);

      try {
        await api.deleteTier(tier.id);
        setTiers((prev) => prev.filter((t) => t.id !== tier.id));
      } catch (error) {
        logger.error("Error deleting tier", error);
      } finally {
        setLoadingRows((prev) => prev.filter((k) => k !== tierKey));
      }
    },
    [api, getTierKey],
  );

  // Filter tiers by search text
  const filteredTiers = searchText
    ? tiers.filter(
        (tier) =>
          tier.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          tier.description?.toLowerCase().includes(searchText.toLowerCase()),
      )
    : tiers;

  // Columns definition
  const columns = [
    {
      key: "name",
      title: t("tiers.columns.name"),
      align: "left",
      render: (_, record, index) => {
        const tierKey = getTierKey(record, index);
        const isRowLoading = loadingRows.includes(tierKey);
        return (
          <InlineEditableInput
            value={record.name}
            editable={!isRowLoading}
            onChange={(val) => handleTierFieldChange(index, record, "name", val)}
          />
        );
      },
    },
    {
      key: "description",
      title: t("tiers.columns.description"),
      align: "left",
      render: (_, record, index) => {
        const tierKey = getTierKey(record, index);
        const isRowLoading = loadingRows.includes(tierKey);
        return (
          <InlineEditableInput
            value={record.description}
            editable={!isRowLoading}
            onChange={(val) => handleTierFieldChange(index, record, "description", val)}
          />
        );
      },
    },
    {
      key: "categoryId",
      title: t("tiers.columns.defaultCategory"),
      align: "center",
      render: (_, record, index) => {
        const tierKey = getTierKey(record, index);
        const isRowLoading = loadingRows.includes(tierKey);
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
            onChange={(val) => handleTierFieldChange(index, record, "categoryId", val)}
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
        const tierKey = getTierKey(record, index);
        const isRowLoading = loadingRows.includes(tierKey);

        if (isRowLoading) {
          return <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />;
        }

        return (
          <Popconfirm
            title={t("tiers.actions.deleteConfirmTitle")}
            description={t("tiers.actions.deleteConfirmDescription")}
            onConfirm={() => handleDeleteTier(record, index)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      title={t("tiers.title")}
      extra={
        <Space>
          <Input
            placeholder={t("tiers.searchPlaceholder")}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTier}>
            {t("add")}
          </Button>
        </Space>
      }
    >
      <ConfigurableTable
        dataSource={filteredTiers}
        columns={columns}
        rowKey={(record, index) => getTierKey(record, index)}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        size="middle"
        storageKey="tiers-table"
        loadingRows={loadingRows}
      />
    </Card>
  );
}

export default TiersView;
