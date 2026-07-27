import { describe, expect, it } from "vitest";
import { getDesignRationale } from "./DesignRationalePanel";

describe("design rationale content", () => {
  it("uses page-aware rationale for the main workspace surfaces", () => {
    expect(getDesignRationale("/design-system").category).toBe("Design system");
    expect(getDesignRationale("/").category).toBe("Workspace overview");
    expect(getDesignRationale("/intelligence").category).toBe("Intelligence");
    expect(getDesignRationale("/credit-reviews").category).toBe("Credit review queue");
    expect(getDesignRationale("/credit-reviews/meridian-foods/findings").category).toBe("Credit review");
  });
});
