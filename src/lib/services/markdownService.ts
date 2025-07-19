import { marked } from "marked";

export class MarkdownService {
  constructor() {
    // marked 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  /**
   * 마크다운 텍스트를 HTML로 변환합니다
   */
  parseMarkdown(markdown: string): string {
    if (!markdown || markdown.trim() === "") {
      return "";
    }

    try {
      return marked(markdown) as string;
    } catch (error) {
      console.error("Markdown parsing error:", error);
      return markdown; // 파싱 실패 시 원본 텍스트 반환
    }
  }
}
