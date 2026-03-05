// FILENAME: src/layouts/AppLayout.jsx
import React, { useState } from "react";
import { Layout, Menu, Dropdown, Avatar } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    DashboardOutlined,
    SettingOutlined,
    BookOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    TagsOutlined
} from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../theme/ThemeProvider";
import Logo from "@components/Logo";
import packageJson from "../../package.json";
import { useSettingsModal } from "@components/modals/SettingsModal";
import { useUser } from "@context/UserContext";

const { Header, Sider, Content, Footer } = Layout;
const appVersion = packageJson.version || "0.0.0";

export function AppLayout({ children }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { isDark, toggleTheme } = useThemeMode();
    const { accounts } = useUser();

    const [collapsed, setCollapsed] = useState(false);

    const [interfacePrefs, setInterfacePrefs] = useState({
        dateFormat: "DD/MM/YYYY",
        currency: "EUR"
    });

    const [openSettings, SettingsModal] = useSettingsModal();

    const onLogout = () => {
        auth.signoutRedirect();
    };

    // menu items comptes: key = /app/accounts/:id
    const accountMenuItems =
        (accounts || []).map((account) => ({
            key: `/app/accounts/${account.id}`,
            label: account.name,
            onClick: () => navigate(`/app/accounts/${account.id}`)
        }));

    const siderMenuItems = [
        {
            key: "/app",
            icon: <DashboardOutlined />,
            label: t("nav.dashboard"),
            onClick: () => navigate("/app")
        },
        {
            key: "accounts-group",
            icon: <BookOutlined />,
            label: t("nav.accounts"),
            children: accountMenuItems
        },
        {
            key: "budgets",
            icon: <ShoppingCartOutlined />,
            label: t("nav.budgets"),
            onClick: () => navigate("/app/budgets")
        },
        {
            key: "categories",
            icon: <TagsOutlined />,
            label: t("nav.categories"),
            onClick: () => navigate("/app/categories")
        },
        {
            key: "tiers",
            icon: <TeamOutlined />,
            label: t("nav.tiers"),
            onClick: () => navigate("/app/tiers")
        }
    ];

    const userName =
        auth.user?.profile?.name ||
        auth.user?.profile?.preferred_username ||
        "User";

    // sélection dynamique du menu selon l’URL
    let selectedKey = "/app";

    if (location.pathname.startsWith("/app/accounts/")) {
        const match = location.pathname.match(/^\/app\/accounts\/([^/]+)/);
        if (match && match[1]) {
            selectedKey = `/app/accounts/${match[1]}`;
        }
    } else if (location.pathname === "/app") {
        selectedKey = "/app";
    } else {
        // autres routes éventuelles plus tard
        selectedKey = location.pathname;
    }

    const handleOpenSettings = async () => {
        const result = await openSettings({
            account: {
                firstName: auth.user?.profile?.given_name || "",
                lastName: auth.user?.profile?.family_name || "",
                email: auth.user?.profile?.email || ""
            },
            interface: {
                themeMode: isDark ? "dark" : "light",
                language: i18n.language || "fr",
                dateFormat: interfacePrefs.dateFormat,
                currency: interfacePrefs.currency
            }
        });

        if (!result) return;

        const newInterface = result.interface || {};

        if (newInterface.themeMode && (newInterface.themeMode === "dark") !== isDark) {
            toggleTheme();
        }

        if (newInterface.language && newInterface.language !== i18n.language) {
            i18n.changeLanguage(newInterface.language);
        }

        setInterfacePrefs((prev) => ({
            ...prev,
            dateFormat: newInterface.dateFormat || prev.dateFormat,
            currency: newInterface.currency || prev.currency
        }));
    };

    const userMenuItems = [
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: t("nav.settings"),
            onClick: handleOpenSettings
        },
        {
            type: "divider"
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: t("nav.logout"),
            onClick: onLogout
        }
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                breakpoint="lg"
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={220}
                style={{
                    position: "sticky",
                    top: 0,
                    left: 0,
                    height: "100vh"
                }}
            >
                <div
                    style={{
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 8px"
                    }}
                >
                    {collapsed ? (
                        <Logo size={28} />
                    ) : (
                        <Logo horizontal size={32} />
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    // le groupe comptes est toujours ouvert quand le Sider n’est pas collapsed
                    openKeys={collapsed ? [] : ["accounts-group"]}
                    selectedKeys={[selectedKey]}
                    items={siderMenuItems}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        padding: "0 24px"
                    }}
                >
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={["click"]}
                    >
                        <span
                            style={{
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8
                            }}
                        >
                            <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                style={{ backgroundColor: "#FF7A45" }}
                            />
                            <span style={{ color: "#fff", fontWeight: 500 }}>
                                {userName}
                            </span>
                        </span>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 24
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minHeight: 0
                        }}
                    >
                        {children}
                    </div>
                </Content>

                <Footer
                    style={{
                        textAlign: "center",
                        fontSize: 12,
                        opacity: 0.8
                    }}
                >
                    HomeLedger © {new Date().getFullYear()} • v{appVersion}
                </Footer>

                {SettingsModal}
            </Layout>
        </Layout>
    );
}