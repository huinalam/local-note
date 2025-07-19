import { describe, it, expect } from "vitest";
import { MarkdownService } from "../markdownService";

describe("MarkdownService", () => {
  const markdownService = new MarkdownService();

  describe("parseMarkdown", () => {
    it("should parse basic markdown heading", () => {
      const markdown = "# Hello World";
      const html = markdownService.parseMarkdown(markdown);
      expect(html).toContain("<h1");
      expect(html).toContain("Hello World");
      expect(html).toContain("</h1>");
    });

    it("should parse multiple headings", () => {
      const markdown = `# Heading 1
## Heading 2
### Heading 3`;
      const html = markdownService.parseMarkdown(markdown);
      expect(html).toContain("<h1");
      expect(html).toContain("<h2");
      expect(html).toContain("<h3");
    });

    it("should parse bold and italic text", () => {
      const markdown = "**bold** and *italic* text";
      const html = markdownService.parseMarkdown(markdown);
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("<em>italic</em>");
    });

    it("should parse code blocks", () => {
      const markdown = "```javascript\nconst hello = 'world';\n```";
      const html = markdownService.parseMarkdown(markdown);
      expect(html).toContain("<pre>");
      expect(html).toContain("<code");
      expect(html).toContain("const hello = ");
      expect(html).toContain("world");
    });

    it("should parse inline code", () => {
      const markdown = "Use `console.log()` for debugging";
      const html = markdownService.parseMarkdown(markdown);
      expect(html).toContain("<code>console.log()</code>");
    });

    it("should parse links", () => {
      const markdown = "[Google](https://google.com)";
      const html = markdownService.parseMarkdown(markdown);
      expect(html).toContain('<a href="https://google.com"');
      expect(html).toContain("Google");
      expect(html).toContain("</a>");
    });

    it("should handle empty input", () => {
      const html = markdownService.parseMarkdown("");
      expect(html).toBe("");
    });
  });
});
