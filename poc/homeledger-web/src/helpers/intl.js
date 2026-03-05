export function formatMoney(value, currency) {
    if (value === null || value === undefined) return "";
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency || "EUR"
        }).format(value);
    } catch (e) {
        return `${value}`;
    }
}

export function convertToMoneySymbol(currency) {
    const mapSymbolToISO = {
        "EUR": "€",
        "USD": "$",
        "GBP": "£"
    };

    return mapSymbolToISO[currency] || currency || "EUR";
}