// FILENAME: src/context/ConnectedContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification, Spin } from "antd";

import logger from "@logger";
import { useApi } from "@context/HttpProvider";
import { useTranslation } from "react-i18next";

import { useSafeRequest } from "@hooks/useSafeRequest";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const api = useApi();

    const { t } = useTranslation()
    const safeRequest = useSafeRequest();

    const [accounts, setAccounts] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accountsError, setAccountsError] = useState(null);

    const reloadAccounts = async () => {
        return safeRequest([
            api.loadAccounts(),
            api.loadBudgets(),
            api.loadCategories()
        ],
            async () => {
                notification.error({
                    title: t("error"),
                    description: t("errors.unexpectedServerResponse")
                });
            },
            async ([accounts, budgets, categories]) => {
                if (accounts) setAccounts(accounts);
                else setAccounts([])
                if (budgets) setBudgets(budgets);
                else setBudgets([])
                if (categories) setCategories(categories);
                else setCategories([])

                return accounts || [];
            })


    }

    const updateBudgets = (newBudgets) => {
        safeRequest(
            api.updateBudgets(newBudgets),
            async () => {
                notification.error({
                    title: t("error"),
                    description: t("errors.unexpectedServerResponse")
                });
            },
            async budgets => {
                setBudgets(budgets);
            }
        )
    }

    const reloadCategories = async () => {
        return safeRequest(
            api.loadCategories(),
            async () => {
                notification.error({
                    title: t("error"),
                    description: t("errors.unexpectedServerResponse")
                });
            },
            async (categories) => {
                if (categories) setCategories(categories);
                else setCategories([]);
                return categories || [];
            }
        );
    };

    const contextValue = {
        accounts,
        budgets,
        categories,
        accountsError,
        reloadAccounts,
        reloadCategories,
        updateBudgets
    };


    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error("useUser doit être utilisé dans un User");
    }
    return ctx;
}