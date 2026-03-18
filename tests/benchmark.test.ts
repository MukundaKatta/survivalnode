import { describe, it, expect } from "vitest";
import { Survivalnode } from "../src/core.js";

describe("Survivalnode benchmarks", () => {
  it("handles 1000 ops under 1s", async () => {
    const c = new Survivalnode();
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      await c.getfirstaid({ i });
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
    expect(c.getStats().ops).toBe(1000);
  });

  it("maintains accuracy at scale", async () => {
    const c = new Survivalnode();
    const n = 500;
    for (let i = 0; i < n; i++) {
      const r = await c.getfirstaid({ i });
      expect(r.ok).toBe(true);
      expect(r.n).toBe(i + 1);
    }
  });

  it("reset is instant", async () => {
    const c = new Survivalnode();
    for (let i = 0; i < 100; i++) await c.getfirstaid();
    const start = Date.now();
    c.reset();
    expect(Date.now() - start).toBeLessThan(10);
    expect(c.getStats().ops).toBe(0);
  });
});
