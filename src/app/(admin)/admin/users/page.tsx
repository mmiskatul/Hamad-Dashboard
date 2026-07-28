"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Plus } from "lucide-react";
import { useUsers, useCreateUser } from "@/shared/api/queries";
import { UserTable } from "@/features/users/UserTable";
import { UserFilters } from "@/features/users/UserFilters";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const users = useUsers();
  const createUser = useCreateUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("any");
  const [status, setStatus] = useState("any");

  const filtered = (users.data ?? []).filter((u) => {
    if (tier !== "any" && u.tier !== tier) return false;
    if (status !== "any" && u.status !== status) return false;
    if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleExport = () => {
    // Placeholder export handler.
    console.log("Export users", { count: filtered.length });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleExport}
            data-testid="export-users-button"
          >
            <Download size={16} aria-hidden="true" />
            {tCommon("export")}
          </Button>
          <Button
            variant="primary"
            onClick={() => setCreateOpen(true)}
            data-testid="new-user-button"
          >
            <Plus size={16} aria-hidden="true" />
            {t("primary")}
          </Button>
        </div>
      </div>
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        tier={tier}
        onTierChange={setTier}
        status={status}
        onStatusChange={setStatus}
      />
      <UserTable data={filtered} />
      <p className="text-xs text-[var(--text-secondary)]">
        {tCommon("showing")} <span className="font-medium _num">{filtered.length}</span> {tCommon("of")}{" "}
        <span className="font-medium _num">{users.data?.length ?? 0}</span>
      </p>
      <CreateUserModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (input) => {
          await createUser.mutateAsync(input);
        }}
      />
    </div>
  );
}
