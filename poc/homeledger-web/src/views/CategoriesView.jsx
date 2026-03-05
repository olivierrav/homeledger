// FILENAME: src/views/CategoriesView.jsx
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, ColorPicker, Input, Popconfirm, Space, Spin } from "antd";
import { PlusOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useApi } from "@context/HttpProvider";
import { useUser } from "@context/UserContext";
import { useSafeRequest } from "@hooks/useSafeRequest";
import ConfigurableTable from "@components/ConfigurableTable";
import InlineEditableInput from "@components/InlineEditableInput";
import SelectIcon from "@components/SelectIcon";
import logger from "@logger";

function CategoriesView() {
  const { t } = useTranslation();
  const api = useApi();
  const { reloadCategories } = useUser();
  const safeRequest = useSafeRequest();

  const [categories, setCategories] = useState([]);
  const [loadingRows, setLoadingRows] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Load categories on mount (global loading via useSafeRequest)
  useEffect(() => {
    safeRequest(
      api.loadCategories(),
      (error) => {
        logger.error("Error loading categories", error);
      },
      (data) => {
        setCategories(data || []);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get category key (id or temp key)
  const getCategoryKey = useCallback((category, index) => {
    return category.id || category._tempKey || index;
  }, []);

  // Add a new category
  const handleAddCategory = useCallback(async () => {
    const tempKey = `temp_${Date.now()}`;
    const newCategory = {
      _tempKey: tempKey,
      name: t("categories.newCategory"),
      color: "#1890ff",
      iconKey: null,
    };

    setCategories((prev) => [newCategory, ...prev]);
    setLoadingRows((prev) => [...prev, tempKey]);

    try {
      const createdCategory = await api.createCategory({
        name: newCategory.name,
        color: newCategory.color,
        iconKey: newCategory.iconKey,
      });

      setCategories((prev) => prev.map((c) => (c._tempKey === tempKey ? createdCategory : c)));
      reloadCategories();
    } catch (error) {
      logger.error("Error creating category", error);
      setCategories((prev) => prev.filter((c) => c._tempKey !== tempKey));
    } finally {
      setLoadingRows((prev) => prev.filter((k) => k !== tempKey));
    }
  }, [api, t, reloadCategories]);

  // Update a category field
  const handleCategoryFieldChange = useCallback(
    async (index, category, field, value) => {
      if (!category.id) return;

      const categoryKey = getCategoryKey(category, index);
      setLoadingRows((prev) => [...prev, categoryKey]);

      try {
        const updated = await api.updateCategory(category.id, { [field]: value });
        setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
        reloadCategories();
      } catch (error) {
        logger.error("Error updating category", error);
      } finally {
        setLoadingRows((prev) => prev.filter((k) => k !== categoryKey));
      }
    },
    [api, getCategoryKey, reloadCategories],
  );

  // Delete a category
  const handleDeleteCategory = useCallback(
    async (category, index) => {
      if (!category?.id) return;

      const categoryKey = getCategoryKey(category, index);
      setLoadingRows((prev) => [...prev, categoryKey]);

      try {
        await api.deleteCategory(category.id);
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        reloadCategories();
      } catch (error) {
        logger.error("Error deleting category", error);
      } finally {
        setLoadingRows((prev) => prev.filter((k) => k !== categoryKey));
      }
    },
    [api, getCategoryKey, reloadCategories],
  );

  // Filter categories by search text
  const filteredCategories = searchText
    ? categories.filter((category) =>
        category.name?.toLowerCase().includes(searchText.toLowerCase())
      )
    : categories;

  // Columns definition
  const columns = [
    {
      key: "color",
      title: t("categories.columns.color"),
      align: "center",
      width: 80,
      render: (_, record, index) => {
        const categoryKey = getCategoryKey(record, index);
        const isRowLoading = loadingRows.includes(categoryKey);
        return (
          <ColorPicker
            value={record.color || "#1890ff"}
            disabled={isRowLoading}
            size="small"
            onChange={(color) => {
              const hexColor = color.toHexString();
              handleCategoryFieldChange(index, record, "color", hexColor);
            }}
          />
        );
      },
    },
    {
      key: "name",
      title: t("categories.columns.name"),
      align: "left",
      render: (_, record, index) => {
        const categoryKey = getCategoryKey(record, index);
        const isRowLoading = loadingRows.includes(categoryKey);
        return (
          <InlineEditableInput
            value={record.name}
            editable={!isRowLoading}
            onChange={(val) => handleCategoryFieldChange(index, record, "name", val)}
          />
        );
      },
    },
    {
      key: "iconKey",
      title: t("categories.columns.icon"),
      align: "center",
      width: 100,
      render: (_, record, index) => {
        const categoryKey = getCategoryKey(record, index);
        const isRowLoading = loadingRows.includes(categoryKey);
        return (
          <SelectIcon
            value={record.iconKey}
            color={record.color || "#1890ff"}
            disabled={isRowLoading}
            onChange={(val) => handleCategoryFieldChange(index, record, "iconKey", val)}
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
        const categoryKey = getCategoryKey(record, index);
        const isRowLoading = loadingRows.includes(categoryKey);

        if (isRowLoading) {
          return <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />;
        }

        return (
          <Popconfirm
            title={t("categories.actions.deleteConfirmTitle")}
            description={t("categories.actions.deleteConfirmDescription")}
            onConfirm={() => handleDeleteCategory(record, index)}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Card
      title={t("categories.title")}
      extra={
        <Space>
          <Input
            placeholder={t("categories.searchPlaceholder")}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            {t("add")}
          </Button>
        </Space>
      }
    >
      <ConfigurableTable
        dataSource={filteredCategories}
        columns={columns}
        rowKey={(record, index) => getCategoryKey(record, index)}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        size="middle"
        storageKey="categories-table"
        loadingRows={loadingRows}
      />
    </Card>
  );
}

export default CategoriesView;
