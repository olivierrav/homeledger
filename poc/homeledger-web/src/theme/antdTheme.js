// FILENAME: src/theme/antdTheme.js
import { theme } from "antd";

const { defaultAlgorithm, darkAlgorithm } = theme;

// Palette commune
const palette = {
    primary: "#1A5274",
    primarySoft: "#E6EEF4",
    accent: "#FF7A45",
    success: "#1FA37C",
    warning: "#F59E0B",
    error: "#E53935",
    text: "#1F2933",
    textSecondary: "#6B7380",
    bgBase: "#F5F7FA",
    bgContainer: "#FFFFFF",
    borderSubtle: "#E0E4EC"
};

export const lightTheme = {
    algorithm: defaultAlgorithm,
    token: {
        colorPrimary: palette.primary,
        colorPrimaryHover: "#21658E",
        colorPrimaryActive: "#15435C",
        colorInfo: palette.primary,
        colorSuccess: palette.success,
        colorWarning: palette.warning,
        colorError: palette.error,

        colorBgBase: palette.bgBase,
        colorBgLayout: palette.bgBase,
        colorBgContainer: palette.bgContainer,
        colorBorder: palette.borderSubtle,

        colorTextBase: palette.text,
        colorText: palette.text,
        colorTextSecondary: palette.textSecondary,

        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 8,
        borderRadiusLG: 12,

        // composants plus compacts
        controlHeight: 32,
        controlHeightSM: 28,
        controlOutlineWidth: 2,
        controlOutline: palette.primarySoft,

        padding: 8,
        paddingLG: 12
    },
    components: {
        Layout: {
            headerBg: palette.primary,
            headerHeight: 56,
            bodyBg: palette.bgBase,
            siderBg: "#142534"
        },
        Button: {
            controlHeight: 32,
            controlHeightSM: 28,
            borderRadius: 999,
            paddingInline: 14,
            paddingInlineSM: 10,
            primaryShadow: "none"
        },
        Card: {
            borderRadiusLG: 16,
            boxShadow:
                "0 10px 30px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
            headerFontSize: 15,
            padding: 16
        },
        Input: {
            borderRadius: 8,
            controlHeight: 32,
            controlHeightSM: 28,
            paddingBlock: 4
        },
        Select: {
            controlHeight: 32,
            controlHeightSM: 28,
            borderRadius: 8
        },
        Table: {
            headerBg: "#F0F3F9",
            headerColor: palette.textSecondary,
            borderColor: palette.borderSubtle,
            rowHoverBg: "#F9FAFB",
            // densité réduite
            cellPaddingBlock: 6,
            cellPaddingInline: 8,
            headerCellPaddingBlock: 6,
            headerCellPaddingInline: 8
        },
        Menu: {
            itemBorderRadius: 8,
            itemActiveBg: palette.primarySoft,
            itemSelectedBg: palette.primarySoft,
            itemSelectedColor: palette.primary,
            itemPaddingInline: 16,
            itemMarginBlock: 4
        },
        Tag: {
            borderRadiusSM: 999,
            paddingInline: 8,
            paddingBlock: 2
        },
        Segmented: {
            borderRadius: 999,
            trackBg: "#F2F4F8",
            itemSelectedBg: palette.primary,
            itemSelectedColor: "#FFFFFF",
            itemHoverBg: "#DEE7F2",
            itemActiveBg: palette.primary,
            itemColor: palette.textSecondary,
            controlHeight: 28,
            padding: 2
        }
    }
};

export const darkTheme = {
    algorithm: darkAlgorithm,
    token: {
        colorPrimary: palette.accent,
        colorPrimaryHover: "#FF8F5F",
        colorPrimaryActive: "#E86331",
        colorInfo: palette.accent,
        colorSuccess: "#36CFC9",
        colorWarning: "#FBBF24",
        colorError: "#F87171",

        colorBgBase: "#050712",
        colorBgLayout: "#050712",
        colorBgContainer: "#111827",
        colorBorder: "#1F2937",

        colorTextBase: "#E5E7EB",
        colorText: "#E5E7EB",
        colorTextSecondary: "#9CA3AF",

        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 8,
        borderRadiusLG: 12,

        controlHeight: 32,
        controlHeightSM: 28,
        controlOutlineWidth: 2,
        controlOutline: "rgba(255, 122, 69, 0.24)",

        padding: 8,
        paddingLG: 12
    },
    components: {
        Layout: {
            headerBg: "#020617",
            headerHeight: 56,
            bodyBg: "#020617",
            siderBg: "#020617"
        },
        Button: {
            controlHeight: 32,
            controlHeightSM: 28,
            borderRadius: 999,
            paddingInline: 14,
            paddingInlineSM: 10
        },
        Card: {
            borderRadiusLG: 16,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
            headerFontSize: 15,
            padding: 16
        },
        Input: {
            borderRadius: 8,
            controlHeight: 32,
            controlHeightSM: 28,
            paddingBlock: 4
        },
        Select: {
            controlHeight: 32,
            controlHeightSM: 28,
            borderRadius: 8
        },
        Table: {
            headerBg: "#020617",
            headerColor: "#9CA3AF",
            borderColor: "#1F2937",
            rowHoverBg: "#111827",
            cellPaddingBlock: 6,
            cellPaddingInline: 8,
            headerCellPaddingBlock: 6,
            headerCellPaddingInline: 8
        },
        Menu: {
            itemBorderRadius: 8,
            itemActiveBg: "#111827",
            itemSelectedBg: "#111827",
            itemSelectedColor: "#F9FAFB",
            itemPaddingInline: 16,
            itemMarginBlock: 4
        },
        Tag: {
            borderRadiusSM: 999,
            paddingInline: 8,
            paddingBlock: 2
        },
        Segmented: {
            borderRadius: 999,
            trackBg: "#0B1220",
            itemSelectedBg: "#F97316",
            itemSelectedColor: "#0B1120",
            itemHoverBg: "#1F2937",
            itemActiveBg: "#F97316",
            itemColor: "#9CA3AF",
            controlHeight: 28,
            padding: 2
        }
    }
};