// FILENAME: src/components/modals/PromptModal.jsx
/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Modal, Input, Typography, DatePicker, Space } from "antd";
import { createModalHook } from "./createModalHook";
import InputMoney from "../InputMoney";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Composant "interne" de la modale.
 * Il gère l'UI + le state local (value), mais **pas** la Promise:
 * la Promise est gérée par createModalHook.
 */
function PromptModalInner({ isVisible, options, onResolve, onCancel, }) {
    const {
        placeholder = "",
        title = "",
        defaultValue = "",
        type = "input",
        currency = "€",
        message = "",
        dateLabel = "",
        amountLabel = ""
    } = options || {};

    const [value, setValue] = useState(defaultValue || "");
    const [dateValue, setDateValue] = useState(dayjs());
    const [amountValue, setAmountValue] = useState(0);

    useEffect(() => {
        if (isVisible) {
            if (type === "date-money") {
                setDateValue(options?.defaultDate ? dayjs(options.defaultDate) : dayjs());
                setAmountValue(options?.defaultAmount ?? 0);
            } else {
                setValue(defaultValue || (type === "money" ? 0 : ""));
            }
        }
    }, [isVisible, defaultValue, type, options?.defaultDate, options?.defaultAmount]);

    const handleOk = () => {
        if (type === "date-money") {
            onResolve({
                date: dateValue ? dateValue.format("YYYY-MM-DD") : null,
                amount: amountValue
            });
        } else {
            onResolve(value);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    const commonInputProps = {
        style: { marginTop: 15 },
        placeholder,
        value,
        onChange: (e) => setValue(e.target.value)
    };

    const renderInput = () => {
        if (type === "textarea") {
            return (
                <TextArea
                    {...commonInputProps}
                    autoSize={{
                        minRows: 2,
                        maxRows: 6
                    }}
                />
            );
        }

        if (type === "money") {
            return (
                <InputMoney
                    style={{ marginTop: 15 }}
                    placeholder={placeholder}
                    value={value}
                    onChange={(val) => setValue(val)}
                    currency={currency}
                    allowNegative={options?.allowNegative ?? true}
                />
            );
        }

        if (type === "date-money") {
            return (
                <Space direction="vertical" style={{ width: "100%", marginTop: 15 }} size="middle">
                    <div>
                        {dateLabel && <Text style={{ display: "block", marginBottom: 4 }}>{dateLabel}</Text>}
                        <DatePicker
                            value={dateValue}
                            onChange={setDateValue}
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                        />
                    </div>
                    <div>
                        {amountLabel && <Text style={{ display: "block", marginBottom: 4 }}>{amountLabel}</Text>}
                        <InputMoney
                            value={amountValue}
                            onChange={setAmountValue}
                            currency={currency}
                            allowNegative={options?.allowNegative ?? true}
                            placeholder={placeholder}
                        />
                    </div>
                </Space>
            );
        }

        return <Input {...commonInputProps} />;
    };

    return (
        <Modal
            open={isVisible}
            title={title}
            width={options?.width}
            okText={options?.confirmText || "OK"}
            cancelText={options?.cancelText || "Cancel"}
            onOk={handleOk}
            onCancel={handleCancel}
            destroyOnClose
        >
            {message && <Text>{message}</Text>}
            {renderInput()}
        </Modal>
    );
}

/**
 * Hook public à utiliser partout dans l'app.
 *
 * Usage:
 *   const [askPrompt, PromptModal] = usePromptModal();
 *
 *   // dans le JSX:
 *   {PromptModal}
 *
 *   // dans une fonction async:
 *   const result = await askPrompt({
 *     title: "Titre",
 *     placeholder: "Saisissez quelque chose",
 *     defaultValue: "valeur par défaut",
 *     type: "input" // ou "textarea" ou "money" ou "date-money"
 *   });
 *
 *   // Pour un montant monétaire:
 *   const amount = await askPrompt({
 *     title: "Montant",
 *     type: "money",
 *     currency: "EUR", // optionnel, défaut "EUR"
 *     defaultValue: 0
 *   });
 *
 *   // Pour une date + montant:
 *   const result = await askPrompt({
 *     title: "Nouveau rapprochement",
 *     type: "date-money",
 *     currency: "EUR",
 *     dateLabel: "Date du rapprochement",
 *     amountLabel: "Solde",
 *     defaultDate: "2025-01-15", // optionnel, défaut aujourd'hui
 *     defaultAmount: 1000 // optionnel, défaut 0
 *   });
 *   // Retourne { date: "YYYY-MM-DD", amount: number } ou null si annulé
 */
export const usePromptModal = createModalHook(PromptModalInner);