// FILENAME: src/components/Layouts/PublicLayout.jsx
import React from "react";
import { Layout } from "antd";

const { Header, Content, Footer } = Layout;

export function PublicLayout({ children }) {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ color: "#fff", fontSize: 18 }}>
                HomeLedger
            </Header>
            <Content style={{ padding: "24px" }}>{children}</Content>
            <Footer style={{ textAlign: "center" }}>
                HomeLedger © {new Date().getFullYear()}
            </Footer>
        </Layout>
    );
}