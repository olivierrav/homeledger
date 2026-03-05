// FILENAME: src/components/tables/ConfigurableTable.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Table, Button, Checkbox, Popover, Space, Typography, Spin, Dropdown } from "antd";
import { SettingOutlined, MenuOutlined, LoadingOutlined } from "@ant-design/icons";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import logger from "@logger";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const DEFAULT_COLUMN_WIDTH = 150;

/* -----------------------------------------------------------
 * Header cell resizable
 * ----------------------------------------------------------- */
function ResizableTitle(props) {
  const { onResize, width, children, ...restProps } = props;

  if (!onResize) return <th {...restProps}>{children}</th>;

  const effectiveWidth = width || DEFAULT_COLUMN_WIDTH;

  return (
    <Resizable
      width={effectiveWidth}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: "col-resize",
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th
        {...restProps}
        style={{
          ...restProps.style,
          position: "relative",
          width: effectiveWidth,
        }}
      >
        {children}
      </th>
    </Resizable>
  );
}

/* -----------------------------------------------------------
 * Local storage helpers
 * ----------------------------------------------------------- */
function loadConfig(storageKey) {
  if (!storageKey) return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    logger.error(error, { source: "ConfigurableTable.loadConfig" });
    return null;
  }
}

function saveConfig(storageKey, config) {
  if (!storageKey) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(config));
  } catch (error) {
    logger.error(error, { source: "ConfigurableTable.saveConfig" });
  }
}

/* -----------------------------------------------------------
 * Main component
 * ----------------------------------------------------------- */
/**
 * Props principales:
 * - columns: colonnes AntD
 * - dataSource, rowKey, size, ...: comme Table
 * - storageKey: clé pour persister largeur / visibilité / ordre
 * - loadingRows: string[] / number[] → clés des lignes avec overlay + spinner
 *
 * Sélection (mode ancien, par la colonne "actions"):
 * - selectable: boolean
 * - selectedRowKeys: React.Key[]
 * - onSelectChange(keys: React.Key[])
 *
 * Multi-sélection + menu contextuel (mode "Excel-like"):
 * - isReconciliationMode: boolean (par défaut false)
 * - multiSelectMenuItems?: { key: string; label: React.ReactNode; limit?: number }[]
 * - onMultiSelectAction?: (actionKey: string, selectedRowKeys: React.Key[]) => void
 *
 * Si isReconciliationMode === true → pas de multi-sélection ni menu, même si
 * multiSelectMenuItems est fourni.
 */
