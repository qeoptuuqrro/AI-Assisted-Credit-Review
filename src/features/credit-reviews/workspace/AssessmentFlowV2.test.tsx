// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { findings } from "./meridianData";
import { AssessmentFlowV2, RiskDecisionCard } from "./AssessmentFlowV2";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

type AssessmentFlowProps = ComponentProps<typeof AssessmentFlowV2>;

const customerConcentration = findings.find((finding) => finding.id === "customer-concentration")!;
const decliningMargins = findings.find((finding) => finding.id === "declining-margins")!;
const increasingLeverage = findings.find((finding) => finding.id === "increasing-leverage")!;

function renderEditorialAssessment(overrides: Partial<AssessmentFlowProps> = {}) {
  const callbacks = {
    onBack: vi.fn(),
    onUploadEvidence: vi.fn(),
    onRequestEvidence: vi.fn(),
    onRejectEvidence: vi.fn(),
    onUseExistingEvidence: vi.fn(),
    onResetEvidence: vi.fn(),
    onUpdateVerificationDraft: vi.fn(),
    onVerifyEvidence: vi.fn(),
    onReassess: vi.fn(),
    onRecordJudgment: vi.fn(),
    onOpenSource: vi.fn(),
  };
  const props: AssessmentFlowProps = {
    finding: customerConcentration,
    state: "needs_judgment",
    sourceReviewStates: {},
    evidenceState: {
      status: "ready-for-review",
      fileName: "Customer A renewal agreement",
      provenance: "existing-source",
    },
    reassessed: false,
    judgmentLayout: "editorial",
    language: "attributable",
    reviewPresentation: "decision-led",
    workflowPresentation: "editorial",
    verificationPolicy: "explicit-checklist",
    learningMode: false,
    ...callbacks,
    ...overrides,
  };

  return { ...render(<AssessmentFlowV2 {...props} />), callbacks };
}

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

  it("shows only the opposite policy severity in the editorial revision", () => {
    render(
      <RiskDecisionCard
        currentRisk="Material"
        revisedRisk="Material"
        onChange={vi.fn()}
        layout="editorial"
        language="attributable"
      />,
    );

    const revision = screen.getByRole("region", { name: "Revised severity" });
    expect(within(revision).getByText("From Material")).toBeTruthy();
    expect(within(revision).getByText("Moderate risk")).toBeTruthy();
    expect(within(revision).queryByRole("radio")).toBeNull();
  });
});

