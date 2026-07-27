// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ReviewBookmarksProvider, useReviewBookmarks } from "./ReviewBookmarks";

const storageKey = "bcgx.credit-review-bookmarks.v1";

function BookmarkHarness() {
  const { bookmarkedSlugs, removeBookmark, reorderBookmark, toggleBookmark } = useReviewBookmarks();
  return (
    <div>
      <output data-testid="bookmark-order">{bookmarkedSlugs.join("|")}</output>
      <button type="button" onClick={() => toggleBookmark("brightline-energy")}>Toggle Brightline</button>
      <button type="button" onClick={() => reorderBookmark("brightline-energy", "meridian-foods")}>Move Brightline first</button>
      <button type="button" onClick={() => removeBookmark("northstar-health")}>Remove Northstar</button>
    </div>
  );
}

function renderBookmarks() {
  return render(<ReviewBookmarksProvider><BookmarkHarness /></ReviewBookmarksProvider>);
}

describe("ReviewBookmarksProvider", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => cleanup());

  it("persists add, reorder, and remove operations in the visible order", async () => {
    const view = renderBookmarks();
    expect(screen.getByTestId("bookmark-order").textContent).toBe("meridian-foods|northstar-health");

    fireEvent.click(screen.getByRole("button", { name: "Toggle Brightline" }));
    fireEvent.click(screen.getByRole("button", { name: "Move Brightline first" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Northstar" }));

    expect(screen.getByTestId("bookmark-order").textContent).toBe("brightline-energy|meridian-foods");
    await waitFor(() => expect(window.localStorage.getItem(storageKey)).toBe('["brightline-energy","meridian-foods"]'));

    view.unmount();
    renderBookmarks();
    expect(screen.getByTestId("bookmark-order").textContent).toBe("brightline-energy|meridian-foods");
  });

  it("removes duplicate and unknown slugs when restoring saved state", () => {
    window.localStorage.setItem(storageKey, '["meridian-foods","unknown-review","meridian-foods"]');
    renderBookmarks();
    expect(screen.getByTestId("bookmark-order").textContent).toBe("meridian-foods");
  });

  it("synchronizes changes written by another browser tab", async () => {
    renderBookmarks();
    act(() => {
      window.localStorage.setItem(storageKey, '["northstar-health"]');
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
    });
    await waitFor(() => expect(screen.getByTestId("bookmark-order").textContent).toBe("northstar-health"));
  });
});
