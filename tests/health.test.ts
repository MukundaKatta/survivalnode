import { describe, it, expect } from "vitest";
import { getHealth } from "../src/health.js";

describe("getHealth", () => {
  it("reports the service as ok", () => {
    const h = getHealth();
    expect(h.service).toBe("survivalnode");
    expect(h.status).toBe("ok");
    expect(h.version).toBe("0.1.0");
  });
  it("includes a non-negative uptime", () => {
    expect(getHealth().uptime).toBeGreaterThanOrEqual(0);
  });
  it("passes through metrics", () => {
    const h = getHealth({ requests: 5 });
    expect(h.metrics.requests).toBe(5);
  });
});
