// FILENAME: src/api/http.js
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export function createApiClient(getAccessToken, onLoadingChange) {
    const instance = axios.create({
        baseURL: `${apiBaseUrl}/me`,
        timeout: 10000
    });

    let activeRequests = 0;

    instance.interceptors.request.use(async (config) => {
        activeRequests++;
        if (activeRequests === 1) {
            onLoadingChange?.(true);
        }

        const token = await getAccessToken?.();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (response) => {
            activeRequests--;
            if (activeRequests === 0) {
                onLoadingChange?.(false);
            }
            return response;
        },
        async (error) => {
            activeRequests--;
            if (activeRequests === 0) {
                onLoadingChange?.(false);
            }

            const originalRequest = error.config;

            // Si erreur 401 et qu'on n'a pas déjà retenté
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Récupérer un nouveau token (force le refresh)
                    const newToken = await getAccessToken?.();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        // Retenter la requête avec le nouveau token
                        return instance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError);
                }
            }

            return Promise.reject(error);
        }
    );


    // API simplifiée
    const api = {
        raw: instance,

        // Accounts
        loadAccounts: async () => {
            const { data } = await instance.get("/accounts");
            return data;
        },
        getAccount: async (accountId) => {
            const { data } = await instance.get(`/accounts/${accountId}`);
            return data;
        },
        createAccount: async (account) => {
            const { data } = await instance.post("/accounts", account);
            return data;
        },
        updateAccount: async (accountId, account) => {
            const { data } = await instance.put(`/accounts/${accountId}`, account);
            return data;
        },
        deleteAccount: async (accountId) => {
            await instance.delete(`/accounts/${accountId}`);
        },

        // Budgets
        loadBudgets: async () => {
            const { data } = await instance.get("/budgets");
            return data;
        },
        loadBudgetsForAccount: async (accountId) => {
            const { data } = await instance.get(`/accounts/${accountId}/budgets`);
            return data;
        },
        createBudget: async (budget) => {
            const { data } = await instance.post("/budgets", budget);
            return data;
        },
        createBudgetForAccount: async (accountId, budget) => {
            const { data } = await instance.post(`/accounts/${accountId}/budgets`, budget);
            return data;
        },
        updateBudgets: async (budgets) => {
            const { data } = await instance.put("/budgets", budgets);
            return data;
        },
        updateBudget: async (accountId, budgetId, budget) => {
            const { data } = await instance.put(`/accounts/${accountId}/budgets/${budgetId}`, budget);
            return data;
        },
        deleteBudget: async (accountId, budgetId) => {
            await instance.delete(`/accounts/${accountId}/budgets/${budgetId}`);
        },

        // Operations
        loadOperations: async (accountId, { pointed = false } = {}) => {
            const params = new URLSearchParams();
            if (pointed !== undefined) params.set("pointed", pointed);
            const query = params.toString() ? `?${params.toString()}` : "";
            const { data } = await instance.get(`/accounts/${accountId}/operations${query}`);
            return data;
        },
        createOperation: async (accountId, operation) => {
            const { data } = await instance.post(`/accounts/${accountId}/operations`, operation);
            return data;
        },
        createOperationsBulk: async (accountId, operations) => {
            const { data } = await instance.post(`/accounts/${accountId}/operations/bulk`, operations);
            return data;
        },
        updateOperation: async (accountId, operationId, operation) => {
            const { data } = await instance.put(`/accounts/${accountId}/operations/${operationId}`, operation);
            return data;
        },
        deleteOperation: async (accountId, operationId) => {
            await instance.delete(`/accounts/${accountId}/operations/${operationId}`);
        },

        // Categories
        loadCategories: async () => {
            const { data } = await instance.get("/categories");
            return data;
        },
        getCategory: async (categoryId) => {
            const { data } = await instance.get(`/categories/${categoryId}`);
            return data;
        },
        createCategory: async (category) => {
            const { data } = await instance.post("/categories", category);
            return data;
        },
        updateCategory: async (categoryId, category) => {
            const { data } = await instance.put(`/categories/${categoryId}`, category);
            return data;
        },
        deleteCategory: async (categoryId) => {
            await instance.delete(`/categories/${categoryId}`);
        },

        // Tiers
        loadTiers: async () => {
            const { data } = await instance.get("/tiers");
            return data;
        },
        getTier: async (tierId) => {
            const { data } = await instance.get(`/tiers/${tierId}`);
            return data;
        },
        createTier: async (tier) => {
            const { data } = await instance.post("/tiers", tier);
            return data;
        },
        updateTier: async (tierId, tier) => {
            const { data } = await instance.put(`/tiers/${tierId}`, tier);
            return data;
        },
        deleteTier: async (tierId) => {
            await instance.delete(`/tiers/${tierId}`);
        },

        // Reconciliation
        getReconciliationStatus: async (accountId) => {
            const { data } = await instance.get(`/accounts/${accountId}/reconciliation-status`);
            return data;
        },
        createReconciliation: async (accountId, date, amount, operationIds) => {
            const { data } = await instance.post(`/accounts/${accountId}/reconciliation`, {
                date,
                amount,
                operationIds
            });
            return data;
        }
    };

    return api;
}