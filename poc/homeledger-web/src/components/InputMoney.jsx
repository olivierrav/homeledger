// FILENAME: src/components/InputMoney.jsx
import React from "react";
import { InputNumber } from "antd";
import { convertToMoneySymbol, formatMoney } from "@helpers/intl";

/**
 * Convertit une valeur brute en nombre.
 */
export function toMoneyNumber(raw) {
    if (raw === null || raw === undefined || raw === "") return 0;
    if (typeof raw === "number") {
        if (Number.isNaN(raw)) return 0;
        return raw;
    }
    const num = Number(String(raw).replace(",", "."));
    if (Number.isNaN(num)) return 0;
    return num;
}

/**
 * InputMoney - Composant de saisie de montants monétaires
 *
 * Props:
 * - value: valeur actuelle (number)
 * - onChange: callback appelé lors du changement de valeur
 * - currency: symbole de la devise (défaut: "EUR")
 * - placeholder: placeholder de l'input
 * - hideOnZeroValue: si true, affiche une chaîne vide quand value === 0
 * - alertOnNegativeValue: si true, affiche en rouge les valeurs négatives
 * - readOnly: si true, affiche juste la valeur formatée (pas d'input)
 * - autoFocus: focus automatique sur l'input
 * - onPressEnter: callback sur appui Entrée
 * - onBlur: callback sur perte de focus
 * - onKeyDown: callback sur appui touche
 * - style: styles CSS additionnels
 * - className: classes CSS additionnelles
 * - min: valeur minimum (défaut: undefined, pas de limite)
 * - allowNegative: si true, autorise les valeurs négatives (défaut: true)
 */
function InputMoney({
    value,
    onChange,
    currency = "EUR",
    placeholder = "",
    hideOnZeroValue = false,
    alertOnNegativeValue = false,
    readOnly = false,
    autoFocus = false,
    onPressEnter,
    onBlur,
    onKeyDown,
    style,
    className,
    min,
    allowNegative = true
}) {
    const numericValue = toMoneyNumber(value);
    const isZero = numericValue === 0;
    const isNegative = numericValue < 0;

    // Mode lecture seule (affichage)
    if (readOnly) {
        const shouldHide = hideOnZeroValue && isZero;
        const displayValue = shouldHide ? "" : formatMoney(value, currency);
        const textColor = !shouldHide && alertOnNegativeValue && isNegative
            ? "rgba(255,77,79,0.95)"
            : "inherit";

        return (
            <span
                className={className}
                style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    color: textColor,
                    ...style
                }}
            >
                {displayValue || placeholder}
            </span>
        );
    }

    // Mode édition (input)
    const handleChange = (val) => {
        if (onChange) {
            onChange(val);
        }
    };

    const inputMin = allowNegative ? min : (min !== undefined ? Math.max(0, min) : 0);

    return (
        <div
            className={className}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                width: "100%",
                ...style
            }}
        >
            <InputNumber
                value={hideOnZeroValue && isZero ? "" : value}
                onChange={handleChange}
                precision={2}
                step={0.01}
                min={inputMin}
                className="money-input"
                controls={false}
                autoFocus={autoFocus}
                autoComplete="off"
                onPressEnter={onPressEnter}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                onFocus={(e) => e.target.select()}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    paddingRight: 32
                }}
            />

            <span
                style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "rgba(0,0,0,0.45)",
                    fontSize: 12
                }}
            >
                {convertToMoneySymbol(currency)}
            </span>

            <style>
                {`
                    .money-input input {
                        text-align: right !important;
                        font-variant-numeric: tabular-nums;
                    }
                `}
            </style>
        </div>
    );
}

export default InputMoney;
