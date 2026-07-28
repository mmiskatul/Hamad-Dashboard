import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { ActionCell } from "@/components/data-table/ActionCell";

vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => (
      <button type="button" onClick={onSelect}>{children}</button>
    ),
  };
});

describe("ActionCell", () => {
  it("renders every provided action label", () => {
    const { getAllByText } = render(
      <ActionCell
        actions={[
          { label: "Open", onClick: vi.fn() },
          { label: "Suspend", tone: "danger", onClick: vi.fn() },
          { label: "Reset", tone: "ghost", onClick: vi.fn() },
        ]}
      />,
    );
    expect(getAllByText("Open").length).toBeGreaterThan(0);
    expect(getAllByText("Suspend").length).toBeGreaterThan(0);
    expect(getAllByText("Reset").length).toBeGreaterThan(0);
  });

  it("calls the selected action", () => {
    const onClick = vi.fn();
    const { getAllByText } = render(<ActionCell actions={[{ label: "Open", onClick }]} />);
    fireEvent.click(getAllByText("Open")[0]);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
