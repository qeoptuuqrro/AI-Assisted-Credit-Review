// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusPill } from "../../../shared/ui/StatusPill/StatusPill";
import { CreditFindingsState, CreditFindingsWorkspace } from "./CreditFindingsWorkspace";

afterEach(cleanup);

describe("CreditFindingsWorkspace", () => {
  it("keeps severity and workflow status separately visible while selecting rows", () => {
    const onSelect = vi.fn();

    render(
      <CreditFindingsWorkspace
        groups={[{
          title: "Open findings",
          items: [{
            id: "coverage",
            title: "Coverage headroom",
            summary: "Downside coverage remains close to policy.",
            icon: "chart",
            risk: { label: "Moderate risk", level: "moderate" },
            status: { label: "Needs judgment", tone: "warning" },
          }],
        }]}
        selectedId="coverage"
        onSelect={onSelect}
        previewLabel="Coverage headroom preview"
      >
        <h2>Coverage headroom</h2>
      </CreditFindingsWorkspace>,
    );

    const finding = screen.getByRole("button", { name: /Coverage headroom.*Moderate risk.*Needs judgment/ });
    expect(finding.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("complementary", { name: "Coverage headroom preview" })).toBeTruthy();

    fireEvent.click(finding);
    expect(onSelect).toHaveBeenCalledWith("coverage");
  });

  it("renders an evidence prerequisite as a finding state without inventing a finding", () => {
    render(
      <CreditFindingsState
        eyebrow="Evidence prerequisite"
        title="Findings are waiting on verified evidence"
        description="The missing forecast is a requirement—not a finding."
        icon="fileCheck"
        iconTone="warning"
        status={<StatusPill tone="warning">1 requirement</StatusPill>}
        facts={[
          { label: "Open findings", value: "0" },
          { label: "Required evidence", value: "2027 forecast" },
        ]}
        action={<button type="button">Resolve source</button>}
      />,
    );

    expect(screen.getByRole("region", { name: "Findings are waiting on verified evidence" })).toBeTruthy();
    expect(screen.getByText("1 requirement")).toBeTruthy();
    expect(screen.getByText("Open findings").nextElementSibling?.textContent).toBe("0");
    expect(screen.queryByText("Needs judgment")).toBeNull();
  });
});
