import { describe, it, expect } from "vitest";
import { SurvivalKit } from "../src/core.js";
describe("SurvivalKit", () => {
  it("init", () => { expect(new SurvivalKit().getStats().ops).toBe(0); });
  it("op", async () => { const c = new SurvivalKit(); await c.getfirstaid(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new SurvivalKit(); await c.getfirstaid(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
