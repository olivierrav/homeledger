// FILENAME: src/components/modals/SettingsModal.jsx
/* eslint-disable react-refresh/only-export-components */

import React, { useEffect } from "react";
import { Modal, Tabs, Form, Input, Button, Select, Segmented } from "antd";
import {
    LockOutlined,
    DeleteOutlined,
    BgColorsOutlined,
    GlobalOutlined,
    CalendarOutlined,
    DollarOutlined,
    SunOutlined,
    MoonOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { createModalHook } from "./createModalHook";

const { TabPane } = Tabs;

const DEFAULT_INTERFACE_SETTINGS = {
    themeMode: "light",
    language: "fr",
    dateFormat: "DD/MM/YYYY",
    currency: "EUR"
};

function SettingsModalInner({ isVisible, options, onResolve, onCancel }) {
    const { t } = useTranslation("common");

    const accountOpts = options?.account || {};
    const interfaceOpts = {
        ...DEFAULT_INTERFACE_SETTINGS,
        ...(options?.interface || {})
    };

    const [accountForm] = Form.useForm();
    const [interfaceForm] = Form.useForm();

    useEffect(() => {
        if (isVisible) {
            accountForm.setFieldsValue({
                firstName: accountOpts.firstName || "",
                lastName: accountOpts.lastName || "",
                email: accountOpts.email || ""
            });

            interfaceForm.setFieldsValue({
                themeMode: interfaceOpts.themeMode,
                language: interfaceOpts.language,
                dateFormat: interfaceOpts.dateFormat,
                currency: interfaceOpts.currency
            });
        }
    }, [isVisible, accountOpts, interfaceOpts, accountForm, interfaceForm]);

    const handleOk = async () => {
        try {
            const accountValues = await accountForm.validateFields();
            const interfaceValues = await interfaceForm.validateFields();

            onResolve({
                account: accountValues,
                interface: interfaceValues
            });
        } catch {
            // on laisse l’utilisateur corriger les erreurs de formulaire
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <Modal
            open={isVisible}
            title={t("settings.title")}
            onOk={handleOk}
            onCancel={handleCancel}
            width={720}
            destroyOnClose
        >
            <Tabs tabPosition="left" defaultActiveKey="account" style={{ minHeight: 320 }}>
                <TabPane tab={t("settings.tabs.account")} key="account">
                    <Form form={accountForm} layout="vertical">
                        <Form.Item
                            label={t("settings.account.firstName.label")}
                            name="firstName"
                            rules={[
                                {
                                    required: true,
                                    message: t("settings.account.firstName.required")
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label={t("settings.account.lastName.label")}
                            name="lastName"
                            rules={[
                                {
                                    required: true,
                                    message: t("settings.account.lastName.required")
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label={t("settings.account.email.label")}
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: t("settings.account.email.required")
                                },
                                {
                                    type: "email",
                                    message: t("settings.account.email.invalid")
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <div
                            style={{
                                marginTop: 16,
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap"
                            }}
                        >
                            <Button icon={<LockOutlined />} disabled>
                                {t("settings.account.changePassword")}
                            </Button>
                            <Button icon={<DeleteOutlined />} danger disabled>
                                {t("settings.account.deleteAccount")}
                            </Button>
                        </div>
                    </Form>
                </TabPane>

                <TabPane tab={t("settings.tabs.interface")} key="interface">
                    <Form form={interfaceForm} layout="vertical">
                        <Form.Item
                            label={t("settings.interface.theme.label")}
                            name="themeMode"
                        >
                            <Segmented
                                options={[
                                    {
                                        label: t("settings.interface.theme.light"),
                                        value: "light",
                                        icon: <SunOutlined />
                                    },
                                    {
                                        label: t("settings.interface.theme.dark"),
                                        value: "dark",
                                        icon: <MoonOutlined />
                                    }
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t("settings.interface.language.label")}
                            name="language"
                        >
                            <Select
                                options={[
                                    { value: "fr", label: t("settings.interface.language.fr") },
                                    { value: "en", label: t("settings.interface.language.en") }
                                ]}
                                suffixIcon={<GlobalOutlined />}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t("settings.interface.dateFormat.label")}
                            name="dateFormat"
                        >
                            <Select
                                options={[
                                    {
                                        value: "DD/MM/YYYY",
                                        label: t("settings.interface.dateFormat.ddmmyyyy")
                                    },
                                    {
                                        value: "MM/DD/YYYY",
                                        label: t("settings.interface.dateFormat.mmddyyyy")
                                    },
                                    {
                                        value: "YYYY-MM-DD",
                                        label: t("settings.interface.dateFormat.yyyymmdd")
                                    }
                                ]}
                                suffixIcon={<CalendarOutlined />}
                            />
                        </Form.Item>

                        <Form.Item
                            label={t("settings.interface.currency.label")}
                            name="currency"
                        >
                            <Select
                                options={[
                                    {
                                        value: "EUR",
                                        label: t("settings.interface.currency.eur")
                                    },
                                    {
                                        value: "USD",
                                        label: t("settings.interface.currency.usd")
                                    },
                                    {
                                        value: "GBP",
                                        label: t("settings.interface.currency.gbp")
                                    }
                                ]}
                                suffixIcon={<DollarOutlined />}
                            />
                        </Form.Item>
                    </Form>
                </TabPane>

                <TabPane tab={t("settings.tabs.notifications")} key="notifications">
                    <p>{t("settings.notifications.placeholder")}</p>
                </TabPane>
            </Tabs>
        </Modal>
    );
}

export const useSettingsModal = createModalHook(SettingsModalInner);