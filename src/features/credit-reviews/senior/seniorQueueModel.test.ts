import { describe, expect, it } from "vitest";
import { createInitialStandardReviewState, type StandardReviewWorkflowState } from "../standard/standardReviewState";
import {
  createInitialNorthstarState,
  createMeridianPreset,
  type SeniorDecisionRecord,
} from "../workflow/creditReviewState";
import {
  buildSeniorQueueItems,
  getStageTabsScrollCue,
  seniorQueueStageTabs,
  type StandardReviewStateReader,
} from "./seniorQueueModel";

const recommendation = {
  decision: "Approve with conditions",
  amount: "$20M term loan",
  rationale: "The submitted case supports the facility with the listed protections.",
  conditions: ["Minimum DSCR of 1.20x"],
  author: "Alex Kim",
  createdAt: "2026-07-27T11:00:00.000Z",
};

function readerWithApexDecision(decision: SeniorDecisionRecord): StandardReviewStateReader {
  const apexState: StandardReviewWorkflowState = {
    version: 1,
    reviewedFindingIds: ["expansion-capacity"],
    recommendationSubmitted: true,
    recommendation,
    seniorDecision: decision,
  };

  return (slug) => slug === "apex-manufacturing" ? apexState : createInitialStandardReviewState();
}

function apexWithDecision(decision: SeniorDecisionRecord) {
  return buildSeniorQueueItems(
    createMeridianPreset("senior-review-ready"),
    createInitialNorthstarState(),
    readerWithApexDecision(decision),
  ).find((item) => item.id === "apex-manufacturing");
}

