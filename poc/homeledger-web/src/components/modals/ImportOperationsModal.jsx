// FILENAME: src/components/modals/ImportOperationsModal.jsx
import React, { useState, useCallback, useMemo } from "react";
import { Modal, Upload, Table, Select, Alert, Typography, Space } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { createModalHook } from "./createModalHook";

dayjs.extend(customParseFormat);

const { Dragger } = Upload;
const { Text } = Typography;

const STORAGE_KEY = "homeledger_import_mapping";

/**
 * Generate a hash key from headers to identify similar file structures
 */
function generateHeadersKey(headers) {
    // Normalize headers: lowercase, trim, sort alphabetically
    const normalized = headers
        .map((h) => String(h || "").toLowerCase().trim())
        .filter((h) => h.length > 0)
        .sort()
        .join("|");
    return normalized;
}

/**
 * Save mapping to localStorage
 */
function saveMappingToStorage(headers, mappings) {
    try {
        const key = generateHeadersKey(headers);
        if (!key) return;

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

        // Store mapping by header name instead of index for portability
        const mappingByHeader = {};
        headers.forEach((header, index) => {
            const normalizedHeader = String(header || "").toLowerCase().trim();
            if (normalizedHeader && mappings[index] && mappings[index] !== "ignore") {
                mappingByHeader[normalizedHeader] = mappings[index];
            }
        });

        stored[key] = {
            mappingByHeader,
            savedAt: Date.now()
        };

        // Keep only last 10 mappings
        const entries = Object.entries(stored);
        if (entries.length > 10) {
            entries.sort((a, b) => (b[1].savedAt || 0) - (a[1].savedAt || 0));
            const trimmed = Object.fromEntries(entries.slice(0, 10));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        }
    } catch (e) {
        console.warn("Failed to save import mapping to localStorage", e);
    }
}

/**
 * Load mapping from localStorage if headers match
 */
function loadMappingFromStorage(headers) {
    try {
        const key = generateHeadersKey(headers);
        if (!key) return null;

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        const savedMapping = stored[key];

        if (!savedMapping || !savedMapping.mappingByHeader) return null;

        // Rebuild mapping by index from header names
        const mappings = {};
        headers.forEach((header, index) => {
            const normalizedHeader = String(header || "").toLowerCase().trim();
            if (savedMapping.mappingByHeader[normalizedHeader]) {
                mappings[index] = savedMapping.mappingByHeader[normalizedHeader];
            } else {
                mappings[index] = "ignore";
            }
        });

        return mappings;
    } catch (e) {
        console.warn("Failed to load import mapping from localStorage", e);
        return null;
    }
}

// Mapping options for columns
const MAPPING_OPTIONS = [
    { value: "ignore", labelKey: "import.mapping.ignore" },
    { value: "date", labelKey: "import.mapping.date" },
    { value: "description", labelKey: "import.mapping.description" },
    { value: "credit", labelKey: "import.mapping.credit" },
    { value: "debit", labelKey: "import.mapping.debit" },
    { value: "signed", labelKey: "import.mapping.signed" }
];

// Common date formats to try for auto-detection
const DATE_FORMATS = [
    "D/M/YY",
    "D-M-YY",
    "DD/MM/YYYY",
    "DD-MM-YYYY",
    "DD.MM.YYYY",
    "YYYY-MM-DD",
    "YYYY/MM/DD",
    "MM/DD/YYYY",
    "MM-DD-YYYY",
    "D/M/YYYY",
    "D-M-YYYY",
    "DD/MM/YY",
    "DD-MM-YY",
    "MM/DD/YY",
    "YYYY-MM-DD HH:mm:ss",
    "DD/MM/YYYY HH:mm:ss",
    "DD/MM/YYYY HH:mm"
];

/**
 * Detect date format from a sample of values
 */
function detectDateFormat(samples) {
    if (!Array.isArray(samples)) return detectDateFormat([samples]);
    for (const format of DATE_FORMATS) {
        const allValid = samples.every((sample) => {
            if (!sample) return true; // skip empty
            const parsed = dayjs(String(sample), format, true);
            return parsed.isValid();
        });
        if (allValid) return format;
    }
    return null;
}

/**
 * Parse a date string with a given format and return ISO string
 * The time part is used for ordering within the same day
 */
function parseDate(value, format, orderIndex) {
    if (!value) return null;

    const parsed = dayjs(String(value), format, true);
    if (!parsed.isValid()) return null;

    // Set time based on order index to preserve order within same day
    // Start at 12:00 and add 1 minute per row
    const withTime = parsed.hour(12).minute(orderIndex % 60).second(Math.floor(orderIndex / 60));
    return withTime.toISOString();
}

/**
 * Parse a money value (handles comma as decimal separator)
 */
