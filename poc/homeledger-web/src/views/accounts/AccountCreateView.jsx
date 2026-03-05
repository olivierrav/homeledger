// FILENAME: src/views/accounts/AccountCreateView.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    notification
} from "antd";

import { useApi } from "@context/HttpProvider";
import logger from "@logger";
import { useUser } from "@context/UserContext";
import { useTranslation } from "react-i18next";
import { useSafeRequest } from "@hooks/useSafeRequest";

const { Option } = Select;

function AccountCreateView() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const api = useApi();
    const navigate = useNavigate();
    const { reloadAccounts } = useUser();
    const [loading, setLoading] = useState(false);
    const safeRequest = useSafeRequest();

    function handleSubmit(values) {
        safeRequest(api.createAccount({
            name: values.name?.trim(),
            bankName: values.bankName ? values.bankName.trim() : null,
            accountNumber: values.accountNumber ? values.accountNumber.trim() : null,
            type: values.type,
            interestRate:
                values.interestRate === undefined || values.interestRate === null
                    ? null
                    : values.interestRate,
            initialBalance: values.initialBalance
        }),

            async (error) => {

                notification.error({
                    title: t("errors.creatingAccount"),
                    description: error.message || t("errors.unknownError")
                });
            },
            async () => {
                notification.success({
                    title: t("accounts.createSuccessTitle"),
                    description: t("accounts.createSuccessDescription")
                });
                if (typeof reloadAccounts === "function") {
                    reloadAccounts();
                }
                navigate("/");
            })




    }

    function handleCancel() {
        navigate("/accounts");
    }

    return (
        <div style={{ maxWidth: 640, margin: "32px auto" }}>
            <Card title={t("accounts.createTitle")} bordered>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        type: "current",
                        initialBalance: 0
                    }}
                    autoComplete="off"
                >
                    <Form.Item
                        label={t("accounts.fields.name")}
                        name="name"
                        rules={[
                            { required: true, message: t("accounts.validation.nameRequired") },
                            {
                                validator: (_, value) => {
                                    if (value && value.trim().length === 0) {
                                        return Promise.reject(
                                            new Error(t("accounts.validation.nameNotEmpty"))
                                        );
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder={t("accounts.placeholders.name")} />
                    </Form.Item>

                    <Form.Item
                        label={t("accounts.fields.bankName")}
                        name="bankName"
                    >
                        <Input placeholder={t("accounts.placeholders.bankName")} />
                    </Form.Item>

                    <Form.Item
                        label={t("accounts.fields.accountNumber")}
                        name="accountNumber"
                    >
                        <Input placeholder={t("accounts.placeholders.accountNumber")} />
                    </Form.Item>

                    <Form.Item
                        label={t("accounts.fields.type")}
                        name="type"
                        rules={[{ required: true, message: t("accounts.validation.typeRequired") }]}
                    >
                        <Select>
                            <Option value="current">{t("accounts.types.current")}</Option>
                            <Option value="savings">{t("accounts.types.savings")}</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={t("accounts.fields.interestRate")}
                        name="interestRate"
                        tooltip={t("accounts.tooltips.interestRate")}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.01}
                            min={0}
                            max={100}
                            placeholder={t("accounts.placeholders.interestRate")}
                        />
                    </Form.Item>

                    <Form.Item
                        label={t("accounts.fields.initialBalance")}
                        name="initialBalance"
                        rules={[
                            {
                                required: true,
                                message: t("accounts.validation.initialBalanceRequired")
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            step={0.01}
                            min={-1000000}
                            max={100000000}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {t("accounts.actions.create")}
                            </Button>
                            <Button onClick={handleCancel} disabled={loading}>
                                {t("common.cancel")}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default AccountCreateView;