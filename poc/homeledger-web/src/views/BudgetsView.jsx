// FILENAME: src/views/budgets/BudgetsView.jsx
import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Table,
    Popconfirm
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useUser } from "@context/UserContext";
import ConfigurableTable from "@components/ConfigurableTable";
import InlineEditableInput from "@components/InlineEditableInput";
import InlineEditableSelect from "@components/InlineEditableSelect";

const { Option } = Select;

function BudgetsView() {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { accounts, budgets: initialBudgets, updateBudgets } = useUser();
    const [budgets, setBudgets] = useState([]);


    useEffect(() => {
        setBudgets(initialBudgets);
        form.setFieldsValue({ budgets: initialBudgets });
    }, [initialBudgets, form]);

    function handleAddBudget() {
        const newBudget = {
            id: undefined,
            accountId: accounts[0]?.id,
            label: "Budget",
            color: null,
            monthlyAmount: 100,
            currentBalance: 0,
            comment: "",
            lastMonthCredit: null
        };
        const next = [...budgets, newBudget];
        setBudgets(next);
        form.setFieldsValue({ budgets: next });
    }

    function handleRemoveBudget(index) {
        const next = budgets.filter((_, i) => i !== index);
        setBudgets(next);
        form.setFieldsValue({ budgets: next });
        setIsDirty(true);
    }

    function handleFinish(values) {
        updateBudgets(values.budgets || []);
    }

    const columns = [
        {
            key: "label",
            title: t("label"),
            align: "center",
            render: (_, record, index) => (
                <Form.Item
                    name={["budgets", index, "label"]}
                    style={{ marginBottom: 0 }}
                    rules={[
                        {
                            required: true,
                            message: t("requiredField")
                        }
                    ]}
                >
                    <InlineEditableInput />
                </Form.Item>
            )
        },
        {
            key: "account",
            align: "center",
            title: t("account"),
            render: (_, record, index) => (
                <Form.Item
                    name={["budgets", index, "accountId"]}
                    style={{ marginBottom: 0 }}
                    rules={[
                        {
                            required: true,
                            message: t("requiredField")
                        }
                    ]}
                >
                    <InlineEditableSelect
                        allowClear
                        align="center"
                        options={accounts.map((account) => ({
                            value: account.id,
                            label: account.name
                        }))}
                    />
                </Form.Item>
            )
        },
        {
            key: "monthlyAmount",
            title: t("budgets.monthlyAmount"),
            align: "center",
            render: (_, record, index) => (
                <Form.Item
                    name={["budgets", index, "monthlyAmount"]}
                    style={{ marginBottom: 0 }}
                    rules={[
                        {
                            required: true,
                            message: t("requiredField")
                        }
                    ]}
                >
                    <InlineEditableInput type="money" />
                </Form.Item>
            )
        },
        {
            key: "currentBalance",
            title: t("budgets.currentBalance"),
            align: "center",
            render: (_, record, index) => (
                <Form.Item
                    name={["budgets", index, "currentBalance"]}
                    style={{ marginBottom: 0 }}
                >
                    <InlineEditableInput type="money" />
                </Form.Item>
            )
        },
        {
            key: "lastUpdated",
            title: t("budgets.lastUpdated"),
            align: "center",
            render: (_, record) => {
                const value =
                    record.lastUpdatedAt ||
                    record.updatedAt ||
                    null;

                if (!value) {
                    return t("budgets.lastUpdatedUnknown");
                }

                return dayjs(value).format(t("dateFormat"));
            }
        },
        {
            key: "actions",
            title: "",
            resizable: false,
            moveable: false,
            align: "center",
            width: 20,
            render: (_, __, index) => (
                <Popconfirm
                    title={t("budgets.actions.deleteConfirmTitle")}
                    description={t("budgets.actions.deleteConfirmDescription")}
                    onConfirm={() => handleRemoveBudget(index)}
                >
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                    />
                </Popconfirm>
            )
        }
    ];

    return (
        <>
            <Card
                title={t("budgets.title")}
                extra={
                    <Space>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={handleAddBudget}
                        >
                            {t("add")}
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={() => form.submit()}
                        >
                            {t("save")}
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{ budgets }}
                    onValuesChange={() => setIsDirty(true)}
                >
                    <ConfigurableTable
                        dataSource={budgets}
                        columns={columns}
                        rowKey={(record, index) => record.id || index}
                        pagination={false}
                        size="middle"
                        storageKey="budgets-table"
                    />
                </Form>
            </Card>

        </>
    );
}

export default BudgetsView;