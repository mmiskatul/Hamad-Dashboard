import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { RowLink } from "@/components/data-table/RowLink";
import { Table, TBody, TD } from "@/components/ui/table";

describe("RowLink", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("renders the row as a clickable element", () => {
    const { getByRole } = render(
      <Table>
        <TBody>
          <RowLink href="/admin/users/abc">
            <TD>Row</TD>
          </RowLink>
        </TBody>
      </Table>,
    );
    const row = getByRole("row");
    expect(row).toHaveAttribute("tabindex", "0");
    expect(row.className).toMatch(/cursor-pointer/);
  });

  it("navigates on Enter", () => {
    const { getByRole } = render(
      <Table>
        <TBody>
          <RowLink href="/admin/users/abc">
            <TD>Row</TD>
          </RowLink>
        </TBody>
      </Table>,
    );
    fireEvent.keyDown(getByRole("row"), { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/admin/users/abc");
  });

  it("does not navigate when an inner button is clicked", () => {
    const { getByRole } = render(
      <Table>
        <TBody>
          <RowLink href="/admin/users/abc">
            <TD>
              <button type="button" aria-label="Action" onClick={() => { /* inner */ }}>Action</button>
            </TD>
          </RowLink>
        </TBody>
      </Table>,
    );
    // Simulated click on the inner button bubbles up to the row.
    // RowLink must detect the interactive descendant and skip router.push.
    fireEvent.click(getByRole("button", { name: "Action" }));
    expect(push).not.toHaveBeenCalled();
  });
});
