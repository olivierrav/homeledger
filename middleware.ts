import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { authConfig } from "./lib/auth.config";

const intlMiddleware = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Auth check is handled by the `authorized` callback in auth.config.ts
  // If we reach here, the user is either authorized or on a public route

  // Apply i18n middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
