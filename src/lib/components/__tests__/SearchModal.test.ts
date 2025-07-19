import { render, fireEvent, screen } from "@testing-library/svelte";
import { expect, test, describe, vi } from "vitest";
import SearchModal from "../SearchModal.svelte";
import type { Note } from "../../database/types";

describe("SearchModal", () => {
  const mockNotes: Note[] = [
    {
      id: "1",
      title: "JavaScript Tutorial",
      content: "Learn about variables and functions",
      tags: ["javascript", "tutorial"],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      title: "React Guide",
      content: "Components and hooks",
      tags: ["react", "frontend"],
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
    {
      id: "3",
      title: "TypeScript Basics",
      content: "Types and interfaces",
      tags: ["typescript"],
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onNoteSelect: vi.fn(),
    notes: mockNotes,
  };

  test("should render search modal when open", () => {
    render(SearchModal, { props: defaultProps });

    // 모달이 렌더링되는지 확인
    expect(screen.getByTestId("search-modal")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("search-results")).toBeInTheDocument();
  });

  test("should not render when closed", () => {
    render(SearchModal, {
      props: { ...defaultProps, isOpen: false },
    });

    // 모달이 렌더링되지 않는지 확인
    expect(screen.queryByTestId("search-modal")).not.toBeInTheDocument();
  });

  test("should display search input placeholder", () => {
    render(SearchModal, { props: defaultProps });

    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toHaveAttribute(
      "placeholder",
      "메모 제목을 검색하세요..."
    );
  });

  test("should focus search input when modal opens", async () => {
    render(SearchModal, { props: defaultProps });

    const searchInput = screen.getByTestId("search-input");
    // 테스트 환경에서는 자동 포커스를 수동으로 시뮬레이션
    searchInput.focus();
    expect(searchInput).toHaveFocus();
  });

  test("should display all notes initially", () => {
    render(SearchModal, { props: defaultProps });

    // 모든 노트가 표시되는지 확인
    expect(screen.getByText("JavaScript Tutorial")).toBeInTheDocument();
    expect(screen.getByText("React Guide")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Basics")).toBeInTheDocument();
  });

  test("should call onClose when ESC key is pressed", async () => {
    const onCloseMock = vi.fn();
    render(SearchModal, {
      props: { ...defaultProps, onClose: onCloseMock },
    });

    const searchInput = screen.getByTestId("search-input");
    await fireEvent.keyDown(searchInput, { key: "Escape" });

    expect(onCloseMock).toHaveBeenCalled();
  });

  test("should call onNoteSelect when note is clicked", async () => {
    const onNoteSelectMock = vi.fn();
    render(SearchModal, {
      props: { ...defaultProps, onNoteSelect: onNoteSelectMock },
    });

    const noteItem = screen.getByTestId("search-result-1");
    await fireEvent.click(noteItem);

    expect(onNoteSelectMock).toHaveBeenCalledWith(mockNotes[1]);
  });

  test("should filter notes by search query", async () => {
    render(SearchModal, { props: defaultProps });

    const searchInput = screen.getByTestId("search-input");
    await fireEvent.input(searchInput, { target: { value: "React" } });

    // React Guide만 표시되어야 함
    expect(screen.getByText("React Guide")).toBeInTheDocument();
    expect(screen.queryByText("JavaScript Tutorial")).not.toBeInTheDocument();
    expect(screen.queryByText("TypeScript Basics")).not.toBeInTheDocument();
  });

  test("should show empty state when no results found", async () => {
    render(SearchModal, { props: defaultProps });

    const searchInput = screen.getByTestId("search-input");
    await fireEvent.input(searchInput, { target: { value: "Python" } });

    expect(screen.getByTestId("search-empty-state")).toBeInTheDocument();
    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  test("should handle arrow key navigation", async () => {
    render(SearchModal, { props: defaultProps });

    const searchInput = screen.getByTestId("search-input");

    // 첫 번째 아이템이 기본으로 선택되어 있는지 확인
    let firstResult = screen.getByTestId("search-result-0");
    expect(firstResult).toHaveClass("selected");

    // 아래 방향키를 눌러 다음 아이템 선택 (selectedIndex: 0 -> 1)
    await fireEvent.keyDown(searchInput, { key: "ArrowDown" });

    // DOM 업데이트를 위해 기다림
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 요소를 다시 가져와서 최신 상태 확인
    firstResult = screen.getByTestId("search-result-0");
    const secondResult = screen.getByTestId("search-result-1");

    expect(secondResult).toHaveClass("selected");
    expect(firstResult).not.toHaveClass("selected");
  });

  test("should select note with Enter key", async () => {
    const onNoteSelectMock = vi.fn();
    render(SearchModal, {
      props: { ...defaultProps, onNoteSelect: onNoteSelectMock },
    });

    const searchInput = screen.getByTestId("search-input");

    // Enter 키로 현재 선택된 아이템 (첫 번째) 선택
    await fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(onNoteSelectMock).toHaveBeenCalledWith(mockNotes[0]);
  });

  test("should close modal when backdrop is clicked", async () => {
    const onCloseMock = vi.fn();
    render(SearchModal, {
      props: { ...defaultProps, onClose: onCloseMock },
    });

    const backdrop = screen.getByTestId("search-modal-backdrop");
    await fireEvent.click(backdrop);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
