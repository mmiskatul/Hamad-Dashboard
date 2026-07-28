import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ResponsiveTable } from "@/components/data-table/ResponsiveTable";
import { Table, TBody, TD, TR } from "@/components/ui/table";

describe("ResponsiveTable", () => {
  it("renders children inside an overflow-x-auto wrapper", () => {
    const { container } = render(
      <ResponsiveTable>
        <Table>
          <TBody>
            <TR>
              <TD>Cell</TD>
            </TR>
          </TBody>
        </Table>
      </ResponsiveTable>,
    );
    const wrapper = container.querySelector(".overflow-x-auto");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector("table")).not.toBeNull();
  });
});
