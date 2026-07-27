// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { evidenceRequirements } from "../workflow/evidenceWorkflow";
import { findings } from "./meridianData";
import { AssessmentInsightBrief } from "./AssessmentInsightBrief";

afterEach(() => cleanup());

describe("AssessmentInsightBrief", () => {
  it("keeps current finding language attributable while preserving the evidence distinction", () => {
    render(
      <AssessmentInsightBrief
        finding={findings[0]}
        requirement={evidenceRequirements["customer-renewal"]}
        mode="updated"
        language="attributable"
      />,
    );

    expect(screen.getByText("Updated assessment")).toBeTruthy();
    expect(screen.getByText("System conclusion")).toBeTruthy();
    expect(screen.queryByText("AI conclusion")).toBeNull();
    expect(screen.getByText("Evidence changed")).toBeTruthy();
    expect(screen.getByText("Still true")).toBeTruthy();
  });
});
