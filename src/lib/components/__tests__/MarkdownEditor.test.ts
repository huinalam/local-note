import { render, fireEvent } from "@testing-library/svelte";
import { expect, test, describe, vi } from "vitest";
import MarkdownEditor from "../MarkdownEditor.svelte";
import type { Note } from "../../database/types";

describe("MarkdownEditor", () => {
  const mockNote: Note = {
    id: "1",
    title: "Test Note",
    content: "# Hello World\n\nThis is **bold** text.",
    tags: ["test"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  test("should render editor and preview side by side", () => {
    const { getByTestId } = render(MarkdownEditor, {
      props: {
        note: mockNote,
      },
    });

    expect(getByTestId("markdown-editor-container")).toBeInTheDocument();
    expect(getByTestId("markdown-textarea")).toBeInTheDocument();
    expect(getByTestId("markdown-preview")).toBeInTheDocument();
  });

  test("should sync content between editor and preview", async () => {
    const { getByTestId } = render(MarkdownEditor, {
      props: {
        note: mockNote,
      },
    });

    const textarea = getByTestId("markdown-textarea");
    const preview = getByTestId("markdown-preview");

    // 초기 내용 확인
    expect(textarea).toHaveValue(mockNote.content);
    expect(preview.innerHTML).toContain("<h1");
    expect(preview.innerHTML).toContain("Hello World");

    // 내용 변경
    await fireEvent.input(textarea, {
      target: { value: "## New Heading\n\nNew content" },
    });

    // 프리뷰가 업데이트되었는지 확인
    expect(preview.innerHTML).toContain("<h2");
    expect(preview.innerHTML).toContain("New Heading");
  });

  test("should call onChange when content changes", async () => {
    const mockOnChange = vi.fn();
    const { getByTestId } = render(MarkdownEditor, {
      props: {
        note: mockNote,
        onChange: mockOnChange,
      },
    });

    const textarea = getByTestId("markdown-textarea");
    await fireEvent.input(textarea, {
      target: { value: "Updated content" },
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNote,
      content: "Updated content",
      title: "Updated content",
    });
  });

  test("should handle toggle between editor and preview on mobile", async () => {
    const { getByTestId, queryByTestId } = render(MarkdownEditor, {
      props: {
        note: mockNote,
        isMobile: true,
      },
    });

    const container = getByTestId("markdown-editor-container");
    expect(container).toHaveClass("mobile-layout");

    // 토글 버튼 확인
    const toggleButton = getByTestId("view-toggle-button");
    expect(toggleButton).toBeInTheDocument();

    // 기본적으로 에디터가 보여야 함
    expect(getByTestId("markdown-textarea")).toBeVisible();
    expect(queryByTestId("markdown-preview")).toBeNull();

    // 프리뷰로 전환
    await fireEvent.click(toggleButton);
    expect(queryByTestId("markdown-textarea")).toBeNull();
    expect(getByTestId("markdown-preview")).toBeVisible();
  });
});
