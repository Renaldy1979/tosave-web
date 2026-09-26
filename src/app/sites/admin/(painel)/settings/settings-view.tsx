"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-shell";
import { Tabs } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import type { Page, AdminUser } from "@/lib/admin-types";
import { useApi } from "@/lib/use-api";
import { GeralTab } from "./geral-tab";
import { UsersTab } from "./users-tab";

export function SettingsView() {
  const params = useSearchParams();
  const tab = params.get("tab") === "usuarios" ? "usuarios" : "geral";

  const usersTotal = useApi("users-total", (signal) =>
    api<Page<AdminUser>>("/admin/users", { query: { limit: 1 }, signal }).then((p) => p.total ?? 0)
  );

  return (
    <>
      <PageHeader title="Configurações" breadcrumb="Sistema" />

      <Tabs
        active={tab}
        items={[
          { value: "geral", label: "Geral", href: "/settings" },
          { value: "usuarios", label: "Usuários", count: usersTotal.data, href: "/settings?tab=usuarios" },
        ]}
      />
      <div className="pt-6">{tab === "geral" ? <GeralTab /> : <UsersTab />}</div>
    </>
  );
}