describe("Decision-led assessment hierarchy", () => {
  it("presents margin compression and downside coverage as aligned decision metrics", () => {
    renderEditorialAssessment({ finding: decliningMargins });

    expect(screen.getByRole("article", { name: "Operating margin pressure" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "EBITDA margin declined from 14.2 percent to 9.1 percent" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Downside coverage 1.12 times, 0.08 times below the 1.20 times floor" })).toBeTruthy();
    expect(screen.getByText("−5.1 pts")).toBeTruthy();
  });

  it("presents leverage as covenant capacity instead of a loose comparison ledger", () => {
    renderEditorialAssessment({ finding: increasingLeverage });

    expect(screen.getByRole("article", {
      name: "Leverage is 3.7 times with 0.55 times of covenant headroom to a 4.25 times maximum",
    })).toBeTruthy();
    expect(screen.getByRole("img", {
      name: "3.7 times leverage against a 4.25 times covenant maximum",
    })).toBeTruthy();
    expect(screen.getByText("Debt / EBITDA")).toBeTruthy();
    expect(screen.getByText("0.55x")).toBeTruthy();
    expect(screen.getByText("$2.1M pending")).toBeTruthy();
  });

  it("updates the covenant capacity and obligation classification after reassessment", () => {
    renderEditorialAssessment({ finding: increasingLeverage, reassessed: true });

    expect(screen.getByRole("article", {
      name: "Leverage is 3.9 times with 0.35 times of covenant headroom to a 4.25 times maximum",
    })).toBeTruthy();
    expect(screen.getByRole("img", {
      name: "3.9 times leverage against a 4.25 times covenant maximum",
    })).toBeTruthy();
    expect(screen.getByText("3.9x")).toBeTruthy();
    expect(screen.getByText("0.35x")).toBeTruthy();
    expect(screen.getByText("Funded debt")).toBeTruthy();
  });

  it("removes the redundant assessment-basis disclosure from the current experience", () => {
    renderEditorialAssessment();

    expect(screen.queryByRole("region", { name: "Assessment basis" })).toBeNull();
    expect(screen.getByRole("region", { name: "Evidence reviewed" })).toBeTruthy();
  });

  it("preserves the assessment-basis disclosure in historical standard variants", () => {
    renderEditorialAssessment({
      judgmentLayout: "breathable",
      reviewPresentation: "standard",
      workflowPresentation: "standard",
      verificationPolicy: "implicit",
    });

    expect(screen.getByRole("region", { name: "Assessment basis" })).toBeTruthy();
  });
});

describe("V9 capacity-first verification brief", () => {
  it("shows one leverage position, one evidence gate, and one primary action", () => {
    renderEditorialAssessment({
      finding: increasingLeverage,
      state: "needs_verification",
      evidenceState: { status: "idle" },
      reviewPresentation: "verification-led",
    });

    expect(screen.getByText("Meridian Foods · Finding review")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Leverage capacity and required verification" })).toBeTruthy();
    expect(screen.getByText("Current leverage position")).toBeTruthy();
    expect(screen.getByText("3.7x")).toBeTruthy();
    expect(screen.getByText("$3.70 of debt")).toBeTruthy();
    expect(screen.getByText("$1 of EBITDA")).toBeTruthy();
    expect(screen.getByText("0.55x")).toBeTruthy();
    expect(screen.getByText("below the proposed 4.25x maximum")).toBeTruthy();
    expect(screen.getByRole("img", {
      name: "Current leverage is 3.7 times debt to EBITDA, 0.55 times below the proposed 4.25 times maximum.",
    })).toBeTruthy();
    expect(screen.getByText("$2.1M")).toBeTruthy();
    expect(screen.getByText("This amount is not yet included in the debt calculation. Review the agreement to confirm whether it should count as debt.")).toBeTruthy();
    expect(screen.queryByText("Classification as funded debt is the unresolved gate in the leverage assessment.")).toBeNull();
    expect(screen.queryByText("Verification evidence is required")).toBeNull();
    expect(screen.queryByText("Resolve verification before judgment")).toBeNull();

    const action = screen.getAllByRole("button", { name: "Add verification evidence" });
    expect(action).toHaveLength(1);
    fireEvent.click(action[0]);

    const dialog = screen.getByRole("dialog", { name: "Provide evidence to verify" });
    expect(dialog.getAttribute("data-presentation")).toBe("editorial");
    expect(dialog.getAttribute("data-experience")).toBe("verification-led");
    const steps = within(dialog).getByRole("navigation", { name: "Reassessment steps" });
    expect(within(steps).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Evidence",
      "Updated assessment",
    ]);
    expect(within(steps).queryByRole("button", { name: "Review" })).toBeNull();
    expect(within(dialog).queryByRole("checkbox")).toBeNull();
    expect(within(dialog).queryByText("Choose source")).toBeNull();
    expect(within(dialog).queryByText("Verify scope")).toBeNull();
    expect(within(dialog).queryByText("Review changes")).toBeNull();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(action[0]);
  });

  it("resumes ready evidence at inline confirmation instead of a Review stage", () => {
    renderEditorialAssessment({
      finding: increasingLeverage,
      state: "needs_verification",
      evidenceState: {
        status: "ready-for-review",
        fileName: "Equipment obligation schedule.pdf",
        provenance: "analyst-upload",
      },
      reviewPresentation: "verification-led",
    });

    const action = screen.getByRole("button", { name: "Review evidence" });
    fireEvent.click(action);

    const dialog = screen.getByRole("dialog", { name: "Confirm evidence" });
    const steps = within(dialog).getByRole("navigation", { name: "Reassessment steps" });
    expect(within(steps).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Evidence",
      "Updated assessment",
    ]);
    expect(within(steps).queryByRole("button", { name: "Review" })).toBeNull();
    expect(within(dialog).queryByRole("checkbox")).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Confirm and reassess" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Verify the evidence and scope" })).toBeNull();
  });

  it("confirms evidence, completes the sequential reassessment trace, and preserves the audit payload", () => {
    vi.useFakeTimers();
    const { callbacks } = renderEditorialAssessment({ reviewPresentation: "verification-led" });

    fireEvent.click(screen.getByRole("button", { name: "Review evidence" }));
    const evidenceDialog = screen.getByRole("dialog", { name: "Confirm renewal evidence" });
    const evidenceSteps = within(evidenceDialog).getByRole("navigation", { name: "Reassessment steps" });
    expect(within(evidenceSteps).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Evidence",
      "Updated assessment",
    ]);
    expect(within(evidenceSteps).getByRole("button", { name: "Evidence" }).getAttribute("aria-current")).toBe("step");
    expect(within(evidenceDialog).queryByRole("checkbox")).toBeNull();

    fireEvent.click(within(evidenceDialog).getByRole("button", { name: "Confirm and reassess" }));

    const processingDialog = screen.getByRole("dialog", { name: "Updating customer-concentration assessment" });
    const processingSteps = within(processingDialog).getByLabelText("Reassessment progress");
    const processingStageTitles = [
      "Reading the executed renewal",
      "Validating the extracted change",
      "Updating customer concentration",
    ];
    const expectProcessingState = (expected: string[]) => {
      expect(processingStageTitles.map((title) => (
        within(processingSteps).getByText(title).closest("[data-state]")?.getAttribute("data-state")
      ))).toEqual(expected);
      expect(within(processingDialog).getByRole("button", { name: "Updated assessment" }).getAttribute("aria-current")).toBeNull();
      expect(within(processingDialog).getAllByText("Updated assessment")).toHaveLength(1);
      expect(within(processingDialog).queryByText("Suggested risk")).toBeNull();
      expect(within(processingDialog).queryByText("Material")).toBeNull();
      expect(within(processingDialog).queryByText("Moderate")).toBeNull();
      expect(callbacks.onVerifyEvidence).not.toHaveBeenCalled();
      expect(callbacks.onReassess).not.toHaveBeenCalled();
    };

    expect(within(processingDialog).queryByRole("checkbox")).toBeNull();
    expectProcessingState(["active", "pending", "pending"]);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expectProcessingState(["active", "pending", "pending"]);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expectProcessingState(["complete", "active", "pending"]);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expectProcessingState(["complete", "active", "pending"]);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expectProcessingState(["complete", "complete", "active"]);

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expectProcessingState(["complete", "complete", "active"]);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const resultDialog = screen.getByRole("dialog", { name: "The near-term risk is lower" });
    const resultSteps = within(resultDialog).getByRole("navigation", { name: "Reassessment steps" });
    expect(within(resultSteps).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Evidence",
      "Updated assessment",
    ]);
    expect(within(resultSteps).getByRole("button", { name: "Updated assessment" }).getAttribute("aria-current")).toBe("step");
    expect(within(resultDialog).getByText("Suggested risk")).toBeTruthy();
    expect(within(resultDialog).getByText("Changed")).toBeTruthy();
    expect(within(resultDialog).getByText("Unchanged")).toBeTruthy();
    expect(within(resultDialog).getByText("Human judgment still required")).toBeTruthy();
    expect(within(resultDialog).getByText("Material")).toBeTruthy();
    expect(within(resultDialog).getByText("Moderate")).toBeTruthy();
    expect(within(resultDialog).getByRole("button", { name: "Continue to judgment" })).toBeTruthy();
    expect(callbacks.onVerifyEvidence).toHaveBeenCalledOnce();
    expect(callbacks.onReassess).toHaveBeenCalledWith({
      analystContext: "Relationship team confirmed the renewal was executed after the original source package closed.",
      verification: {
        confirmedChecks: [
          "Executed by both parties",
          "Term extends through March 2030",
          "Minimum-purchase provisions remain in effect",
        ],
        verifiedBy: "Alex Kim",
        verifiedAt: expect.any(String),
      },
    });
  });
});

