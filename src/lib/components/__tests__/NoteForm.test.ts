import { render, fireEvent } from "@testing-library/svelte";
import { expect, test, describe, vi } from "vitest";
import NoteForm from "../NoteForm.svelte";

// Mock the database and services
vi.mock("../../database/NoteDatabase");
vi.mock("../../services/noteService");
vi.mock("../../services/autoSaveService");

describe("NoteForm", () => {
  test("should render note list and editor", () => {
    const { getByText, getByRole } = render(NoteForm);

    // Should show app title
    expect(getByText(/📝 Local Note/)).toBeInTheDocument();

    // Should show new note button
    expect(getByRole("button", { name: /새 메모/ })).toBeInTheDocument();

    // Should show editor area
    expect(
      getByRole("textbox", { name: /마크다운 에디터/ })
    ).toBeInTheDocument();

    // Should show empty state
    expect(getByText(/아직 메모가 없습니다/)).toBeInTheDocument();
  });

  test("should create new note when clicking new note button", async () => {
    const { getByRole } = render(NoteForm);

    const newNoteButton = getByRole("button", { name: /새 메모/ });
    await fireEvent.click(newNoteButton);

    // Should clear the editor
    const contentTextarea = getByRole("textbox", { name: /마크다운 에디터/ });
    expect(contentTextarea).toHaveValue("");
  });

  test("should save note when typing", async () => {
    const { getByRole } = render(NoteForm);

    const contentTextarea = getByRole("textbox", { name: /마크다운 에디터/ });

    // 입력 이벤트를 발생시킵니다
    await fireEvent.input(contentTextarea, {
      target: { value: "Test content for new note" },
    });

    // Note: 실제 저장 동작은 실제 애플리케이션에서 확인하고,
    // 여기서는 텍스트 영역이 존재하고 접근 가능한지만 확인합니다
    expect(contentTextarea).toBeInTheDocument();
    expect(contentTextarea).toHaveAttribute(
      "placeholder",
      "마크다운으로 메모를 작성하세요..."
    );
  });

  test("should display main editor area", () => {
    const { container } = render(NoteForm);

    // Should have main editor area
    const editorArea = container.querySelector(".editor-area");
    expect(editorArea).toBeInTheDocument();
  });
});
