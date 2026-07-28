"use client";
import { MoreHorizontal } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ActionCellAction = {
  label: string;
  onClick: () => void;
  tone?: "primary" | "danger" | "ghost";
  icon?: ReactNode;
};

export function ActionCell({ actions }: { actions: ActionCellAction[] }) {
  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <div className="hidden items-center gap-1 sm:flex">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            size="sm"
            variant={action.tone === "primary" ? "primary" : action.tone === "danger" ? "danger" : "ghost"}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="icon" variant="ghost" aria-label="Actions">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action) => (
              <DropdownMenuItem key={action.label} onSelect={action.onClick}>
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ClickStopper({ children }: { children: ReactNode }) {
  return <span onClick={(event) => event.stopPropagation()}>{children}</span>;
}
