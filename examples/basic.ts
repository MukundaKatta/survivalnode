// Basic usage example for survivalnode
import { Survivalnode } from "../src/core.js";

async function main() {
  const instance = new Survivalnode({ verbose: true });

  console.log("=== survivalnode Example ===\n");

  // Run primary operation
  const result = await instance.getfirstaid({ input: "example data", mode: "demo" });
  console.log("Result:", JSON.stringify(result, null, 2));

  // Run multiple operations
  const ops = ["getfirstaid", "getsurvivaltip", "translatemorse"];
  for (const op of ops) {
    const r = await (instance as any)[op]({ source: "example" });
    console.log(`${op}:`, r.processed ? "✓" : "✗");
  }

  // Check stats
  console.log("\nStats:", JSON.stringify(instance.getStats(), null, 2));
}

main().catch(console.error);
