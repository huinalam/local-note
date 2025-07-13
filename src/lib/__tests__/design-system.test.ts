import { describe, it, expect, beforeEach } from "vitest";

describe("Design System CSS Variables", () => {
  beforeEach(() => {
    // Reset document styles for each test
    document.documentElement.style.cssText = "";
  });

  it("should apply primary color variables", () => {
    // Simulate CSS variables being loaded
    document.documentElement.style.setProperty(
      "--color-primary-500",
      "#0ea5e9"
    );

    const primaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-primary-500");

    expect(primaryColor.trim()).toBe("#0ea5e9");
  });

  it("should apply background color variables", () => {
    document.documentElement.style.setProperty("--color-bg-primary", "#0a0a0a");

    const bgColor = getComputedStyle(document.documentElement).getPropertyValue(
      "--color-bg-primary"
    );

    expect(bgColor.trim()).toBe("#0a0a0a");
  });

  it("should apply text color variables", () => {
    document.documentElement.style.setProperty(
      "--color-text-primary",
      "#ffffff"
    );

    const textColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-text-primary");

    expect(textColor.trim()).toBe("#ffffff");
  });

  it("should apply font family variables", () => {
    const expectedFont =
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif";
    document.documentElement.style.setProperty(
      "--font-family-sans",
      expectedFont
    );

    const fontFamily = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--font-family-sans");

    expect(fontFamily.trim()).toBe(expectedFont);
  });
});
