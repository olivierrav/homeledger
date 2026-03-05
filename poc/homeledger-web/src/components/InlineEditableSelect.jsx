// FILENAME: src/components/inputs/InlineEditableSelect.jsx
import React, { useState, useCallback, useMemo } from "react";
import { Select } from "antd";

/**
 * InlineEditableSelect
 *
 * Comportement:
 * - mode affichage: pas de bordure, juste le label de l'option
 * - au survol: si editable=true, curseur "pointer"
 * - au clic: passage en mode édition avec un Select AntD
 *
 * Props principales:
 * - value: valeur sélectionnée (string | number)
 * - onChange(value): callback quand la valeur change
 * - options: tableau d'options [{ value, label }] (même format que AntD)
 * - editable: bool (default true)
 * - placeholder: texte affiché si pas de valeur en mode affichage
 * - className, style: appliqués au wrapper
 * - align: "left" | "right" | "center" (affichage uniquement, default "left")
 */
function InlineEditableSelect({
    value,
    onChange,
    allowClear = false,
    options = [],
    editable = true,
    placeholder = "",
    className,
    style,
    align = "left"
}) {
    const [isEditing, setIsEditing] = useState(false);

    const handleStartEdit = useCallback(() => {
        if (!editable) return;
        setIsEditing(true);
    }, [editable]);

    const handleEndEdit = useCallback(() => {
        setIsEditing(false);
    }, []);

    const handleChange = useCallback(
        (val) => {
            if (onChange) {
                // Convertir undefined en null pour le clear
                onChange(val === undefined ? null : val);
            }
            setIsEditing(false);
        },
        [onChange],
    );

    const handleClear = useCallback(() => {
        if (onChange) {
            onChange(null);
        }
        setIsEditing(false);
    }, [onChange]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                setIsEditing(false);
            }
        },
        []
    );

    const selectedLabel = useMemo(() => {
        const match = options.find((opt) => opt.value === value);
        return match ? match.label : value;
    }, [options, value]);

    // MODE AFFICHAGE
    if (!isEditing) {
        const hasValue = value !== null && value !== undefined && value !== "";

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
                        textAlign: align,
                        color: hasValue ? "inherit" : "rgba(0,0,0,0.35)",
                        userSelect: "none"
                    }}
                >
                    {hasValue ? selectedLabel : placeholder}
                </span>
            </div>
        );
    }

    // MODE EDITION (Select)
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
            <Select
                value={value}
                onChange={handleChange}
                onClear={handleClear}
                options={options}
                allowClear={allowClear}
                autoFocus
                size="small"
                style={{ width: "100%" }}
                onBlur={handleEndEdit}
                onInputKeyDown={handleKeyDown}
            />
        </div>
    );
}

export default InlineEditableSelect;