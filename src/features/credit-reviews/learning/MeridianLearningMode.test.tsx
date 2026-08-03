// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MeridianLearningPanel, MeridianLearningToggle, getLearningTargetProps } from "./MeridianLearningMode";
import {
  financialsLearningTopicIds,
  firstLearningTopicForScope,
  meridianLearningTopicById,
  meridianLearningTopicIdsByScope,
  meridianLearningTopics,
} from "./meridianLearningContent";

afterEach(cleanup);

describe("Meridian Learning Mode", () => {
  it("keeps one stable accessible name while exposing the pressed state", () => {
    const onToggle = vi.fn();
    const { rerender } = render(<MeridianLearningToggle enabled={false} onToggle={onToggle} />);
    const toggle = screen.getByRole("button", { name: "Learning mode" });

    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Learn this page")).toBeTruthy();
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<MeridianLearningToggle enabled onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Learning mode" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Learning on")).toBeTruthy();
  });

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

  it("documents the complete case-status vocabulary and judgment rule", () => {
    const topic = meridianLearningTopicById["queue-statuses"];

    ["Needs verification", "Needs judgment", "Analyst review", "Ready to recommend", "Awaiting decision", "Revision requested", "Approved", "Declined"].forEach((label) => {
      expect(`${topic.simple} ${topic.professional}`).toContain(label);
    });
    expect(topic.simple).toContain("trusted evidence leaves a material choice");
    expect(topic.example).toContain("Meridian is Needs judgment");
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
    expect(screen.getByText("Key takeaway")).toBeTruthy();
    expect(screen.queryByText("Say it in the presentation")).toBeNull();
    expect(screen.getByText(meridianLearningTopicById["financials-story"].presenterLine).tagName).toBe("P");
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
