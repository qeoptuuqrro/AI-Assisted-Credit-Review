// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewBookmarksProvider } from "../features/credit-reviews/bookmarks/ReviewBookmarks";
import { createNorthstarPreset } from "../features/credit-reviews/workflow/creditReviewState";
import { NORTHSTAR_STORAGE_KEY, REVIEW_WORKFLOW_STATE_EVENT } from "../features/credit-reviews/workflow/usePersistentReviewState";
import { AppShell } from "./AppShell";
import { RouterProvider } from "./router";

beforeEach(() => {
  window.sessionStorage.clear();
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

describe("Northstar prototype bridge", () => {
  it("shows the received-response control only while the borrower request is sent", async () => {
    window.sessionStorage.setItem(
      NORTHSTAR_STORAGE_KEY,
      JSON.stringify(createNorthstarPreset("northstar-request-sent")),
    );
    window.history.replaceState({}, "", "/credit-reviews/northstar-health/sources");

    render(
      <RouterProvider>
        <ReviewBookmarksProvider>
          <AppShell><div>Northstar sources</div></AppShell>
        </ReviewBookmarksProvider>
      </RouterProvider>,
    );

    const advance = await screen.findByRole("link", { name: /Preview received response/ });
    expect(advance.getAttribute("href")).toContain("preset=northstar-document-received");

    window.sessionStorage.setItem(
      NORTHSTAR_STORAGE_KEY,
      JSON.stringify(createNorthstarPreset("northstar-document-received")),
    );
    act(() => {
      window.dispatchEvent(new CustomEvent(REVIEW_WORKFLOW_STATE_EVENT, { detail: { storageKey: NORTHSTAR_STORAGE_KEY } }));
    });

    await waitFor(() => expect(screen.queryByRole("link", { name: /Preview received response/ })).toBeNull());
  });
});

describe("focused senior review shell", () => {
  it("retains the environment banner while removing ordinary product navigation", () => {
    window.history.replaceState({}, "", "/credit-reviews/apex-manufacturing/senior-decision/review");

    render(
      <RouterProvider>
        <ReviewBookmarksProvider>
          <AppShell><div>Apex senior review</div></AppShell>
        </ReviewBookmarksProvider>
      </RouterProvider>,
    );

    expect(screen.getByText("Explore the BCGX lending workspace.")).toBeTruthy();
    expect(screen.getByText("Apex senior review")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Primary navigation" })).toBeNull();
  });
});

describe("Policy Rules navigation", () => {
  it("places Policy rules between Credit reviews and Design system", () => {
    window.history.replaceState({}, "", "/policy-rules");

    render(
      <RouterProvider>
        <ReviewBookmarksProvider>
          <AppShell><div>Policy rule library</div></AppShell>
        </ReviewBookmarksProvider>
      </RouterProvider>,
    );

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(navigation).getAllByRole("link").slice(2)).toEqual([
      within(navigation).getByRole("link", { name: "Credit reviews" }),
      within(navigation).getByRole("link", { name: "Policy rules" }),
      within(navigation).getByRole("link", { name: "Design system" }),
    ]);
  });

  it.each([
    "/policy-rules",
    "/policy-rules/leverage-ceiling",
  ] as const)("keeps Policy rules selected at %s", (pathname) => {
    window.history.replaceState({}, "", pathname);

    render(
      <RouterProvider>
        <ReviewBookmarksProvider>
          <AppShell><div>Policy rules</div></AppShell>
        </ReviewBookmarksProvider>
      </RouterProvider>,
    );

    expect(screen.getByRole("link", { name: "Policy rules" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Credit reviews" }).getAttribute("aria-current")).toBeNull();
  });
});
