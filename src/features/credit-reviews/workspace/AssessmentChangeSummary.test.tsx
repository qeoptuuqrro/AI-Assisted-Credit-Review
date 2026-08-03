// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { evidenceRequirements } from "../workflow/evidenceWorkflow";
import { AssessmentChangeSummary } from "./AssessmentChangeSummary";

afterEach(() => cleanup());

describe("AssessmentChangeSummary flow ledger", () => {
  it("shows a changed risk as one directional conclusion", () => {
    render(<AssessmentChangeSummary context="flow" result={evidenceRequirements["customer-renewal"].result} />);

    expect(screen.getByText("Risk assessment")).toBeTruthy();
    expect(screen.getByText("Material")).toBeTruthy();
    expect(screen.getByText("Moderate")).toBeTruthy();
    expect(screen.getByText("The verified evidence changed the risk band.")).toBeTruthy();
  });

  it("states a retained conclusion once for both unchanged-risk scenarios", () => {
    for (const requirementId of ["latest-operating-results", "equipment-obligation-classification"] as const) {
      const view = render(<AssessmentChangeSummary context="flow" result={evidenceRequirements[requirementId].result} />);

      expect(screen.getAllByText(evidenceRequirements[requirementId].result.updatedRisk ?? "")).toHaveLength(1);
      expect(screen.getByText("Unchanged")).toBeTruthy();
      expect(screen.getByText("The evidence changed; the risk band did not.")).toBeTruthy();

      view.unmount();
    }
  });

  it("keeps the decision-led review sequence explicit", () => {
    const { container } = render(
      <AssessmentChangeSummary
        context="finding"
        presentation="decision-led"
        result={evidenceRequirements["customer-renewal"].result}
      />,
    );

    expect(container.querySelector('[data-presentation="decision-led"]')).toBeTruthy();
    expect(screen.getByText("Risk assessment")).toBeTruthy();
    expect(screen.getByText("What changed")).toBeTruthy();
    expect(screen.getByText("What stayed the same")).toBeTruthy();
  });
});
