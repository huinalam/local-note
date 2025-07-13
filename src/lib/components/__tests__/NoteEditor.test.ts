import { render, fireEvent } from "@testing-library/svelte";
import { expect, test, describe, vi } from "vitest";
import NoteEditor from "../NoteEditor.svelte";
import type { Note } from "../../database/types";

describe("NoteEditor", () => {
  const mockNote: Note = {
    id: "1",
    title: "Test Note",
    content: "Test content",
    tags: ["test"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  test("should render note editor with content textarea", () => {
    const { getByRole } = render(NoteEditor, {
      props: {
        note: mockNote,
      },
    });

    expect(getByRole("textbox", { name: /메모 내용/ })).toBeInTheDocument();
    expect(getByRole("textbox", { name: /메모 내용/ })).toHaveValue(
      "Test content"
    );
  });

  test("should handle content changes and generate title automatically", async () => {
    const mockOnChange = vi.fn();
    const { getByRole } = render(NoteEditor, {
      props: {
        note: mockNote,
        onChange: mockOnChange,
      },
    });

    const contentTextarea = getByRole("textbox", { name: /메모 내용/ });
    await fireEvent.input(contentTextarea, {
      target: { value: "New first line\nSecond line content" },
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNote,
      content: "New first line\nSecond line content",
      title: "New first line",
    });
  });

  test("should truncate long titles to 50 characters", async () => {
    const mockOnChange = vi.fn();
    const { getByRole } = render(NoteEditor, {
      props: {
        note: mockNote,
        onChange: mockOnChange,
      },
    });

    // 정확히 50자를 넘는 문자열
    const longContent =
      "This is a very long first line that definitely exceeds fifty characters";
    const expectedTitle =
      "This is a very long first line that definitely exc...";

    const contentTextarea = getByRole("textbox", { name: /메모 내용/ });
    await fireEvent.input(contentTextarea, { target: { value: longContent } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockNote,
      content: longContent,
      title: expectedTitle,
    });
  });

  test("should display empty state for new note", () => {
    const emptyNote: Note = {
      id: "",
      title: "",
      content: "",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { getByRole } = render(NoteEditor, {
      props: {
        note: emptyNote,
      },
    });

    const contentTextarea = getByRole("textbox", {
      name: /메모 내용/,
    }) as HTMLTextAreaElement;

    expect(contentTextarea.value).toBe("");
    expect(contentTextarea.placeholder).toBe("메모를 입력하세요...");
  });
});
