// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SeniorDecisionWorkspaceV5, SeniorDecisionWorkspaceV6, type SeniorReviewPackageProps } from "./SeniorReviewPackage";

const recommendation = {
  decision: "Proceed with conditions",
  amount: "$18,000,000",
  rationale: "Repayment remains supportable with concentration reporting, leverage, and coverage protections.",
  conditions: ["Quarterly concentration reporting", "Maximum total leverage of 4.25x"],
  author: "Alex Kim",
  createdAt: "2026-07-26T14:30:00.000Z",
};

const baseProps: SeniorReviewPackageProps = {
  company: "Meridian Foods",
  request: "$18M working-capital line",
  facilityType: "3-year revolver",
  decisionQuestion: "Should Meridian receive the requested working-capital line?",
  reviewSummary: "The renewed contract lowers near-term risk; margin pressure still requires covenant protection.",
  recommendation,
  findings: [
    { id: "concentration", title: "Customer concentration", detail: "Top two customers represent 61% of revenue.", status: "Escalated", risk: "Material", tone: "warning" },
    { id: "leverage", title: "Increasing leverage", detail: "Leverage remains within the proposed covenant.", status: "Accepted", risk: "Moderate", tone: "success" },
  ],
  decisionSignals: [
    { label: "Top-two revenue", value: "61%", detail: "Monitoring remains" },
    {
      label: "Pro forma leverage",
      value: "3.9x",
      detail: "0.35x covenant headroom",
      detailTone: "positive",
      policyComparison: {
        actual: 3.9,
        boundary: 4.25,
        domain: [0, 4.5],
        direction: "maximum",
        boundaryLabel: "4.25x covenant maximum",
        varianceLabel: "0.35x below maximum",
      },
    },
    { label: "Fixed-charge coverage", value: "1.41x", detail: "Current reporting" },
  ],
  sourcesCount: 12,
  onExit: vi.fn(),
  onSubmit: vi.fn(),
};

afterEach(cleanup);

