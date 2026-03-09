"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton({ label }: { label: string }) {
  return (
    <Button
      className="w-full rounded-full"
      size="lg"
      onClick={() => signIn("keycloak", { callbackUrl: "/app" })}
    >
      {label}
    </Button>
  );
}
