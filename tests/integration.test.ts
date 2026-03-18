import { describe, it, expect } from "vitest";
import { Survivalnode } from "../src/core.js";

describe("Survivalnode integration", () => {
  it("handles concurrent ops", async () => {
    const c = new Survivalnode();
    await Promise.all([c.getfirstaid({a:1}), c.getfirstaid({b:2}), c.getfirstaid({c:3})]);
    expect(c.getStats().ops).toBe(3);
  });
  it("returns service name", async () => {
    const c = new Survivalnode();
    const r = await c.getfirstaid();
    expect(r.service).toBe("survivalnode");
  });
  it("handles 100 ops", async () => {
    const c = new Survivalnode();
    for (let i = 0; i < 100; i++) await c.getfirstaid({i});
    expect(c.getStats().ops).toBe(100);
  });
});