describe("Senior Decision V6", () => {
  it("uses a policy-aware aligned review brief before the decision form", () => {
    render(<SeniorDecisionWorkspaceV6 {...baseProps} />);

    expect(screen.getByRole("heading", { name: "Proceed with conditions" })).toBeTruthy();
    expect(screen.getByText(baseProps.reviewSummary!)).toBeTruthy();
    expect(screen.queryByText(recommendation.rationale)).toBeNull();
    expect(screen.getByText("Decision to make")).toBeTruthy();
    expect(screen.getByText("Should Meridian receive the requested working-capital line?")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Decision snapshot" })).toBeTruthy();
    expect(screen.getByText("$18M working-capital line")).toBeTruthy();
    expect(screen.getByText("3-year revolver")).toBeTruthy();
    expect(screen.queryByText("2 findings reviewed")).toBeNull();
    expect(screen.queryByText("12 sources reviewed")).toBeNull();
    expect(screen.getByText("Pro forma leverage")).toBeTruthy();
    expect(screen.getByText("3.9x")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Pro forma leverage: 3.9x; 4.25x covenant maximum; 0.35x below maximum" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Conditions for approval" })).toBeTruthy();
    expect(screen.getByText("2 proposed")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Material factors" })).toBeTruthy();
    expect(screen.getByText("Escalated · Material risk")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close senior review" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.queryByText("Decision owner")).toBeNull();
    expect(screen.queryByText("Ready for decision")).toBeNull();
    expect(screen.queryByText("Saved")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Record the outcome" })).toBeNull();
    expect(screen.queryByText("Decision required")).toBeNull();
    expect(screen.queryByText("Human-owned action")).toBeNull();
    expect(screen.queryByText("Supporting AI assessment")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));
    expect(screen.getByRole("heading", { name: "Record the outcome" })).toBeTruthy();
  });

  it("keeps the decision control compact and the accountable note always visible", () => {
    render(<SeniorDecisionWorkspaceV6 {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));

    expect(screen.getByText("Choose an outcome to continue.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Record decision" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Approval conditions")).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Approve with conditions" }));
    expect(screen.getByText("Approval conditions")).toBeTruthy();
    expect(screen.getByText("Approve with the selected conditions.")).toBeTruthy();
    expect(screen.getByText("Morgan Lee records the final decision.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Approve with conditions" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /Decision note/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Add decision note" })).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Approve" }));
    expect(screen.queryByText("Approval conditions")).toBeNull();
    expect(screen.getByText("Approve the request without conditions.")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /Decision note/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Return to analyst" }));
    expect(screen.getByText("Revision instructions")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Return to analyst" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("resets the review scroller and focuses the decision heading without adding a nested main landmark", () => {
    const { container } = render(
      <main aria-label="Application content">
        <SeniorDecisionWorkspaceV6 {...baseProps} />
      </main>,
    );
    const scrollArea = screen.getByRole("region", { name: "Senior review content" });
    scrollArea.scrollTop = 320;

    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));

    const heading = screen.getByRole("heading", { name: "Record the outcome" });
    expect(scrollArea.scrollTop).toBe(0);
    expect(document.activeElement).toBe(heading);
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  it("moves through the decision group with arrow keys", () => {
    render(<SeniorDecisionWorkspaceV6 {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));

    const approve = screen.getByRole("radio", { name: "Approve" }) as HTMLInputElement;
    const conditional = screen.getByRole("radio", { name: "Approve with conditions" }) as HTMLInputElement;
    fireEvent.click(approve);
    fireEvent.keyDown(approve, { key: "ArrowRight" });

    expect(conditional.checked).toBe(true);
    expect(document.activeElement).toBe(conditional);
  });

  it("keeps sparse records concise and uses correct evidence grammar", () => {
    render(
      <SeniorDecisionWorkspaceV6
        {...baseProps}
        sourcesCount={1}
        findings={[]}
        recommendation={{ ...recommendation, decision: "Approve", conditions: [] }}
      />,
    );

    expect(screen.queryByText("1 source reviewed")).toBeNull();
    expect(screen.queryByText("1 sources")).toBeNull();
    expect(screen.queryByText("0 findings reviewed")).toBeNull();
    expect(screen.getByText("No material findings remain open in the submitted record.")).toBeTruthy();
    expect(screen.queryByText("Protection package")).toBeNull();
  });

  it("keeps the full-case handoff on Review and out of the decision composer", () => {
    const onOpenRecord = vi.fn();
    render(<SeniorDecisionWorkspaceV6 {...baseProps} onOpenRecord={onOpenRecord} />);

    const topbar = screen.getByRole("button", { name: "Close senior review" }).closest("header")!;
    expect(within(topbar).getByText("Meridian Foods")).toBeTruthy();
    expect(within(topbar).queryByText(baseProps.request)).toBeNull();
    expect(within(topbar).queryByText("Senior review")).toBeNull();
    expect(within(topbar).queryByRole("button", { name: "Open case overview" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open case overview" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Findings" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sources" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Activity" })).toBeNull();
    expect(screen.queryByText("Supporting record")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open case overview" }));
    expect(onOpenRecord).toHaveBeenCalledWith("overview");

    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));
    expect(screen.queryByRole("button", { name: "Open case overview" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Full case record" })).toBeNull();
  });

  it("requires return instructions and submits the accountable outcome", () => {
    const onSubmit = vi.fn();
    render(<SeniorDecisionWorkspaceV6 {...baseProps} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Continue to decision" }));

    fireEvent.click(screen.getByRole("radio", { name: "Return to analyst" }));
    fireEvent.change(screen.getByPlaceholderText("What should the analyst revise?"), { target: { value: "Clarify covenant ownership." } });
    fireEvent.click(screen.getByRole("button", { name: "Return to analyst" }));

    expect(onSubmit).toHaveBeenCalledWith({
      decision: "return_to_analyst",
      rationale: "Clarify covenant ownership.",
      conditions: [],
    });
  });

  it("replaces the composer with a durable decision record", () => {
    render(
      <SeniorDecisionWorkspaceV6
        {...baseProps}
        onOpenRecord={vi.fn()}
        existingDecision={{
          decision: "approve_with_conditions",
          rationale: "Approved on the submitted analysis.",
          conditions: recommendation.conditions,
          decisionMaker: "Morgan Lee",
          createdAt: "2026-07-27T16:30:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Approved with conditions")).toBeTruthy();
    expect(screen.getByText("Approved on the submitted analysis.")).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByRole("button", { name: "Open case overview" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back to senior reviews" })).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Full case record" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open case overview" }).closest("footer")).toBeTruthy();
  });

  it("makes an empty approval note explicit in the recorded record", () => {
    render(
      <SeniorDecisionWorkspaceV6
        {...baseProps}
        onOpenRecord={vi.fn()}
        existingDecision={{
          decision: "approve",
          rationale: "",
          conditions: [],
          decisionMaker: "Morgan Lee",
          createdAt: "2026-07-27T16:30:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("No additional senior note recorded.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Open case overview" })?.closest("footer")).toBeTruthy();
  });

  it("keeps the locked analyst review reachable after a decision is recorded", () => {
    render(
      <SeniorDecisionWorkspaceV6
        {...baseProps}
        existingDecision={{
          decision: "approve_with_conditions",
          rationale: "Approved on the submitted analysis.",
          conditions: recommendation.conditions,
          decisionMaker: "Morgan Lee",
          createdAt: "2026-07-27T16:30:00.000Z",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.getByRole("heading", { name: "Proceed with conditions" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "View decision record" })).toBeTruthy();
  });

  it("preserves V5 as an archived comparison surface", () => {
    render(<SeniorDecisionWorkspaceV5 {...baseProps} />);

    expect(screen.getByRole("heading", { name: "Proceed with conditions" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Recommendation" })).toBeTruthy();
  });
});
