import { render } from "@testing-library/svelte";
import { expect, test, describe } from "vitest";
import MarkdownPreview from "../MarkdownPreview.svelte";

describe("MarkdownPreview", () => {
  test("should render markdown content as HTML", () => {
    const { container } = render(MarkdownPreview, {
      props: {
        content: "# Hello World\n\nThis is **bold** text.",
      },
    });

    expect(container.innerHTML).toContain("<h1");
    expect(container.innerHTML).toContain("Hello World");
    expect(container.innerHTML).toContain("<strong>bold</strong>");
  });

  test("should handle empty content", () => {
    const { container } = render(MarkdownPreview, {
      props: {
        content: "",
      },
    });

    const previewDiv = container.querySelector(
      '[data-testid="markdown-preview"]'
    );
    expect(previewDiv).toBeInTheDocument();
    expect(previewDiv?.innerHTML.trim()).toBe("<!---->");
  });

  test("should update when content changes", async () => {
    const { rerender, container } = render(MarkdownPreview, {
      props: {
        content: "# Initial",
      },
    });

    expect(container.innerHTML).toContain("Initial");

    await rerender({ content: "# Updated" });
    expect(container.innerHTML).toContain("Updated");
    expect(container.innerHTML).not.toContain("Initial");
  });

  test("should apply CSS classes for styling", () => {
    const { container } = render(MarkdownPreview, {
      props: {
        content: "# Test",
      },
    });

    const previewDiv = container.querySelector(
      '[data-testid="markdown-preview"]'
    );
    expect(previewDiv).toHaveClass("markdown-preview");
  });
});
