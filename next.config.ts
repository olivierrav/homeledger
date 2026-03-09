import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { resolve } from "path";

// Ensure Node.js trusts mkcert CA for local HTTPS (Keycloak, etc.)
if (!process.env.NODE_EXTRA_CA_CERTS) {
  process.env.NODE_EXTRA_CA_CERTS = resolve("certificates/mkcert-rootCA.pem");
}

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Disable React Compiler for now (requires babel-plugin-react-compiler)
  // experimental: {
  //   reactCompiler: true,
  // },
};

export default withNextIntl(nextConfig);
