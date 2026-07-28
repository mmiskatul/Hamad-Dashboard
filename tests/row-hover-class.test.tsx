import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { TR } from "@/components/ui/table";
import { RowLink } from "@/components/data-table/RowLink";
import { DataTable } from "@/components/data-table/DataTable";
import { SupportQueue } from "@/features/support/SupportQueue";
import { Table, TBody, TD } from "@/components/ui/table";
import en from "@/shared/i18n/messages/en.json";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function withIntl(node: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {node}
    </NextIntlClientProvider>,
  );
}

/**
 * Verifies every interactive row component in the dashboard switches
 * to the new `--bg-row-hover` token rather than the more subtle
 * `--bg-subtle` resting state. The hover class is the only one users
 * see when they move the cursor over a row, so it must be the
 * distinct, accessible color we introduced.
 */
const HOOKS = [
  { file: "src/components/ui/table.tsx", mustMention: "bg-row-hover" },
  { file: "src/components/data-table/RowLink.tsx", mustMention: "bg-row-hover" },
  { file: "src/components/data-table/DataTable.tsx", mustMention: "bg-row-hover" },
  { file: "src/features/support/SupportQueue.tsx", mustMention: "bg-row-hover" },
];

describe("Row hover class wiring", () => {
  it("every interactive row component references --bg-row-hover", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = path.resolve(__dirname, "..");
    for (const hook of HOOKS) {
      const src = await fs.readFile(path.join(root, hook.file), "utf8");
      expect(
        src,
        `${hook.file} should reference --bg-row-hover for hover/focus`,
      ).toContain(hook.mustMention);
      expect(
        src,
        `${hook.file} should not still reference --bg-subtle for hover`,
      ).not.toMatch(/hover:bg-\[var\(--bg-subtle\)\]/);
    }
  });

  it("TR helper applies the new hover class", () => {
    const { container } = render(
      <Table>
        <TBody>
          <TR>
            <TD>x</TD>
          </TR>
        </TBody>
      </Table>,
    );
    const row = container.querySelector("tr");
    expect(row?.className).toContain("bg-row-hover");
    expect(row?.className).not.toMatch(/hover:bg-\[var\(--bg-subtle\)\]/);
  });

  it("RowLink applies the new hover class", () => {
    const { getByRole } = render(
      <Table>
        <TBody>
          <RowLink href="/admin/users/abc">
            <TD>x</TD>
          </RowLink>
        </TBody>
      </Table>,
    );
    const row = getByRole("row");
    expect(row.className).toContain("bg-row-hover");
    expect(row.className).not.toMatch(/hover:bg-\[var\(--bg-subtle\)\]/);
  });

  it("DataTable link rows apply the new hover class", () => {
    const { getByRole } = withIntl(
      <DataTable
        data={[{ id: "1", name: "Acme" }]}
        columns={[{ header: "Name", accessorKey: "name" }]}
        rowHref={(row) => `/admin/users/${row.id}`}
      />,
    );
    const row = getByRole("row", { name: /Acme/ });
    expect(row.className).toContain("bg-row-hover");
    expect(row.className).not.toMatch(/hover:bg-\[var\(--bg-subtle\)\]/);
  });

  it("SupportQueue rows apply the new hover class", () => {
    const { getByRole } = withIntl(
      <SupportQueue
        tickets={[
          {
            id: "t1",
            userId: "u1",
            subject: "Login broken",
            userEmail: "a@b.test",
            status: "open",
            priority: "high",
            assignedTo: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hasAttachment: false,
            attachmentExpiresAt: null,
            replies: [],
          },
        ]}
      />,
    );
    const row = getByRole("row", { name: /Open ticket Login broken/ });
    expect(row.className).toContain("bg-row-hover");
    expect(row.className).not.toMatch(/hover:bg-\[var\(--bg-subtle\)\]/);
  });
});
