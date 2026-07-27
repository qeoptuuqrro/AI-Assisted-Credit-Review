// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { usePersistentReviewState, useReviewWorkflowRevision } from "./usePersistentReviewState";

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

function Harness() {
  const [state, dispatch] = usePersistentReviewState((current: number, action: "increment") => action === "increment" ? current + 1 : current, 0, "test.credit-review-state");
  const revision = useReviewWorkflowRevision(["test.credit-review-state"]);
  return <><span data-testid="state">{state}</span><span data-testid="revision">{revision}</span><button type="button" onClick={() => dispatch("increment")}>Increment</button></>;
}

describe("credit review workflow persistence", () => {
  it("notifies same-tab consumers after persisted workflow state changes", async () => {
    render(<Harness />);
    const initialRevision = Number(screen.getByTestId("revision").textContent);

    fireEvent.click(screen.getByRole("button", { name: "Increment" }));

    await waitFor(() => expect(Number(screen.getByTestId("revision").textContent)).toBeGreaterThan(initialRevision));
    expect(screen.getByTestId("state").textContent).toBe("1");
    expect(window.sessionStorage.getItem("test.credit-review-state")).toBe("1");
  });
});