function parseMoneyValue(value) {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "number") return value;

    // Replace comma with dot and remove spaces
    const cleaned = String(value)
        .replace(/\s/g, "")
        .replace(",", ".");

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Convert Excel serial date to JavaScript Date
 */
function excelSerialToDate(serial) {
    // Excel stores dates as number of days since 1900-01-01
    // JavaScript Date uses milliseconds since 1970-01-01
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch (30 Dec 1899)
    const msPerDay = 86400000;
    const date = new Date(excelEpoch.getTime() + serial * msPerDay);
    return date;
}

/**
 * Check if a value is an Excel serial date number
 */
function isExcelSerialDate(value) {
    // Excel dates are typically between 1 (1900-01-01) and 50000+ (year 2036+)
    return typeof value === "number" && value > 1 && value < 100000;
}

/**
 * Read file and return data as array of arrays
 */
async function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array", cellDates: true });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to array of arrays with raw values
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    raw: false,
                    dateNF: "DD/MM/YYYY"
                });

                // Convert Excel serial dates to formatted strings
                const processedData = jsonData.map((row) =>
                    row.map((cell) => {
                        // If it's an Excel serial date, convert it
                        if (isExcelSerialDate(cell)) {
                            const date = excelSerialToDate(cell);
                            return dayjs(date).format("DD/MM/YYYY");
                        }
                        return cell;
                    })
                );

                resolve(processedData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
    });
}

