// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppUtilityActionsProvider } from "../../../app/AppUtilityActions";
import { RouterProvider } from "../../../app/router";
import { ReviewBookmarksProvider } from "../bookmarks/ReviewBookmarks";
import { createNorthstarPreset } from "../workflow/creditReviewState";
import { NORTHSTAR_STORAGE_KEY } from "../workflow/usePersistentReviewState";
import { NorthstarReviewWorkspace } from "./NorthstarReviewWorkspace";

function renderWorkspace(path: string) {
  window.history.replaceState({}, "", path);
  return render(
    <RouterProvider>
      <ReviewBookmarksProvider>
        <AppUtilityActionsProvider target={null}>
          <NorthstarReviewWorkspace />
        </AppUtilityActionsProvider>
      </ReviewBookmarksProvider>
    </RouterProvider>,
  );
}

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

describe("Northstar missing-evidence journey", () => {
  it("routes the Overview action to Sources and removes the redundant Sources header action", async () => {
    renderWorkspace("/credit-reviews/northstar-health");

    fireEvent.click(screen.getByRole("button", { name: "Resolve missing evidence" }));

    await waitFor(() => expect(window.location.pathname).toBe("/credit-reviews/northstar-health/sources"));
    expect(screen.getByRole("heading", { name: "Sources" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Resolve missing evidence" })).toBeNull();
  });

  it("makes borrower request primary and direct upload secondary when evidence is missing", () => {
    renderWorkspace("/credit-reviews/northstar-health/sources");

    const actions = screen.getByLabelText("Evidence options");
    expect(within(actions).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Request borrower",
      "Upload file",
    ]);
  });

  it("keeps the sent request attributable while awaiting the borrower response", () => {
    window.sessionStorage.setItem(
      NORTHSTAR_STORAGE_KEY,
      JSON.stringify(createNorthstarPreset("northstar-request-sent")),
    );
    renderWorkspace("/credit-reviews/northstar-health/sources");

    const actions = screen.getByLabelText("Evidence options");
    expect(within(actions).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "View borrower request",
      "Upload file",
    ]);

    fireEvent.click(within(actions).getByRole("button", { name: "View borrower request" }));
    const dialog = screen.getByRole("dialog", { name: "Document requested — 2027 Operating Forecast" });
    expect(within(dialog).getByText("Awaiting response")).toBeTruthy();
    expect(within(dialog).getByText("Marcus Reed · VP, Finance")).toBeTruthy();
  });

  it("defaults the borrower request to Marcus Reed", () => {
    renderWorkspace("/credit-reviews/northstar-health/sources");

    fireEvent.click(screen.getByRole("button", { name: "Request borrower" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const marcus = screen.getByRole("radio", { name: /Marcus Reed/ }) as HTMLInputElement;
    expect(marcus.checked).toBe(true);
    expect(screen.getByDisplayValue(/Hi Marcus/)).toBeTruthy();
  });

  it("preserves the sent request when the prototype advances to a received response", async () => {
    const sent = createNorthstarPreset("northstar-request-sent");
    sent.request = {
      ...sent.request,
      recipient: "Marcus Reed · VP, Finance",
      dueDate: "Aug 8, 2026",
      message: "Please include the approved downside assumptions.",
      sentAt: "2026-07-30T16:15:00.000Z",
    };
    window.sessionStorage.setItem(NORTHSTAR_STORAGE_KEY, JSON.stringify(sent));

    renderWorkspace("/credit-reviews/northstar-health/sources?preset=northstar-document-received");

    await waitFor(() => expect(window.location.search).toBe(""));
    await waitFor(() => {
      const persisted = JSON.parse(window.sessionStorage.getItem(NORTHSTAR_STORAGE_KEY) ?? "{}") as typeof sent;
      expect(persisted.request).toMatchObject({
        status: "ready",
        recipient: "Marcus Reed · VP, Finance",
        dueDate: "Aug 8, 2026",
        message: "Please include the approved downside assumptions.",
        sentAt: "2026-07-30T16:15:00.000Z",
        fileName: "2027 Operating Forecast.xlsx",
      });
    });
  });

  it("keeps the received preset deterministic when opened directly", async () => {
    renderWorkspace("/credit-reviews/northstar-health/sources?preset=northstar-document-received");

    await waitFor(() => expect(window.location.search).toBe(""));
    await waitFor(() => {
      const persisted = JSON.parse(window.sessionStorage.getItem(NORTHSTAR_STORAGE_KEY) ?? "{}") as ReturnType<typeof createNorthstarPreset>;
      expect(persisted.request).toMatchObject({
        status: "ready",
        recipient: "Marcus Reed · VP, Finance",
        fileName: "2027 Operating Forecast.xlsx",
        receivedAt: "2026-08-01T14:42:00.000Z",
      });
    });
  });

  it("labels a received forecast that failed extraction as needing attention", () => {
    const failed = createNorthstarPreset("northstar-document-received");
    failed.request = {
      ...failed.request,
      status: "failed",
      error: "The workbook could not be read.",
    };
    window.sessionStorage.setItem(NORTHSTAR_STORAGE_KEY, JSON.stringify(failed));
    renderWorkspace("/credit-reviews/northstar-health/sources");

    fireEvent.click(screen.getByRole("button", { name: "Continue document processing" }));

    const preview = screen.getByLabelText("Forecast preview");
    expect(within(preview).getByText("Needs attention")).toBeTruthy();
  });

  it("bridges the received request into verification and the completed analysis", async () => {
    window.sessionStorage.setItem(
      NORTHSTAR_STORAGE_KEY,
      JSON.stringify(createNorthstarPreset("northstar-document-received")),
    );
    renderWorkspace("/credit-reviews/northstar-health/sources");

    const sourceActions = screen.getByLabelText("Evidence options");
    expect(within(sourceActions).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Review received forecast",
      "View borrower request",
    ]);
    expect(screen.getByText("Marcus Reed · Secure portal")).toBeTruthy();

    fireEvent.click(within(sourceActions).getByRole("button", { name: "View borrower request" }));
    let dialog = screen.getByRole("dialog", { name: "Forecast received" });
    expect(within(dialog).getAllByText("2027 Operating Forecast.xlsx").length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText("Marcus Reed · Secure portal").length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/Aug 1, 2026 at 10:42 AM/).length).toBeGreaterThan(0);
    expect(within(dialog).getByText("Awaiting analyst verification")).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: "Review received forecast" }));
    dialog = screen.getByRole("dialog", { name: "Verify before use" });
    expect(within(dialog).getAllByText("Extraction").length).toBeGreaterThan(0);
    expect(within(dialog).getByText("Ready")).toBeTruthy();
    expect(within(dialog).getByText("Evidence review")).toBeTruthy();
    expect(within(dialog).getAllByText("1.29x").length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText("Marcus Reed · Secure portal").length).toBeGreaterThan(0);

    fireEvent.click(within(dialog).getByRole("button", { name: "Verify & update analysis" }));

    await waitFor(() => {
      dialog = screen.getByRole("dialog", { name: "Downside capacity verified" });
      expect(within(dialog).getByText("Analysis ready")).toBeTruthy();
    });
    const result = within(dialog).getByRole("region", { name: "Updated downside analysis" });
    expect(within(result).getByText("1.36x")).toBeTruthy();
    expect(within(result).getByText("1.29x")).toBeTruthy();
    expect(within(result).getByText("1.20x")).toBeTruthy();
    expect(within(result).getByText("0.09x")).toBeTruthy();
  });
});
