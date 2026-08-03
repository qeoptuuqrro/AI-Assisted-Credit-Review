import { describe, expect, it } from "vitest";
import { reviews } from "./reviewData";
import { ALL_REVIEWS_TOTAL, buildAllReviewQueue, placeholderQueueReviews } from "./queueReviewData";

describe("all-review queue fixtures", () => {
  it("fills the 68-case portfolio without changing the canonical case registry", () => {
    const queue = buildAllReviewQueue(reviews);

    expect(reviews).toHaveLength(14);
    expect(placeholderQueueReviews).toHaveLength(54);
    expect(queue).toHaveLength(ALL_REVIEWS_TOTAL);
    expect(new Set(queue.map((review) => review.id)).size).toBe(ALL_REVIEWS_TOTAL);
    expect(new Set(queue.map((review) => review.company)).size).toBe(ALL_REVIEWS_TOTAL);
    expect(queue.filter((review) => review.owner === "Alex Kim")).toHaveLength(12);
    expect(placeholderQueueReviews.some((review) => review.owner === "Alex Kim")).toBe(false);
  });

  it("matches the portfolio totals presented by the status filters", () => {
    const queue = buildAllReviewQueue(reviews);
    const counts = queue.reduce<Record<string, number>>((result, review) => {
      result[review.status] = (result[review.status] ?? 0) + 1;
      return result;
    }, {});

    expect(counts).toEqual({
      "needs-attention": 21,
      "in-review": 29,
      "ready-for-decision": 11,
      completed: 7,
    });
  });
});
