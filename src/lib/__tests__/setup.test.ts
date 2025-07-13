import { describe, it, expect } from "vitest";

describe("Test Environment Setup", () => {
  it("should setup test environment correctly", () => {
    expect(true).toBe(true);
  });

  it("should have access to DOM APIs", () => {
    const element = document.createElement("div");
    element.textContent = "test";
    expect(element.textContent).toBe("test");
  });

  it("should support async/await", async () => {
    const result = await Promise.resolve("async test");
    expect(result).toBe("async test");
  });
});