function ConfigurableTable(props) {
  const { t } = useTranslation();

  const {
    columns,
    dataSource,
    rowKey,
    storageKey,
    size = "small",
    loadingRows = [],
    selectable = false,
    selectedRowKeys = [],
    onSelectChange,
    extraLeft,

    isReconciliationMode = false,
    multiSelectMenuItems,
    onMultiSelectAction,
    compact = false,

    ...tableProps
  } = props;

  const getRowKey = useCallback(
    (record, index) =>
      typeof rowKey === "function" ? rowKey(record, index) : (record[rowKey] ?? index),
    [rowKey],
  );

  useEffect(() => {
    if (isReconciliationMode) console.log(isReconciliationMode);
  }, [isReconciliationMode]);

  const activeMultiSelect = useMemo(() => {
    return (
      !isReconciliationMode &&
      Array.isArray(multiSelectMenuItems) &&
      multiSelectMenuItems.length > 0
    );
  }, [isReconciliationMode, multiSelectMenuItems]);

  const selectionEnabled = selectable || activeMultiSelect;

  // index de la dernière ligne "ancre" pour Shift+clic
  const lastAnchorIndexRef = useRef(null);

  /* -----------------------------------------------------------
   * Selection toggle (mode ancien: utilisé si pas de multi-select Excel)
   * ----------------------------------------------------------- */
  const handleToggleSelection = useCallback(
    (key) => {
      if (!onSelectChange) return;
      const isSelected = selectedRowKeys.includes(key);
      if (isSelected) {
        onSelectChange(selectedRowKeys.filter((k) => k !== key));
      } else {
        onSelectChange([...selectedRowKeys, key]);
      }
    },
    [selectedRowKeys, onSelectChange],
  );

  /* -----------------------------------------------------------
   * Sélection multiligne à la Excel (clic / Shift / Ctrl)
   * + clic sur une ligne déjà sélectionnée la déselectionne
   * ----------------------------------------------------------- */
  const handleMultiSelectClick = useCallback(
    (event, rowIndex) => {
      if (!onSelectChange) return;
      if (!dataSource || rowIndex == null || rowIndex < 0) return;

      const rowKeyVal = getRowKey(dataSource[rowIndex], rowIndex);
      const currentlySelected = selectedRowKeys || [];
      const alreadySelected = currentlySelected.includes(rowKeyVal);

      let nextSelected = currentlySelected;

      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isShift && lastAnchorIndexRef.current != null) {
        const anchorIndex = lastAnchorIndexRef.current;
        const start = Math.min(anchorIndex, rowIndex);
        const end = Math.max(anchorIndex, rowIndex);

        const keysInRange = [];
        for (let i = start; i <= end; i += 1) {
          keysInRange.push(getRowKey(dataSource[i], i));
        }

        const union = new Set(currentlySelected);
        keysInRange.forEach((k) => union.add(k));
        nextSelected = Array.from(union);
      } else if (isCtrl) {
        if (alreadySelected) {
          nextSelected = currentlySelected.filter((k) => k !== rowKeyVal);
        } else {
          nextSelected = [...currentlySelected, rowKeyVal];
        }
        lastAnchorIndexRef.current = rowIndex;
      } else {
        // clic simple:
        // - si la ligne est déjà sélectionnée: on la déselectionne (toggle)
        // - sinon: sélection unique de cette ligne
        if (alreadySelected) {
          nextSelected = currentlySelected.filter((k) => k !== rowKeyVal);
          if (lastAnchorIndexRef.current === rowIndex) {
            lastAnchorIndexRef.current = null;
          }
        } else {
          nextSelected = [rowKeyVal];
          lastAnchorIndexRef.current = rowIndex;
        }
      }

      onSelectChange(nextSelected);
    },
    [onSelectChange, dataSource, selectedRowKeys, getRowKey],
  );

  /* -----------------------------------------------------------
   * Column config state
   * ----------------------------------------------------------- */
  const [columnOrder, setColumnOrder] = useState(() =>
    columns.map((c) => c.key || c.dataIndex).filter(Boolean),
  );
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [columnsConfigOpen, setColumnsConfigOpen] = useState(false);

  const [draggingKey, setDraggingKey] = useState(null);
  const [dropTargetKey, setDropTargetKey] = useState(null);

  /* -----------------------------------------------------------
   * Load initial config
   * ----------------------------------------------------------- */
  useEffect(() => {
    const saved = loadConfig(storageKey);
    if (!saved) return;
    if (Array.isArray(saved.order)) setColumnOrder(saved.order);
    if (Array.isArray(saved.hidden)) setHiddenColumns(saved.hidden);
    if (saved.widths && typeof saved.widths === "object") {
      setColumnWidths(saved.widths);
    }
  }, [storageKey]);

  /* -----------------------------------------------------------
   * Persist config
   * ----------------------------------------------------------- */
  useEffect(() => {
    saveConfig(storageKey, {
      order: columnOrder,
      hidden: hiddenColumns,
      widths: columnWidths,
    });
  }, [columnOrder, hiddenColumns, columnWidths, storageKey]);

  /* -----------------------------------------------------------
   * Column helpers
   * ----------------------------------------------------------- */
  const getColKey = (col) => col.key || col.dataIndex;

  const allColumnsMap = useMemo(() => {
    const map = new Map();
    columns.forEach((col) => {
      const key = getColKey(col);
      if (key) map.set(key, col);
    });
    return map;
  }, [columns]);

  const orderedColumns = useMemo(() => {
    const keys = columnOrder.filter((k) => allColumnsMap.has(k));
    const missing = [...allColumnsMap.keys()].filter((k) => !keys.includes(k));
    return [...keys, ...missing].map((key) => allColumnsMap.get(key));
  }, [allColumnsMap, columnOrder]);

  /* -----------------------------------------------------------
   * Resize handler
   * ----------------------------------------------------------- */
  function handleResize(index) {
    return (_, { size }) => {
      const col = orderedColumns[index];
      const key = getColKey(col);
      if (!key) return;
      setColumnWidths((prev) => ({ ...prev, [key]: size.width }));
    };
  }

  /* -----------------------------------------------------------
   * Drag and Drop colonnes
   * ----------------------------------------------------------- */
  function handleDragStart(key) {
    setDraggingKey(key);
    setDropTargetKey(null);
  }

  function handleDragEnter(key) {
    if (draggingKey && draggingKey !== key) {
      setDropTargetKey(key);
    }
  }

  function handleDrop(targetKey) {
    if (!draggingKey || draggingKey === targetKey) return;

    setColumnOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggingKey);
      const to = next.indexOf(targetKey);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, draggingKey);
      return next;
    });

    setDraggingKey(null);
    setDropTargetKey(null);
  }

  function handleDragEnd() {
    setDraggingKey(null);
    setDropTargetKey(null);
  }

  /* -----------------------------------------------------------
   * Visible columns (hors colonne margin multiselect)
   * ----------------------------------------------------------- */
  const visibleUserColumns = useMemo(() => {
    return orderedColumns
      .filter((col) => !hiddenColumns.includes(getColKey(col)))
      .map((col, index) => {
        const key = getColKey(col);
        const width = columnWidths[key] || col.width || DEFAULT_COLUMN_WIDTH;

        const isActionsColumn = key === "actions";

        let columnRender = col.render;

        // Mode sélection ancien à partir de la colonne actions
        if (selectable && !activeMultiSelect && isActionsColumn) {
          columnRender = (_, record, idx) => {
            const recordKey = getRowKey(record, idx);
            const isSelected = selectedRowKeys.includes(recordKey);
            const isLoading = loadingRows.includes(recordKey);

            if (isLoading) {
              return <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />;
            }

            return (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleSelection(recordKey);
                }}
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: `2px solid ${isSelected ? "#1890ff" : "rgba(0,0,0,0.25)"}`,
                  backgroundColor: "transparent",
                }}
              >
                {isSelected && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#1890ff",
                    }}
                  />
                )}
              </span>
            );
          };
        }

        return {
          ...col,
          render: columnRender,
          width,
          onHeaderCell: () => ({
            width,
            onResize: col.resizable === false ? null : handleResize(index),
          }),
          title: (
            <div
              onDragOver={(e) => {
                if (col.moveable !== false) e.preventDefault();
              }}
              onDragEnter={() => col.moveable !== false && handleDragEnter(key)}
              onDrop={() => col.moveable !== false && handleDrop(key)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: col.align === "center" ? "center" : "flex-start",
                paddingInline: 8,
                backgroundColor: dropTargetKey === key ? "rgba(26,82,116,0.12)" : "transparent",
                borderRadius: 4,
                height: "100%",
              }}
            >
              {col.moveable !== false && (
                <span
                  draggable
                  onDragStart={() => handleDragStart(key)}
                  onDragEnd={handleDragEnd}
                  style={{
                    position: "absolute",
                    left: 4,
                    cursor: "move",
                    opacity: 0.6,
                  }}
                >
                  <MenuOutlined style={{ fontSize: 11 }} />
                </span>
              )}
              <span
                style={{
                  paddingLeft: col.moveable !== false ? 18 : 0,
                }}
              >
                {col.title}
              </span>
            </div>
          ),
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderedColumns,
    hiddenColumns,
    columnWidths,
    draggingKey,
    dropTargetKey,
    selectable,
    activeMultiSelect,
    selectedRowKeys,
    loadingRows,
    handleToggleSelection,
    getRowKey,
  ]);

  /* -----------------------------------------------------------
   * Colonne de marge multiselect (clic / Shift / Ctrl + menu contextuel)
   * ----------------------------------------------------------- */
  const multiSelectColumn = useMemo(() => {
    if (!activeMultiSelect) return null;

    const menuConfig = {
      items: (multiSelectMenuItems || []).map((item) => ({
        key: item.key,
        label: t(item.label),
        disabled:
          (typeof item.limit === "number" && selectedRowKeys.length > item.limit) ||
          (typeof item.strict === "number" && selectedRowKeys.length !== item.strict),
        danger: !!item.danger,
      })),
      onClick: ({ key }) => {
        if (onMultiSelectAction) {
          onMultiSelectAction(key, selectedRowKeys);
        }
      },
    };

    return {
      key: "_multi_select_margin",
      dataIndex: "_multi_select_margin",
      width: 32,
      fixed: "left",
      resizable: false,
      moveable: false,
      title: "",
      onHeaderCell: () => ({
        width: 32,
      }),
      render: (_, record, rowIndex) => {
        const rowKeyVal = getRowKey(record, rowIndex);
        const isSelected = selectedRowKeys.includes(rowKeyVal);
        const isLoading = loadingRows.includes(rowKeyVal);

        if (isLoading) {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
            </div>
          );
        }

        return (
          <Dropdown trigger={["contextMenu"]} menu={menuConfig}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleMultiSelectClick(e, rowIndex);
              }}
              onContextMenu={(e) => {
                if (onSelectChange && !selectedRowKeys.includes(rowKeyVal)) {
                  onSelectChange([rowKeyVal]);
                  lastAnchorIndexRef.current = rowIndex;
                }
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "stretch",
                justifyContent: "stretch",
                width: "100%",
                height: "100%",
                minHeight: 32,
              }}
            >
              <div
                style={{
                  flex: 1,
                  backgroundColor: isSelected
                    ? "rgba(24,144,255,0.25)"
                    : "var(--ant-table-header-bg, #f5f5f5)",
                  borderRight: "1px solid rgba(0,0,0,0.06)",
                }}
              />
            </div>
          </Dropdown>
        );
      },
    };
  }, [
    activeMultiSelect,
    multiSelectMenuItems,
    onMultiSelectAction,
    selectedRowKeys,
    loadingRows,
    handleMultiSelectClick,
    onSelectChange,
    getRowKey,
  ]);

  const finalColumns = useMemo(() => {
    if (!multiSelectColumn) return visibleUserColumns;
    return [multiSelectColumn, ...visibleUserColumns];
  }, [multiSelectColumn, visibleUserColumns]);

  /* -----------------------------------------------------------
   * Column settings popover
   * ----------------------------------------------------------- */
  const allKeys = useMemo(() => [...allColumnsMap.keys()], [allColumnsMap]);

  const columnsConfigContent = (
    <div style={{ minWidth: 220 }}>
      <Text strong>{t("table.columnSettingsTitle", "Colonnes affichées")}</Text>
      <div style={{ marginTop: 8 }}>
        <Checkbox.Group
          value={allKeys.filter((k) => !hiddenColumns.includes(k))}
          onChange={(keys) => {
            const invisible = allKeys.filter((k) => !keys.includes(k));
            setHiddenColumns(invisible);
          }}
        >
          <Space direction="vertical">
            {orderedColumns.map((col) => {
              const key = getColKey(col);
              return (
                <Checkbox key={key} value={key}>
                  {col.title}
                </Checkbox>
              );
            })}
          </Space>
        </Checkbox.Group>
      </div>
    </div>
  );

  /* -----------------------------------------------------------
   * Custom Row (overlay + surbrillance sélection)
   * ----------------------------------------------------------- */
  const CustomRow = (props) => {
    const { children, className, ...rest } = props;

    const rowKeyValue = props["data-row-key"];
    const isLoading = loadingRows.includes(rowKeyValue);
    const isSelected = selectionEnabled && selectedRowKeys.includes(rowKeyValue);

    const rowStyle = {
      position: "relative",
      backgroundColor: isSelected ? "rgba(24, 144, 255, 0.08)" : undefined,
    };

    return (
      <tr {...rest} className={className} style={rowStyle}>
        {children}

        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.65)",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingRight: 20,
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
          </div>
        )}
      </tr>
    );
  };

  /* -----------------------------------------------------------
   * Render
   * ----------------------------------------------------------- */
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {extraLeft || <div />}
        <Popover
          trigger="click"
          open={columnsConfigOpen}
          onOpenChange={setColumnsConfigOpen}
          content={columnsConfigContent}
        >
          <Button size="small" icon={<SettingOutlined />}>
            {t("table.columnSettingsButton", "Colonnes")}
          </Button>
        </Popover>
      </div>

      <Table
        components={{
          header: { cell: ResizableTitle },
          body: { row: CustomRow },
        }}
        columns={finalColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        size={size}
        className={`configurable-table${activeMultiSelect ? "-multiselect" : ""}`}
        {...tableProps}
      />

      <style>{`
        .configurable-table-multiselect .ant-table-tbody > tr > td {
          padding-top: ${compact ? "0" : "4px"} !important;
          padding-bottom: ${compact ? "0" : "4px"} !important;
        }
        .configurable-table-multiselect .ant-table-thead > tr > th {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
        }
        .configurable-table-multiselect .ant-table-thead > tr > th:first-child {
          padding: 0 !important;
          position: relative;
          background-color: var(--ant-table-header-bg, #f5f5f5);
        }
        .configurable-table-multiselect .ant-table-tbody > tr > td:first-child {
          padding: 0 !important;
          position: relative;
          background-color: var(--ant-table-header-bg, #f5f5f5);
        }
      `}</style>

      <style>{`
        .configurable-table .ant-table-tbody > tr > td {
          padding-top: ${compact ? "0" : "4px"} !important;
          padding-bottom: ${compact ? "0" : "4px"} !important;
        }
        .configurable-table .ant-table-thead > tr > th {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
        }
      `}</style>
    </div>
  );
}

export default ConfigurableTable;