describe("V8 evidence-first decision review", () => {
  it("starts each workflow stage at the top of the focused surface", () => {
    renderEditorialAssessment({ resumeEvidenceStage: "evidence" });

    const dialog = screen.getByRole("dialog", { name: "Evidence selected" });
    const layout = dialog.querySelector<HTMLElement>("[data-stage]")!;
    dialog.scrollTop = 240;
    layout.scrollTop = 120;

    const review = within(dialog)
      .getAllByRole("button", { name: "Review" })
      .find((button) => !(button as HTMLButtonElement).disabled)!;
    fireEvent.click(review);

    expect(screen.getByRole("dialog", { name: "Verify the evidence and scope" })).toBe(dialog);
    expect(dialog.scrollTop).toBe(0);
    expect(layout.scrollTop).toBe(0);
  });

  it("keeps selected evidence actions aligned and resumes the requested workflow stage", () => {
    const onEvidenceResumeHandled = vi.fn();
    const { callbacks } = renderEditorialAssessment({
      resumeEvidenceStage: "evidence",
      onEvidenceResumeHandled,
    });

    const dialog = screen.getByRole("dialog", { name: "Evidence selected" });
    expect(within(dialog).getByRole("button", { name: "Inspect document" })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Change source" })).toBeTruthy();
    expect(within(dialog).queryByRole("button", { name: "View document" })).toBeNull();
    expect(onEvidenceResumeHandled).toHaveBeenCalledOnce();

    fireEvent.click(within(dialog).getByRole("button", { name: "Inspect document" }));
    expect(callbacks.onOpenSource).toHaveBeenCalledWith("customer-a-renewal", "customer-concentration", "review");
  });

  it("returns focus to the opener after Escape closes either overlay", () => {
    renderEditorialAssessment();

    const evidenceAction = screen.getByRole("button", { name: "Review evidence" });
    fireEvent.click(evidenceAction);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(evidenceAction);

    const judgmentAction = screen.getByRole("button", { name: "Record judgment" });
    fireEvent.click(judgmentAction);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(judgmentAction);
  });

  it("withholds the future risk and requires every evidence check before reassessment", () => {
    const { callbacks } = renderEditorialAssessment();

    fireEvent.click(screen.getByRole("button", { name: "Review evidence" }));

    const dialog = screen.getByRole("dialog", { name: "Verify the evidence and scope" });
    expect(within(dialog).getByText("Not calculated yet")).toBeTruthy();
    expect(within(dialog).queryByText("Moderate")).toBeNull();

    const run = within(dialog).getByRole("button", { name: "Verify & update analysis" }) as HTMLButtonElement;
    const checks = within(dialog).getAllByRole("checkbox") as HTMLInputElement[];

    expect(checks).toHaveLength(3);
    expect(run.disabled).toBe(true);

    fireEvent.click(checks[0]);
    fireEvent.click(checks[1]);
    expect(run.disabled).toBe(true);
    expect(callbacks.onVerifyEvidence).not.toHaveBeenCalled();

    fireEvent.click(checks[2]);
    expect(run.disabled).toBe(false);
    expect(callbacks.onUpdateVerificationDraft).toHaveBeenLastCalledWith({
      confirmedChecks: [
        "Executed by both parties",
        "Term extends through March 2030",
        "Minimum-purchase provisions remain in effect",
      ],
      analystContext: "Relationship team confirmed the renewal was executed after the original source package closed.",
    });

    checks[1].focus();
    fireEvent.click(checks[1]);
    expect(document.activeElement).toBe(checks[1]);
  });

  it("restores the saved verification draft after the reassessment flow is reopened", () => {
    renderEditorialAssessment({
      evidenceState: {
        status: "ready-for-review",
        fileName: "Customer A renewal agreement",
        provenance: "existing-source",
        verificationProgress: {
          confirmedChecks: [
            "Executed by both parties",
            "Minimum-purchase provisions remain in effect",
          ],
          analystContext: "The relationship team reconfirmed the signed renewal and minimum commitment.",
          updatedBy: "Alex Kim",
          updatedAt: "2026-07-27T14:00:00.000Z",
        },
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Review evidence" }));
    fireEvent.click(screen.getByRole("button", { name: "Close reassessment" }));
    fireEvent.click(screen.getByRole("button", { name: "Review evidence" }));

    const dialog = screen.getByRole("dialog", { name: "Verify the evidence and scope" });
    const checks = within(dialog).getAllByRole("checkbox") as HTMLInputElement[];

    expect(checks.map((check) => check.checked)).toEqual([true, false, true]);
    expect(within(dialog).getByText("The relationship team reconfirmed the signed renewal and minimum commitment.")).toBeTruthy();
    expect((within(dialog).getByRole("button", { name: "Verify & update analysis" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("reveals the calculated Material-to-Moderate change only in Result", () => {
    vi.useFakeTimers();
    const { callbacks } = renderEditorialAssessment();

    fireEvent.click(screen.getByRole("button", { name: "Review evidence" }));
    const reviewDialog = screen.getByRole("dialog", { name: "Verify the evidence and scope" });
    within(reviewDialog).getAllByRole("checkbox").forEach((check) => fireEvent.click(check));
    fireEvent.click(within(reviewDialog).getByRole("button", { name: "Verify & update analysis" }));

    expect(callbacks.onVerifyEvidence).not.toHaveBeenCalled();
    expect(within(reviewDialog).queryByText("Moderate")).toBeNull();
    const closeDuringProcessing = within(reviewDialog).getByRole("button", { name: "Close reassessment" }) as HTMLButtonElement;
    expect(closeDuringProcessing.disabled).toBe(true);
    fireEvent.keyDown(window, { key: "Escape" });
    const processingDialog = screen.getByRole("dialog", { name: "Updating the scoped assessment" });
    expect(processingDialog).toBeTruthy();
    processingDialog.focus();
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(processingDialog);

    act(() => {
      vi.advanceTimersByTime(5400);
    });

    const resultDialog = screen.getByRole("dialog", { name: "The near-term risk is lower" });
    expect(within(resultDialog).getByText("Material")).toBeTruthy();
    expect(within(resultDialog).getByText("Moderate")).toBeTruthy();
    expect(callbacks.onVerifyEvidence).toHaveBeenCalledOnce();
    expect(callbacks.onReassess).toHaveBeenCalledWith({
      analystContext: "Relationship team confirmed the renewal was executed after the original source package closed.",
      verification: {
        confirmedChecks: [
          "Executed by both parties",
          "Term extends through March 2030",
          "Minimum-purchase provisions remain in effect",
        ],
        verifiedBy: "Alex Kim",
        verifiedAt: expect.any(String),
      },
    });
  });

  it("opens analyst judgment without a banner or preselected decision", () => {
    const { callbacks } = renderEditorialAssessment({
      state: "analysis_ready",
      reassessed: true,
      evidenceState: {
        status: "verified",
        fileName: "Customer A renewal agreement",
        provenance: "existing-source",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Record judgment" }));

    const dialog = screen.getByRole("dialog", { name: "Record analyst judgment" });
    expect(within(dialog).queryByText("Updated analysis reviewed")).toBeNull();
    expect(within(dialog).getByText(/The system analysis remains attached as read-only support\./)).toBeTruthy();
    expect(within(dialog).getByText("Select how this finding should move forward.")).toBeTruthy();

    const decisions = within(dialog).getAllByRole("radio") as HTMLInputElement[];
    expect(decisions).toHaveLength(3);
    expect(decisions.every((decision) => !decision.checked)).toBe(true);
    expect((within(dialog).getByRole("button", { name: "Record judgment" }) as HTMLButtonElement).disabled).toBe(true);

    const acceptDecision = within(dialog).getByRole("radio", { name: "Accept" }) as HTMLInputElement;
    const reviseDecision = within(dialog).getByRole("radio", { name: "Revise" }) as HTMLInputElement;
    acceptDecision.focus();
    fireEvent.keyDown(acceptDecision, { key: "ArrowDown" });
    expect(reviseDecision.checked).toBe(true);
    fireEvent.keyDown(reviseDecision, { key: "ArrowUp" });
    expect(acceptDecision.checked).toBe(true);

    fireEvent.click(reviseDecision);
    expect(within(dialog).getByText("Record an analyst-owned conclusion.")).toBeTruthy();

    const riskSection = within(dialog).getByRole("region", { name: "Revised severity" });
    expect(within(riskSection).getByText("From Moderate")).toBeTruthy();
    expect(within(riskSection).getByText("Material risk")).toBeTruthy();
    expect(within(riskSection).queryByRole("radio")).toBeNull();
    expect(within(dialog).queryByText("Choose the analyst risk")).toBeNull();
    expect(within(dialog).queryByText("Retain this risk")).toBeNull();
    expect(within(dialog).queryByText("Analyst-owned risk")).toBeNull();

    fireEvent.change(within(dialog).getByRole("textbox", { name: /Analyst conclusion/ }), {
      target: { value: "Customer concentration remains material despite the verified renewal." },
    });
    const recordRevision = within(dialog).getByRole("button", { name: "Record revision" }) as HTMLButtonElement;
    expect(recordRevision.disabled).toBe(false);
    fireEvent.click(recordRevision);
    expect(callbacks.onRecordJudgment).toHaveBeenCalledWith(expect.objectContaining({
      decision: "revise",
      revisedRisk: "Material",
    }));
  });
});
