"use client";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserFilters({
  search,
  onSearchChange,
  tier,
  onTierChange,
  status,
  onStatusChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  tier: string;
  onTierChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
}) {
  const t = useTranslations("users");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="grow">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
        />
      </div>
      <Select value={tier} onValueChange={onTierChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={t("filters.tierAny")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t("filters.tierAny")}</SelectItem>
          <SelectItem value="free">{t("tier.free")}</SelectItem>
          <SelectItem value="pro">{t("tier.pro")}</SelectItem>
          <SelectItem value="business">{t("tier.business")}</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder={t("filters.statusAny")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t("filters.statusAny")}</SelectItem>
          <SelectItem value="active">{t("status.active")}</SelectItem>
          <SelectItem value="suspended">{t("status.suspended")}</SelectItem>
          <SelectItem value="grace">{t("status.grace")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