describe("senior queue model", () => {
  it("projects active workflow cases through ready, waiting, and decided", () => {
    const readyState = createMeridianPreset("senior-review-ready");
    const waitingState = {
      ...readyState,
      seniorDecision: {
        decision: "return_to_analyst" as const,
        rationale: "Clarify covenant ownership.",
        conditions: [],
        decisionMaker: "Morgan Lee",
        createdAt: "2026-07-27T12:00:00.000Z",
      },
    };
    const decidedState = {
      ...readyState,
      seniorDecision: {
        decision: "approve" as const,
        rationale: "Approved on the submitted record.",
        conditions: [],
        decisionMaker: "Morgan Lee",
        createdAt: "2026-07-27T12:00:00.000Z",
      },
    };
    const standardReader = () => createInitialStandardReviewState();

    const ready = buildSeniorQueueItems(readyState, createInitialNorthstarState(), standardReader).find((item) => item.id === "meridian-foods");
    const waiting = buildSeniorQueueItems(waitingState, createInitialNorthstarState(), standardReader).find((item) => item.id === "meridian-foods");
    const decided = buildSeniorQueueItems(decidedState, createInitialNorthstarState(), standardReader).find((item) => item.id === "meridian-foods");

    expect(ready).toMatchObject({ stage: "ready", statusLabel: "Decision ready", statusTone: "warning" });
    expect(waiting).toMatchObject({ stage: "waiting", statusLabel: "Revision requested", statusTone: "warning", submittedAt: "Returned Jul 27" });
    expect(waiting?.route).toBe("/credit-reviews/meridian-foods");
    expect(decided).toMatchObject({ stage: "decided", statusLabel: "Approved", statusTone: "success", submittedAt: "Decided Jul 27" });
  });

  it.each([
    { decision: "approve" as const, stage: "decided", label: "Approved", tone: "success", title: "Approved" },
    { decision: "approve_with_conditions" as const, stage: "decided", label: "Approved with conditions", tone: "success", title: "Approved with conditions" },
    { decision: "decline" as const, stage: "decided", label: "Declined", tone: "danger", title: "Declined" },
    { decision: "return_to_analyst" as const, stage: "waiting", label: "Revision requested", tone: "warning", title: "Revision requested" },
  ])("projects a standard $decision decision into the correct queue presentation", ({ decision, stage, label, tone, title }) => {
    const item = apexWithDecision({
      decision,
      rationale: `${label} rationale`,
      conditions: [],
      decisionMaker: "Morgan Lee",
      createdAt: "2026-07-27T12:00:00.000Z",
    });

    expect(item).toMatchObject({
      stage,
      statusLabel: label,
      statusTone: tone,
      recommendationTitle: title,
      recommendationRationale: `${label} rationale`,
    });
    expect(item?.conditions).toEqual(recommendation.conditions);
    expect(item?.submittedAt).toMatch(decision === "return_to_analyst" ? /^Returned / : /^Decided /);
  });

  it("uses the recorded static decision label for a completed standard review", () => {
    const oakridge = buildSeniorQueueItems(
      createMeridianPreset("senior-review-ready"),
      createInitialNorthstarState(),
      () => createInitialStandardReviewState(),
    ).find((item) => item.id === "oakridge-services");

    expect(oakridge).toMatchObject({
      stage: "decided",
      statusLabel: "Approved",
      statusTone: "success",
      recommendationTitle: "Approved",
      submittedAt: "Decided Jul 25",
    });
  });

  it("keeps a reopened standard recommendation in Waiting on analyst", () => {
    const returned: SeniorDecisionRecord = {
      decision: "return_to_analyst",
      rationale: "Clarify covenant ownership.",
      conditions: [],
      decisionMaker: "Morgan Lee",
      createdAt: "2026-07-27T12:00:00.000Z",
    };
    const reader: StandardReviewStateReader = (slug) => slug === "apex-manufacturing" ? {
      version: 1,
      reviewedFindingIds: ["expansion-capacity"],
      recommendationSubmitted: false,
      decisionHistory: [returned],
    } : createInitialStandardReviewState();

    const apex = buildSeniorQueueItems(createMeridianPreset("senior-review-ready"), createInitialNorthstarState(), reader)
      .find((item) => item.id === "apex-manufacturing");

    expect(apex).toMatchObject({
      stage: "waiting",
      statusLabel: "Revision in progress",
      recommendationTitle: "Analyst revision in progress",
      recommendationRationale: "Clarify covenant ownership.",
      submittedAt: "Returned Jul 27",
      route: "/credit-reviews/apex-manufacturing",
    });
  });

  it("keeps a completed analyst review waiting until a recommendation is submitted", () => {
    const reader: StandardReviewStateReader = (slug) => slug === "brightline-energy" ? {
      version: 1,
      reviewedFindingIds: ["merchant-exposure"],
      recommendationSubmitted: false,
    } : createInitialStandardReviewState();

    const brightline = buildSeniorQueueItems(createMeridianPreset("senior-review-ready"), createInitialNorthstarState(), reader)
      .find((item) => item.id === "brightline-energy");

    expect(brightline).toMatchObject({
      stage: "waiting",
      statusLabel: "Awaiting analyst",
      statusTone: "neutral",
      recommendationTitle: "Recommendation not submitted",
      route: "/credit-reviews/brightline-energy",
    });
    expect(brightline?.conditions).toEqual([]);
  });

  it("publishes the shared stage contract in queue order", () => {
    expect(seniorQueueStageTabs).toEqual([
      { id: "ready", label: "Needs review" },
      { id: "waiting", label: "Waiting on analyst" },
      { id: "decided", label: "Decided" },
    ]);
  });

  it("only shows the mobile stage continuation cue while more tabs remain", () => {
    expect(getStageTabsScrollCue({ clientWidth: 358, scrollWidth: 388, scrollLeft: 0 })).toEqual({ overflow: true, atEnd: false });
    expect(getStageTabsScrollCue({ clientWidth: 358, scrollWidth: 388, scrollLeft: 30 })).toEqual({ overflow: true, atEnd: true });
    expect(getStageTabsScrollCue({ clientWidth: 968, scrollWidth: 968, scrollLeft: 0 })).toEqual({ overflow: false, atEnd: true });
  });
});