function ImportOperationsModal({ isVisible, options, onResolve, onCancel }) {
    const { t } = useTranslation();

    const [fileData, setFileData] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [columnMappings, setColumnMappings] = useState({});
    const [detectedDateFormat, setDetectedDateFormat] = useState(null);
    const [error, setError] = useState(null);

    // Reset state when modal opens/closes
    const resetState = useCallback(() => {
        setFileData(null);
        setHeaders([]);
        setPreviewRows([]);
        setColumnMappings({});
        setDetectedDateFormat(null);
        setError(null);
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback(async (file) => {
        setError(null);

        try {
            const data = await readFile(file);

            if (!data || data.length < 2) {
                setError(t("import.errors.emptyFile"));
                return false;
            }

            const headerRow = data[0];
            const dataRows = data.slice(1);

            setFileData(data);
            setHeaders(headerRow);
            setPreviewRows(dataRows.slice(0, 5)); // Preview first 5 rows

            // Try to load saved mapping, otherwise initialize to "ignore"
            const savedMappings = loadMappingFromStorage(headerRow);
            if (savedMappings) {
                setColumnMappings(savedMappings);

                // Detect date format if a date column is mapped
                const dateColIndex = Object.keys(savedMappings).find(
                    (k) => savedMappings[k] === "date"
                );
                if (dateColIndex !== undefined) {
                    const samples = dataRows.slice(0, 10).map((row) => row[dateColIndex]);
                    const format = detectDateFormat(samples);
                    if (format) {
                        setDetectedDateFormat(format);
                    }
                }
            } else {
                const initialMappings = {};
                headerRow.forEach((_, index) => {
                    initialMappings[index] = "ignore";
                });
                setColumnMappings(initialMappings);
            }
        } catch (err) {
            setError(t("import.errors.readError"));
            console.error("Error reading file:", err);
        }

        return false; // Prevent default upload behavior
    }, [t]);

    // Handle mapping change for a column
    const handleMappingChange = useCallback((columnIndex, value) => {
        setColumnMappings((prev) => ({
            ...prev,
            [columnIndex]: value
        }));

        // If date column is selected, try to detect format
        if (value === "date" && fileData) {
            const dataRows = fileData.slice(1);
            const samples = dataRows.slice(0, 10).map((row) => row[columnIndex]);
            const format = detectDateFormat(samples);
            if (format) {
                setDetectedDateFormat(format);
            }
        }
    }, [fileData]);

    // Validation: check if required mappings are present
    const validationResult = useMemo(() => {
        const mappedFields = Object.values(columnMappings);

        const hasDate = mappedFields.includes("date");
        const hasDescription = mappedFields.includes("description");
        const hasCredit = mappedFields.includes("credit");
        const hasDebit = mappedFields.includes("debit");
        const hasSigned = mappedFields.includes("signed");

        const hasAmount = hasCredit || hasDebit || hasSigned;

        const errors = [];
        if (!hasDate) errors.push(t("import.validation.missingDate"));
        if (!hasDescription) errors.push(t("import.validation.missingDescription"));
        if (!hasAmount) errors.push(t("import.validation.missingAmount"));

        // Check for conflicting amount mappings
        if ((hasCredit || hasDebit) && hasSigned) {
            errors.push(t("import.validation.conflictingAmount"));
        }

        return {
            isValid: hasDate && hasDescription && hasAmount && !((hasCredit || hasDebit) && hasSigned),
            errors
        };
    }, [columnMappings, t]);

    // Process and return operations
    const handleOk = useCallback(() => {
        if (!fileData || !validationResult.isValid) return;

        const dataRows = fileData.slice(1);

        // Find column indices for each mapping
        const dateColIndex = Object.keys(columnMappings).find(
            (k) => columnMappings[k] === "date"
        );
        const descColIndex = Object.keys(columnMappings).find(
            (k) => columnMappings[k] === "description"
        );
        const creditColIndex = Object.keys(columnMappings).find(
            (k) => columnMappings[k] === "credit"
        );
        const debitColIndex = Object.keys(columnMappings).find(
            (k) => columnMappings[k] === "debit"
        );
        const signedColIndex = Object.keys(columnMappings).find(
            (k) => columnMappings[k] === "signed"
        );

        const operations = dataRows
            .map((row, rowIndex) => {
                // Parse date
                const dateValue = row[dateColIndex];

                const date = parseDate(dateValue, detectedDateFormat, rowIndex);

                if (!date) return null; // Skip invalid dates

                // Get description
                const description = String(row[descColIndex] || "").trim();

                // Calculate amount
                let amount = 0;
                if (signedColIndex !== undefined) {
                    amount = parseMoneyValue(row[signedColIndex]);
                } else {
                    const credit = creditColIndex !== undefined
                        ? parseMoneyValue(row[creditColIndex])
                        : 0;
                    const debit = debitColIndex !== undefined
                        ? parseMoneyValue(row[debitColIndex])
                        : 0;

                    // Credit is positive, debit is negative
                    amount = credit - Math.abs(debit);
                }

                return {
                    dateTime: date,
                    description,
                    amount
                };
            })
            .filter((op) => op !== null && op.description);

        // Save mapping to localStorage for future use
        saveMappingToStorage(headers, columnMappings);

        onResolve(operations);
        resetState();
    }, [fileData, headers, columnMappings, detectedDateFormat, validationResult.isValid, onResolve, resetState]);

    const handleCancel = useCallback(() => {
        onCancel();
        resetState();
    }, [onCancel, resetState]);

    // Build preview table columns
    const previewColumns = useMemo(() => {
        return headers.map((header, index) => ({
            key: index,
            title: (
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Text strong ellipsis style={{ maxWidth: 120 }}>
                        {header || `Col ${index + 1}`}
                    </Text>
                    <Select
                        size="small"
                        value={columnMappings[index] || "ignore"}
                        onChange={(value) => handleMappingChange(index, value)}
                        style={{ width: "100%" }}
                        options={MAPPING_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: t(opt.labelKey)
                        }))}
                    />
                </Space>
            ),
            dataIndex: index,
            width: 140,
            render: (value) => (
                <Text ellipsis style={{ maxWidth: 120 }}>
                    {value}
                </Text>
            )
        }));
    }, [headers, columnMappings, handleMappingChange, t]);

    // Build preview table data
    const previewData = useMemo(() => {
        return previewRows.map((row, rowIndex) => {
            const rowData = { key: rowIndex };
            row.forEach((cell, cellIndex) => {
                rowData[cellIndex] = cell;
            });
            return rowData;
        });
    }, [previewRows]);

    return (
        <Modal
            open={isVisible}
            title={t("import.title")}
            width={800}
            okText={t("import.importButton")}
            cancelText={t("cancel")}
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{ disabled: !validationResult.isValid || !fileData }}
            destroyOnClose
        >
            {!fileData ? (
                <Dragger
                    accept=".xlsx,.xls,.csv"
                    beforeUpload={handleFileSelect}
                    showUploadList={false}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t("import.dropzone.text")}</p>
                    <p className="ant-upload-hint">{t("import.dropzone.hint")}</p>
                </Dragger>
            ) : (
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    {error && <Alert type="error" message={error} />}

                    {detectedDateFormat && (
                        <Alert
                            type="info"
                            message={t("import.detectedDateFormat", { format: detectedDateFormat })}
                        />
                    )}

                    {!validationResult.isValid && validationResult.errors.length > 0 && (
                        <Alert
                            type="warning"
                            message={t("import.validation.title")}
                            description={
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {validationResult.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            }
                        />
                    )}

                    <Text type="secondary">{t("import.previewHint")}</Text>

                    <Table
                        columns={previewColumns}
                        dataSource={previewData}
                        pagination={false}
                        size="small"
                        scroll={{ x: "max-content" }}
                        bordered
                    />
                </Space>
            )}
        </Modal>
    );
}

export const useImportOperationsModal = createModalHook(ImportOperationsModal);
export default ImportOperationsModal;
