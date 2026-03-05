// FILENAME: src/components/modals/ConfirmModal.jsx
/* eslint-disable react-refresh/only-export-components */

import React from "react";
import { Modal } from "antd";
import {
    ExclamationCircleOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import { createModalHook } from "./createModalHook";

function ConfirmModalInner({ isVisible, options, onResolve, onCancel }) {
    const {
        title = "Confirmation",
        message = "",
        okText = "OK",
        cancelText = "Annuler",
        danger = false,
        icon = danger ? <DeleteOutlined /> : <ExclamationCircleOutlined />
    } = options || {};

    const handleOk = () => {
        onResolve(true);
    };

    const handleCancel = () => {
        onResolve(false); // convention: false = annulé / non
        onCancel();
    };

    return (
        <Modal
            open={isVisible}
            title={title}
            onOk={handleOk}
            onCancel={handleCancel}
            okText={okText}
            cancelText={cancelText}
            okButtonProps={danger ? { danger: true } : {}}
            destroyOnClose
        >
            <div style={{ display: "flex", gap: 12 }}>
                <div style={{ fontSize: 20, marginTop: 2 }}>{icon}</div>
                <div style={{ lineHeight: 1.5 }}>{message}</div>
            </div>
        </Modal>
    );
}

export const useConfirmModal = createModalHook(ConfirmModalInner);