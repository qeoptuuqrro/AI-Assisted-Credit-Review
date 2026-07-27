// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MeridianLearningPanel, getLearningTargetProps } from "./MeridianLearningMode";
import {
  financialsLearningTopicIds,
  firstLearningTopicForScope,
  meridianLearningTopicById,
  meridianLearningTopicIdsByScope,
  meridianLearningTopics,
} from "./meridianLearningContent";

afterEach(cleanup);

describe("Meridian Learning Mode", () => {
  it("keeps every route scope non-empty, valid, and free of duplicate topic ids", () => {
    const knownIds = new Set(meridianLearningTopics.map((topic) => topic.id));
    expect(knownIds.size).toBe(meridianLearningTopics.length);

    Object.entries(meridianLearningTopicIdsByScope).forEach(([scope, topicIds]) => {
      expect(topicIds.length, `${scope} should expose learning topics`).toBeGreaterThan(0);
      expect(new Set(topicIds).size, `${scope} should not repeat topics`).toBe(topicIds.length);
      topicIds.forEach((topicId) => expect(knownIds.has(topicId), `${scope} references ${topicId}`).toBe(true));
      expect(firstLearningTopicForScope(scope as keyof typeof meridianLearningTopicIdsByScope)).toBe(topicIds[0]);
    });
  });

  it("supports Plain English and Credit view inside a route-scoped panel", () => {
    render(
      <MeridianLearningPanel
        open
        topicId="financials-story"
        topicIds={financialsLearningTopicIds}
        onSelectTopic={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "How to read the financial assessment" })).toBeTruthy();
    expect(screen.getByText(meridianLearningTopicById["financials-story"].simple)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Credit view" }));
    expect(screen.getByText(meridianLearningTopicById["financials-story"].professional)).toBeTruthy();
    expect(screen.getByText(`1 of ${financialsLearningTopicIds.length}`)).toBeTruthy();
  });

  it("only makes a section inspectable while Learning Mode is enabled", () => {
    expect(getLearningTargetProps(false, "activity-story")).toEqual({});
    expect(getLearningTargetProps(true, "activity-story")).toEqual({
      "data-learning-target": "activity-story",
      "data-learning-label": "Activity overview",
      tabIndex: 0,
    });
  });
});
