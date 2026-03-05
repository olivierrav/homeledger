// FILENAME: src/components/inputs/InlineEditableInput.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Input, DatePicker } from "antd";
import dayjs from "dayjs";
import InputMoney, { toMoneyNumber, } from "./InputMoney";
import { formatMoney } from "@helpers/intl";

/**
 * InlineEditableInput
 *
 * - mode affichage : aucun input visible, juste la valeur
 * - mode édition :
 *      text     → Input AntD normal
 *      money    → InputNumber aligné à droite + currency
 *      date     → DatePicker (valeur émise en "YYYY-MM-DD")
 *      datetime → DatePicker avec time (valeur émise en ISO string)
 *
 * Options :
 * - hideOnZeroValue (false par défaut) :
 *      si true, pas en édition, type numérique (money) ET valeur = 0
 *      → on n'affiche rien (ni 0, ni symbole monétaire)
 *
 * - alertOnNegativeValue (false par défaut) :
 *      si true, pas en édition, type "money" ET valeur négative
 *      → la valeur est affichée en rouge
 */
function InlineEditableInput({
    value,
    onChange,
    editable = true,
    type = "text",
    currency = "EUR",
    placeholder = "",
    className,
    style,
    onBlur,
    dateFormat = "DD/MM/YYYY",
    dateTimeFormat = "DD/MM/YYYY HH:mm",
    hideOnZeroValue = false,
    alertOnNegativeValue = false
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [nextValue, setNextValue] = useState(value);

    const isMoney = type === "money";
    const isDate = type === "date";
    const isDateTime = type === "datetime";
    const isNumeric = isMoney; // à étendre si d'autres types numériques arrivent

    const prevIsEditingRef = React.useRef(isEditing);

    useEffect(() => {
        setNextValue(value);
    }, [value]);

    useEffect(() => {
        if (!isEditing && prevIsEditingRef.current) {
            if (onChange) {
                onChange((type === "money" ? toMoneyNumber(nextValue) : nextValue));
            }
        }
        prevIsEditingRef.current = isEditing;
    }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStartEdit = useCallback(() => {
        if (!editable) return;
        setIsEditing(true);
    }, [editable]);

    const handleEndEdit = useCallback(() => {
        setIsEditing(false);
        if (onBlur) onBlur();
    }, [onBlur]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Escape") {
            e.stopPropagation();
            setIsEditing(false);
        }
    }, []);

    const handleTextChange = useCallback((e) => {
        setNextValue(e.target.value);
    }, []);

    const handleNumberChange = useCallback((val) => {
        setNextValue(val);
    }, []);

    const handleDateChange = useCallback(
        (date) => {
            if (!date) {
                setNextValue(null);
                return;
            }
            if (isDate) {
                setNextValue(date.format("YYYY-MM-DD"));
            } else if (isDateTime) {
                setNextValue(date.toISOString());
            }
        },
        [isDate, isDateTime]
    );

    function toDayjs(val) {
        if (!val) return null;
        if (dayjs.isDayjs(val)) return val;
        const d = dayjs(val);
        return d.isValid() ? d : null;
    }

    function formatDateValue(rawValue) {
        const d = toDayjs(rawValue);
        if (!d) return "";
        return d.format(dateFormat);
    }

    function formatDateTimeValue(rawValue) {
        const d = toDayjs(rawValue);
        if (!d) return "";
        return d.format(dateTimeFormat);
    }

    function isNegativeMoneyValue(raw) {
        if (!isMoney) return false;
        const num = toMoneyNumber(raw);
        if (num === null) return false;
        return num < 0;
    }

    /* ------------------------------
     * MODE AFFICHAGE
     * ------------------------------ */
    if (!isEditing) {
        const hasValueBase =
            value !== null && value !== undefined && value !== "";

        const numericValue = isNumeric ? toMoneyNumber(value) : null;

        const isZeroForHide =
            hideOnZeroValue && isNumeric && numericValue === 0;

        const hasValue = hasValueBase && !isZeroForHide;

        const negativeMoney =
            alertOnNegativeValue &&
            isMoney &&
            !isZeroForHide &&
            isNegativeMoneyValue(value);

        let displayValue = value;

        if (!isZeroForHide) {
            if (isMoney) {
                displayValue = formatMoney(value, currency);
            } else if (isDate) {
                displayValue = formatDateValue(value);
            } else if (isDateTime) {
                displayValue = formatDateTimeValue(value);
            }
        } else {
            displayValue = "";
        }

        const textColor = hasValue
            ? negativeMoney
                ? "rgba(255,77,79,0.95)" // proche de la couleur error AntD
                : "inherit"
            : "rgba(0,0,0,0.35)";

        return (
            <div
                className={className}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    width: "100%",
                    minHeight: 32,
                    cursor: editable ? "pointer" : "default",
                    ...style
                }}
                onClick={handleStartEdit}
            >
                <span
                    style={{
                        flex: 1,
                        textAlign: isMoney ? "right" : "left",
                        fontVariantNumeric: isMoney ? "tabular-nums" : "normal",
                        color: textColor,
                        userSelect: "none"
                    }}
                >
                    {hasValue ? displayValue : placeholder}
                </span>
            </div>
        );
    }

    /* ------------------------------
     * MODE EDITION - MONEY
     * ------------------------------ */
    if (isMoney) {
        return (
            <InputMoney
                className={className}
                style={style}
                value={nextValue}
                onChange={handleNumberChange}
                currency={currency}
                hideOnZeroValue={false}
                autoFocus
                onPressEnter={handleEndEdit}
                onBlur={handleEndEdit}
                onKeyDown={handleKeyDown}
            />
        );
    }

    /* ------------------------------
     * MODE EDITION - DATE / DATETIME
     * ------------------------------ */
    if (isDate || isDateTime) {
        const pickerValue = toDayjs(nextValue);

        return (
            <div
                className={className}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    width: "100%",
                    ...style
                }}
            >
                <DatePicker
                    value={pickerValue}
                    onChange={handleDateChange}
                    autoFocus
                    size="small"
                    autoComplete="off"
                    onBlur={handleEndEdit}
                    onKeyDown={handleKeyDown}
                    showTime={isDateTime}
                    format={isDate ? dateFormat : dateTimeFormat}
                    style={{ width: "100%" }}
                    onFocus={(e) => {
                        // Sélectionner tout le texte dans l'input du DatePicker
                        const input = e.target;
                        if (input && input.select) {
                            // Utiliser setTimeout pour s'assurer que la sélection se fait après le rendu
                            setTimeout(() => input.select(), 0);
                        }
                    }}
                />
            </div>
        );
    }

    /* ------------------------------
     * MODE EDITION - TEXTE
     * ------------------------------ */
    return (
        <div
            className={className}
            style={{
                display: "inline-flex",
                alignItems: "center",
                width: "100%",
                ...style
            }}
        >
            <Input
                value={nextValue}
                onChange={handleTextChange}
                autoFocus
                autoComplete="off"
                size="small"
                onPressEnter={handleEndEdit}
                onBlur={handleEndEdit}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
            />
        </div>
    );
}

export default InlineEditableInput;