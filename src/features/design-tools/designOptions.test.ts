import { describe, expect, it } from "vitest";
import {
  designOptions,
  getActiveDesignOption,
  getCurrentDesignOption,
  getDesignAreaForPath,
} from "./designOptions";

describe("Design Tools credit decision screens", () => {
  it("preserves the balanced dashboard, keeps the portfolio command view current, and exposes both chart candidates", () => {
    const workspaceOptions = designOptions.filter((option) => option.area === "workspace-overview");
    const current = getCurrentDesignOption("workspace-overview");
    const trendFlow = workspaceOptions.find((option) => option.id === "workspace-overview-v3-trend-flow-chart");
    const refinedMomentum = workspaceOptions.find((option) => option.id === "workspace-overview-v4-momentum-mix");

    expect(workspaceOptions).toHaveLength(4);
    expect(current?.id).toBe("workspace-overview-v2-operating-dashboard");
    expect(current?.renderKey).toBe("workspace-operating-dashboard");
    expect(trendFlow).toMatchObject({ status: "candidate", renderKey: "workspace-trend-flow-dashboard" });
    expect(refinedMomentum).toMatchObject({ status: "candidate", renderKey: "workspace-refined-momentum-dashboard" });
    expect(getDesignAreaForPath("/")).toBe("workspace-overview");
    expect(getDesignAreaForPath("/overview")).toBe("workspace-overview");
    expect(getActiveDesignOption("/", "workspace-overview-v1-balanced-modules")?.status).toBe("archived");
  });

  it("preserves both queue drawers while making the outcome-led preview current", () => {
    const queueOptions = designOptions.filter((option) => option.area === "credit-review-queue");
    const current = getCurrentDesignOption("credit-review-queue");

    expect(queueOptions).toHaveLength(3);
    expect(current).toMatchObject({
      id: "credit-review-queue-v3-outcome-preview",
      renderKey: "credit-review-outcome-drawer",
      status: "current",
    });
    expect(queueOptions.filter((option) => option.status === "archived").map((option) => option.version)).toEqual(["V1", "V2"]);
  });

  it("preserves the persistent documentation label while making the progressive rationale control current", () => {
    const utilityOptions = designOptions.filter((option) => option.area === "utility-bar");
    const current = getCurrentDesignOption("utility-bar");

    expect(utilityOptions).toHaveLength(2);
    expect(utilityOptions.find((option) => option.version === "V1")?.status).toBe("archived");
    expect(current).toMatchObject({
      id: "utility-bar-v2-progressive-rationale",
      renderKey: "utility-rationale-control",
      route: "/design-system",
    });
    expect(getDesignAreaForPath("/design-system")).toBe("utility-bar");
  });

  it("preserves V1–V5 while making the attributable insight brief current", () => {
    const reassessmentOptions = designOptions.filter((option) => option.area === "reassessment");
    const current = getCurrentDesignOption("reassessment");
    const candidate = reassessmentOptions.find((option) => option.id === "reassessment-v3-insight-brief");
    const focused = reassessmentOptions.find((option) => option.id === "reassessment-v2-focused-change");
    const breathable = reassessmentOptions.find((option) => option.id === "reassessment-v4-breathable-judgment");

    expect(reassessmentOptions).toHaveLength(6);
    expect(current?.id).toBe("reassessment-v6-attributable-insight-brief");
    expect(current?.renderKey).toBe("attributable-insight-brief");
    expect(current?.preset).toBe("meridian-reassessment-ready");
    expect(focused?.status).toBe("archived");
    expect(breathable?.status).toBe("archived");
    expect(candidate?.status).toBe("candidate");
    expect(candidate?.renderKey).toBe("insight-led-reassessment");
    expect(candidate?.route).toBe("/credit-reviews/meridian-foods/findings/declining-margins");
    expect(candidate?.preset).toBe("meridian-margin-reassessment-ready");
    expect(designOptions.find((option) => option.id === "reassessment-v5-attributable-analysis")?.status).toBe("archived");
  });

  it("keeps analyst recommendation and senior decision as separate screen areas", () => {
    const analystOptions = designOptions.filter((option) => option.area === "recommendation-decision");
    const seniorOptions = designOptions.filter((option) => option.area === "senior-decision");

    expect(analystOptions).toHaveLength(5);
    expect(analystOptions.every((option) => option.preset === "meridian-recommendation-ready")).toBe(true);
    expect(seniorOptions).toHaveLength(4);
    expect(seniorOptions.every((option) => option.preset === "senior-review-ready")).toBe(true);
  });

  it("adds a versioned senior submission queue before the decision workspace", () => {
    const current = getCurrentDesignOption("senior-review-queue");

    expect(current).toMatchObject({
      id: "senior-review-queue-v1-submissions",
      route: "/credit-reviews/senior",
      renderKey: "senior-review-submission-queue",
      preset: "senior-review-ready",
      status: "current",
    });
    expect(getDesignAreaForPath("/credit-reviews/senior")).toBe("senior-review-queue");
  });

  it("preserves recommendation V1–V4 while making the full-screen lifecycle V5 current", () => {
    const current = getCurrentDesignOption("recommendation-decision");
    const focusedLifecycle = designOptions.find((option) => option.id === "recommendation-decision-v4-focused-lifecycle");

    expect(current?.id).toBe("recommendation-decision-v5-full-screen-lifecycle");
    expect(current?.route).toBe("/credit-reviews/meridian-foods/recommendation/draft");
    expect(focusedLifecycle).toMatchObject({
      version: "V4",
      status: "candidate",
      renderKey: "recommendation-focused-lifecycle",
      route: "/credit-reviews/meridian-foods/recommendation",
    });
  });

  it("preserves V1–V3 while making the decision command center V4 current", () => {
    const current = getCurrentDesignOption("senior-decision");
    const archived = designOptions.find((option) => option.id === "senior-decision-v1-dense-brief");
    const focused = designOptions.find((option) => option.id === "senior-decision-v2-focused-layer");
    const fullScreen = designOptions.find((option) => option.id === "senior-decision-v3-full-screen-review");

    expect(current?.id).toBe("senior-decision-v4-command-center");
    expect(current?.renderKey).toBe("senior-decision-command-center");
    expect(current?.route).toBe("/credit-reviews/meridian-foods/senior-decision/review");
    expect(archived?.status).toBe("archived");
    expect(focused?.status).toBe("candidate");
    expect(fullScreen?.status).toBe("archived");
  });

  it.each([
    "/credit-reviews/meridian-foods/findings/customer-concentration",
    "/credit-reviews/meridian-foods/findings/declining-margins",
    "/credit-reviews/meridian-foods/findings/increasing-leverage",
  ] as const)("maps the finding detail route %s to the shared reassessment screen", (pathname) => {
    expect(getDesignAreaForPath(pathname)).toBe("reassessment");
    expect(getActiveDesignOption(pathname)?.id).toBe("reassessment-v6-attributable-insight-brief");
  });

  it("preserves Northstar V2 while making coherent finding states current across the workspace", () => {
    const caseOptions = designOptions.filter((option) => option.area === "case-workspace");

    expect(caseOptions).toHaveLength(3);
    expect(getCurrentDesignOption("case-workspace")?.id).toBe("case-workspace-v3-coherent-finding-states");
    expect(designOptions.find((option) => option.id === "case-workspace-v2-stateful-review")?.status).toBe("archived");
    expect(getDesignAreaForPath("/credit-reviews/northstar-health/sources")).toBe("case-workspace");
    expect(getActiveDesignOption("/credit-reviews/northstar-health/activity")?.id).toBe("case-workspace-v3-coherent-finding-states");
  });

  it("preserves the standard finding layout lab while making the decision workspace current", () => {
    const findingOptions = designOptions.filter((option) => option.area === "findings-overview");

    expect(findingOptions).toHaveLength(2);
    expect(getCurrentDesignOption("findings-overview")?.id).toBe("standard-findings-v2-decision-workspace");
    expect(getDesignAreaForPath("/credit-reviews/brightline-energy/findings")).toBe("findings-overview");
    expect(getActiveDesignOption("/credit-reviews/cedar-ridge-packaging/findings")?.renderKey).toBe("finding-decision-workspace");
  });

  it("keeps the senior decision separate from the analyst recommendation", () => {
    expect(getDesignAreaForPath("/credit-reviews/meridian-foods/recommendation")).toBe("recommendation-decision");
    expect(getDesignAreaForPath("/credit-reviews/meridian-foods/recommendation/draft")).toBe("recommendation-decision");
    expect(getDesignAreaForPath("/credit-reviews/meridian-foods/senior-decision")).toBe("senior-decision");
    expect(getDesignAreaForPath("/credit-reviews/meridian-foods/senior-decision/review")).toBe("senior-decision");
  });

  it("lets an explicit saved direction override the route's current direction", () => {
    const selected = getActiveDesignOption(
      "/credit-reviews/meridian-foods/findings/declining-margins",
      "reassessment-v3-insight-brief",
    );

    expect(selected?.id).toBe("reassessment-v3-insight-brief");
    expect(selected?.status).toBe("candidate");
  });
});
