import { describe, expect, it } from "vitest";
import { segmentLeads } from "@/lib/lead-segmentation";
describe("lead segmentation", () => {
  const rows = [{ nome: "Carlos", origem: "Meta", score: "85" }, { nome: "Ana", origem: "Google", score: "92" }];
  it("returns only leads matching the selected origin", () => { expect(segmentLeads(rows, "origem", "Meta", "equals")).toEqual([rows[0]]); });
  it("filters scores numerically", () => { expect(segmentLeads(rows, "score", "90", "greater")).toEqual([rows[1]]); });
});