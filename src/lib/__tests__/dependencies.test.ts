import { describe, it, expect } from "vitest";

describe("Dependencies Import", () => {
  it("should import Dexie successfully", async () => {
    const dexie = await import("dexie");
    expect(dexie).toBeDefined();
    expect(dexie.Dexie).toBeDefined();
  });

  it("should import marked successfully", async () => {
    const marked = await import("marked");
    expect(marked).toBeDefined();
    expect(marked.marked).toBeDefined();
  });

  it("should import highlight.js successfully", async () => {
    const hljs = await import("highlight.js");
    expect(hljs).toBeDefined();
    expect(hljs.default).toBeDefined();
  });

  it("should import katex successfully", async () => {
    const katex = await import("katex");
    expect(katex).toBeDefined();
    expect(katex.default).toBeDefined();
  });
});
