import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Disable React Compiler for now (requires babel-plugin-react-compiler)
  // experimental: {
  //   reactCompiler: true,
  // },
};

export default withNextIntl(nextConfig);
