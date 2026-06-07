import { describe, it, expect } from "vitest";
import {
  generateId,
  retry,
  sanitizeInput,
  elapsed,
  SimpleCache,
} from "../src/utils.js";

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
  it("produces unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("retry", () => {
  it("returns the result on first success", async () => {
    const r = await retry(async () => 42);
    expect(r).toBe(42);
  });
  it("retries until success", async () => {
    let calls = 0;
    const r = await retry(
      async () => {
        calls++;
        if (calls < 3) throw new Error("boom");
        return "ok";
      },
      5,
      1,
    );
    expect(r).toBe("ok");
    expect(calls).toBe(3);
  });
  it("rejects after exhausting retries", async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          throw new Error("always");
        },
        3,
        1,
      ),
    ).rejects.toThrow("always");
    expect(calls).toBe(3);
  });
  it("runs at least once even with maxRetries <= 0", async () => {
    let calls = 0;
    const r = await retry(
      async () => {
        calls++;
        return "once";
      },
      0,
      1,
    );
    expect(r).toBe("once");
    expect(calls).toBe(1);
  });
});

describe("sanitizeInput", () => {
  it("trims strings", () => {
    expect(sanitizeInput("  hi  ")).toBe("hi");
  });
  it("returns empty string for null/undefined", () => {
    expect(sanitizeInput(null)).toBe("");
    expect(sanitizeInput(undefined)).toBe("");
  });
  it("serializes objects", () => {
    expect(sanitizeInput({ a: 1 })).toBe('{"a":1}');
  });
  it("caps length at 10000 characters", () => {
    expect(sanitizeInput("x".repeat(20000)).length).toBe(10000);
  });
});

describe("elapsed", () => {
  it("is non-negative", () => {
    expect(elapsed(Date.now())).toBeGreaterThanOrEqual(0);
  });
});

describe("SimpleCache", () => {
  it("stores and retrieves values", () => {
    const c = new SimpleCache<number>();
    c.set("a", 1);
    expect(c.get("a")).toBe(1);
    expect(c.size).toBe(1);
  });
  it("returns undefined for missing keys", () => {
    const c = new SimpleCache<number>();
    expect(c.get("missing")).toBeUndefined();
  });
  it("expires entries after the TTL", () => {
    const c = new SimpleCache<number>();
    c.set("a", 1, -1);
    expect(c.get("a")).toBeUndefined();
    expect(c.size).toBe(0);
  });
  it("clears all entries", () => {
    const c = new SimpleCache<number>();
    c.set("a", 1);
    c.set("b", 2);
    c.clear();
    expect(c.size).toBe(0);
  });
});
