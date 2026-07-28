// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAIReviewLabel, getAIReviewTone, reviews } from "./reviewData";
import { CreditReviewDrawer } from "./CreditReviewDrawer";
import { createInitialMeridianState } from "./workflow/creditReviewState";

afterEach(cleanup);

const meridian = reviews.find((review) => review.slug === "meridian-foods")!;
const northstar = reviews.find((review) => review.slug === "northstar-health")!;
const brightline = reviews.find((review) => review.slug === "brightline-energy")!;
const lakeview = reviews.find((review) => review.slug === "lakeview-medical")!;

function renderDrawer(
  review = meridian,
  options: Partial<React.ComponentProps<typeof CreditReviewDrawer>> = {},
) {
  return render(
    <CreditReviewDrawer
      review={review}
      status={{ label: getAIReviewLabel(review), tone: getAIReviewTone(review) }}
      presentation="outcome"
      meridianState={createInitialMeridianState()}
      onClose={vi.fn()}
      onOpenFinding={vi.fn()}
      onOpenFullReview={vi.fn()}
      {...options}
    />,
  );
}

describe("CreditReviewDrawer outcome preview", () => {
  it("keeps Meridian's mixed finding states visible without repeating the dominant state", () => {
    renderDrawer();

    expect(screen.getByRole("heading", { name: "Meridian Foods" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Review focus" })).toBeTruthy();
    expect(screen.getByLabelText("Finding review status").getAttribute("data-variant")).toBe("review");
    expect(screen.getByRole("button", { name: "Customer concentration" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Declining margins" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Increasing leverage" })).toBeTruthy();
    expect(screen.getByText("Analyst review")).toBeTruthy();
    expect(screen.getByText("Needs verification")).toBeTruthy();
    expect(screen.queryByText("Needs judgment")).toBeNull();
    expect(screen.queryByText("AI review brief")).toBeNull();
    expect(screen.queryByText("Next step")).toBeNull();
    expect(screen.queryByText("Initial assessment")).toBeNull();
    expect(screen.queryByText(/AI paused/i)).toBeNull();
  });

  it("does not repeat Brightline's review status inside its single finding row", () => {
    renderDrawer(brightline);

    expect(screen.getByRole("heading", { name: "Review focus" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Merchant-price exposure" })).toBeTruthy();
    expect(screen.getAllByText("Needs judgment")).toHaveLength(1);
  });

  it("projects persisted analyst completion into the queue preview", () => {
    const state = createInitialMeridianState();
    state.findingStates["customer-concentration"] = "review_complete";
    state.judgments.push({
      findingId: "customer-concentration",
      decision: "accept",
      rationale: "Renewal evidence and monitoring controls are sufficient.",
      author: "Alex Kim",
      createdAt: "2026-07-26T14:30:00.000Z",
    });

    renderDrawer(meridian, { meridianState: state });

    expect(screen.getByRole("heading", { name: "Review focus" })).toBeTruthy();
    expect(screen.getByText("Accepted by analyst")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review findings" })).toBeTruthy();
  });

  it("presents Northstar's missing forecast as an evidence prerequisite, not a finding", () => {
    renderDrawer(northstar, { status: { label: "Needs verification", tone: "danger" } });

    expect(screen.getByRole("heading", { name: "Required evidence" })).toBeTruthy();
    expect(screen.getByText("2027 operating forecast")).toBeTruthy();
    expect(screen.getByText(/downside analysis is paused/)).toBeTruthy();
    expect(screen.getByLabelText("Evidence review status").getAttribute("data-variant")).toBe("evidence");
    expect(screen.getAllByText("Needs verification")).toHaveLength(1);
    expect(screen.getByText("Missing")).toBeTruthy();
    expect(screen.queryByLabelText("Finding review status")).toBeNull();
    expect(screen.queryByLabelText("Key findings")).toBeNull();
    expect(screen.queryByRole("button", { name: /2027 operating forecast/ })).toBeNull();
  });

  it("shows the verified Northstar zero-finding outcome", () => {
    renderDrawer({ ...northstar, aiReviewState: "analysis-updated", aiReviewDetail: undefined }, {
      status: { label: "Analysis updated", tone: "info" },
    });

    expect(screen.getByRole("heading", { name: "What changed" })).toBeTruthy();
    expect(screen.getByLabelText("Evidence review status").getAttribute("data-variant")).toBe("change");
    expect(screen.getByText("Coverage update")).toBeTruthy();
    expect(screen.getByText(/1.29x downside FCCR vs 1.20x policy floor/)).toBeTruthy();
    expect(screen.getAllByText("Analysis updated")).toHaveLength(1);
    expect(screen.queryByText("2027 operating forecast", { exact: true })).toBeNull();
  });

  it("presents Lakeview's updated analysis as one concise directional change", () => {
    renderDrawer(lakeview);

    expect(screen.getByRole("heading", { name: "What changed" })).toBeTruthy();
    expect(screen.getByLabelText("Finding review status").getAttribute("data-variant")).toBe("change");
    expect(screen.getByRole("button", { name: "Reimbursement evidence" })).toBeTruthy();
    expect(screen.getByLabelText("Assessment changed from Moderate to Low")).toBeTruthy();
    expect(screen.getAllByText("Analysis updated")).toHaveLength(1);
    expect(screen.queryByText("Updated", { exact: true })).toBeNull();
  });

  it("keeps the historical drawer content addressable", () => {
    renderDrawer(northstar, { presentation: "legacy" });

    expect(screen.getByText("Initial assessment")).toBeTruthy();
    expect(screen.getByText(/AI paused the downside repayment analysis/)).toBeTruthy();
    expect(screen.getByLabelText("Key findings")).toBeTruthy();
  });
});
