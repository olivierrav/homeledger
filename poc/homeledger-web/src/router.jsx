// FILENAME: src/router.js
import { Routes, Route } from "react-router-dom";

import { PublicLayout } from "@layouts/PublicLayout";
import { AppLayout } from "@layouts/AppLayout";
import { PublicHomeView } from "@views/PublicHomeView";
import { AuthLoginView } from "@views/AuthLoginView";
import { AuthCallbackView } from "@views/AuthCallbackView";
import { DashboardView } from "@views/DashboardView";
import { RequireAuth } from "@auth/RequireAuth";
import { UserProvider } from "@context/UserContext";
import AccountsListPage from "@views/accounts/AccountsListPage"
import AccountFormPage from "@views/accounts/AccountFormPage"
import AccountDetailsView from "@views/accounts/detailed/AccountDetailsView"
import AccountCreateView from "@views/accounts/AccountCreateView"
import BudgetsView from "@views/BudgetsView";
import CategoriesView from "@views/CategoriesView";
import TiersView from "@views/TiersView";

export function AppRouter() {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PublicLayout>
                        <PublicHomeView />
                    </PublicLayout>
                }
            />
            <Route
                path="/auth/login"
                element={
                    <PublicLayout>
                        <AuthLoginView />
                    </PublicLayout>
                }
            />
            <Route
                path="/auth/callback"
                element={
                    <PublicLayout>
                        <AuthCallbackView />
                    </PublicLayout>
                }
            />
            <Route path="/app/*" element={
                <RequireAuth>
                    <UserProvider>
                        <AppLayout>
                            <Routes>
                                <Route path="/" element={<DashboardView />} />
                                <Route path="/budgets" element={<BudgetsView />} />
                                <Route path="/categories" element={<CategoriesView />} />
                                <Route path="/tiers" element={<TiersView />} />
                                <Route path="accounts" element={<AccountsListPage />} />
                                <Route path="accounts/new" element={<AccountCreateView />} />
                                <Route path="accounts/:accountId/edit" element={<AccountFormPage />} />
                                <Route path="accounts/:accountId" element={<AccountDetailsView />} />
                            </Routes>

                        </AppLayout>
                    </UserProvider>
                </RequireAuth>
            } />
        </Routes>
    );
}