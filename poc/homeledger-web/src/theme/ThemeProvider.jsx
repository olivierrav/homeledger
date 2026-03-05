// FILENAME: src/theme/ThemeProvider.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { ConfigProvider } from "antd";
import { lightTheme, darkTheme } from "./antdTheme";

const ThemeContext = createContext({
    mode: "light",
    isDark: false,
    toggleTheme: () => { },
    setMode: () => { }
});

const STORAGE_KEY = "homeledger-theme";

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState("light");

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
            setMode(stored);
            return;
        }
        const prefersDark = window.matchMedia?.(
            "(prefers-color-scheme: dark)"
        ).matches;
        setMode(prefersDark ? "dark" : "light");
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
    };

    const value = {
        mode,
        isDark: mode === "dark",
        toggleTheme,
        setMode
    };

    const antdTheme = mode === "dark" ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={value}>
            <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeMode() {
    return useContext(ThemeContext);
}