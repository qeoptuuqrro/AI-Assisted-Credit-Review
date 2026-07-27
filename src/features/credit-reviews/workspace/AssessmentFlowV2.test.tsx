// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RiskDecisionCard } from "./AssessmentFlowV2";

afterEach(cleanup);

describe("RiskDecisionCard", () => {
  it("gives the analyst a breathable two-position risk choice", () => {
    const onChange = vi.fn();

    render(
      <RiskDecisionCard
        currentRisk="Moderate"
        revisedRisk="Moderate"
        onChange={onChange}
        layout="breathable"
      />,
    );

    expect(screen.getByRole("region", { name: "Set the analyst risk" })).toBeTruthy();
    expect(screen.getByText("AI assessment · Read-only")).toBeTruthy();

    const material = screen.getByRole("radio", {
      name: /Material.*Requires protection or senior attention\./,
    }) as HTMLInputElement;
    const moderate = screen.getByRole("radio", {
      name: /Moderate.*Manageable with monitoring and controls\./,
    }) as HTMLInputElement;

    expect(moderate.checked).toBe(true);
    expect(material.checked).toBe(false);
    expect(screen.getByText("You’re retaining the assessed risk")).toBeTruthy();
    expect(screen.getByText((_, element) => (
      element?.tagName === "P"
      && element.textContent === "Moderate selected · Manageable with monitoring and controls."
    ))).toBeTruthy();

    fireEvent.click(material);
    expect(onChange).toHaveBeenCalledWith("Material");
  });

  it("keeps the compact V2 decision context addressable", () => {
    render(
      <RiskDecisionCard
        currentRisk="Moderate"
        revisedRisk="Material"
        onChange={vi.fn()}
        layout="compact"
      />,
    );

    expect(screen.getByRole("region", { name: "Decision context" })).toBeTruthy();
    expect(screen.getByText("Revised")).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Set the analyst risk" })).toBeNull();
  });

  it("uses the attributable V5 language without losing the read-only system baseline", () => {
    render(
      <RiskDecisionCard
        currentRisk="Material"
        revisedRisk="Moderate"
        onChange={vi.fn()}
        layout="breathable"
        language="attributable"
      />,
    );

    expect(screen.getByText("System assessment · Read-only")).toBeTruthy();
    expect(screen.getByText("The system assessment stays attached as read-only supporting analysis.")).toBeTruthy();
    expect(screen.queryByText("AI assessment · Read-only")).toBeNull();
  });
});
