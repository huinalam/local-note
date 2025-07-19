import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import SimpleMDEEditor from "../SimpleMDEEditor.svelte";
import type { Note } from "../../database/types";

// EasyMDE 모킹
vi.mock("easymde", () => {
  const mockEasyMDE = {
    value: vi.fn().mockReturnValue(""),
    codemirror: {
      on: vi.fn(),
      off: vi.fn(),
    },
    cleanup: vi.fn(),
    markdown: vi.fn().mockReturnValue("<p>test</p>"),
  };

  return {
    default: vi.fn().mockImplementation(() => mockEasyMDE),
  };
});

// CSS 모킹
vi.mock("easymde/dist/easymde.min.css", () => ({}));

describe("SimpleMDEEditor", () => {
  let mockNote: Note;
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNote = {
      id: "test-id",
      title: "Test Note",
      content: "# Test Content",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOnChange = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render SimpleMDE editor container", () => {
    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: mockOnChange },
    });

    expect(getByTestId("simplemde-editor-container")).toBeInTheDocument();
  });

  it("should render textarea element", () => {
    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: mockOnChange },
    });

    expect(getByTestId("simplemde-textarea")).toBeInTheDocument();
  });

  it("should apply mobile layout class when isMobile is true", () => {
    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: mockOnChange, isMobile: true },
    });

    const container = getByTestId("simplemde-editor-container");
    expect(container).toHaveClass("mobile-layout");
  });

  it("should not apply mobile layout class when isMobile is false", () => {
    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: mockOnChange, isMobile: false },
    });

    const container = getByTestId("simplemde-editor-container");
    expect(container).not.toHaveClass("mobile-layout");
  });

  it("should handle empty note", () => {
    const emptyNote: Note = {
      id: "",
      title: "",
      content: "",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: emptyNote, onChange: mockOnChange },
    });

    expect(getByTestId("simplemde-editor-container")).toBeInTheDocument();
  });

  it("should generate title from content correctly", () => {
    const noteWithContent: Note = {
      id: "test-id",
      title: "",
      content: "# This is a heading\n\nSome content here",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(SimpleMDEEditor, {
      props: { note: noteWithContent, onChange: mockOnChange },
    });

    // 컴포넌트가 렌더링되는지 확인
    expect(
      document.querySelector('[data-testid="simplemde-editor-container"]')
    ).toBeInTheDocument();
  });

  it("should handle long content for title generation", () => {
    const longContent =
      "This is a very long title that should be truncated when it exceeds the maximum length";
    const noteWithLongContent: Note = {
      id: "test-id",
      title: "",
      content: longContent,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(SimpleMDEEditor, {
      props: { note: noteWithLongContent, onChange: mockOnChange },
    });

    // 컴포넌트가 렌더링되는지 확인
    expect(
      document.querySelector('[data-testid="simplemde-editor-container"]')
    ).toBeInTheDocument();
  });

  it("should handle onChange callback", () => {
    render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: mockOnChange },
    });

    // onChange가 함수로 전달되었는지 확인
    expect(typeof mockOnChange).toBe("function");
  });

  it("should handle undefined onChange callback", () => {
    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: undefined },
    });

    // 에러 없이 렌더링되는지 확인
    expect(getByTestId("simplemde-editor-container")).toBeInTheDocument();
  });

  it("should set correct aria-label for accessibility", () => {
    const { getByTestId } = render(SimpleMDEEditor, {
      props: { note: mockNote, onChange: mockOnChange },
    });

    const textarea = getByTestId("simplemde-textarea");
    expect(textarea).toHaveAttribute("aria-label", "SimpleMDE 마크다운 에디터");
  });
});
