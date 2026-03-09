import { getTranslations } from "next-intl/server";
import { AccountForm } from "../account-form";

export default async function NewAccountPage() {
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-semibold">
        {t("accounts.createTitle")}
      </h1>
      <AccountForm />
    </div>
  );
}
