import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { get } from "svelte/store";
import NoteForm from "../NoteForm.svelte";
import { isSidebarCollapsed } from "../../stores/uiStore";
import { ShortcutManager } from "../../services/ShortcutManager";

// 기존 서비스들을 모킹
vi.mock("../../database/NoteDatabase");
vi.mock("../../services/noteService");
vi.mock("../../services/autoSaveService");
vi.mock("../../services/ShortcutManager");
vi.mock("../../services/DefaultShortcuts");

describe("NoteForm - Sidebar Toggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 사이드바 상태 초기화
    isSidebarCollapsed.set(false);
  });

  it("사이드바 토글 버튼이 렌더링되어야 함", async () => {
    render(NoteForm);

    const toggleButton = screen.getByRole("button", {
      name: /사이드바 숨기기|사이드바 보이기/,
    });

    expect(toggleButton).toBeInTheDocument();
  });

  it("사이드바가 열린 상태일 때 올바른 아이콘과 텍스트를 표시해야 함", async () => {
    // 사이드바가 열린 상태
    isSidebarCollapsed.set(false);

    render(NoteForm);

    const toggleButton = screen.getByRole("button", {
      name: "사이드바 숨기기",
    });

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-label", "사이드바 숨기기");
  });

  it("사이드바가 닫힌 상태일 때 올바른 아이콘과 텍스트를 표시해야 함", async () => {
    // 사이드바가 닫힌 상태
    isSidebarCollapsed.set(true);

    render(NoteForm);

    const toggleButton = screen.getByRole("button", {
      name: "사이드바 보이기",
    });

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-label", "사이드바 보이기");
  });

  it("토글 버튼이 sidebar-header 내부에 위치해야 함", async () => {
    render(NoteForm);

    const sidebarHeader =
      screen.getByRole("region", { name: "sidebar-header" }) ||
      document.querySelector(".sidebar-header");
    const toggleButton = screen.getByRole("button", {
      name: /사이드바 숨기기|사이드바 보이기/,
    });

    expect(sidebarHeader).toContainElement(toggleButton);
  });

  it("버튼에 적절한 CSS 클래스가 적용되어야 함", async () => {
    render(NoteForm);

    const toggleButton = screen.getByRole("button", {
      name: /사이드바 숨기기|사이드바 보이기/,
    });

    expect(toggleButton).toHaveClass("sidebar-toggle-btn");
  });

  it("토글 버튼 클릭 시 사이드바 상태가 변경되어야 함", async () => {
    render(NoteForm);

    const toggleButton = screen.getByRole("button", {
      name: /사이드바 숨기기|사이드바 보이기/,
    });

    // 초기 상태 확인 (열림)
    expect(get(isSidebarCollapsed)).toBe(false);

    // 버튼 클릭
    await fireEvent.click(toggleButton);

    // 상태 변경 확인 (닫힘)
    expect(get(isSidebarCollapsed)).toBe(true);

    // 다시 버튼 클릭
    await fireEvent.click(toggleButton);

    // 상태 변경 확인 (열림)
    expect(get(isSidebarCollapsed)).toBe(false);
  });

  it("사이드바 토글 단축키가 동작해야 함", async () => {
    const { container } = render(NoteForm);

    // 초기 상태 확인
    expect(get(isSidebarCollapsed)).toBe(false);

    // 단축키 이벤트 트리거
    await fireEvent.keyDown(container, {
      key: "\\",
      metaKey: true,
      shiftKey: true,
    });

    // 상태 변경 확인
    expect(get(isSidebarCollapsed)).toBe(true);

    // 다시 단축키 이벤트 트리거
    await fireEvent.keyDown(container, {
      key: "\\",
      metaKey: true,
      shiftKey: true,
    });

    // 상태 변경 확인
    expect(get(isSidebarCollapsed)).toBe(false);
  });

  it("사이드바가 숨겨진 상태에서 플로팅 토글 버튼이 메인 영역에 표시되어야 함", async () => {
    // 사이드바를 숨긴 상태로 설정
    isSidebarCollapsed.set(true);

    render(NoteForm);

    // 플로팅 토글 버튼이 존재하는지 확인
    const floatingToggleButton = screen.getByRole("button", {
      name: "사이드바 보이기",
    });

    expect(floatingToggleButton).toBeInTheDocument();
    expect(floatingToggleButton).toHaveClass("floating-sidebar-toggle");
  });

  it("사이드바가 열린 상태에서는 플로팅 토글 버튼이 표시되지 않아야 함", async () => {
    // 사이드바를 연 상태로 설정
    isSidebarCollapsed.set(false);

    render(NoteForm);

    // 플로팅 토글 버튼이 존재하지 않는지 확인
    const floatingToggleButtons = screen.queryAllByRole("button", {
      name: "사이드바 보이기",
    });

    // 플로팅 클래스를 가진 버튼은 없어야 함
    const hasFloatingButton = floatingToggleButtons.some((button) =>
      button.classList.contains("floating-sidebar-toggle")
    );

    expect(hasFloatingButton).toBe(false);
  });

  it("플로팅 토글 버튼 클릭 시 사이드바가 다시 열려야 함", async () => {
    // 사이드바를 숨긴 상태로 설정
    isSidebarCollapsed.set(true);

    render(NoteForm);

    // 플로팅 토글 버튼 클릭
    const floatingToggleButton = screen.getByRole("button", {
      name: "사이드바 보이기",
    });

    await fireEvent.click(floatingToggleButton);

    // 사이드바가 다시 열렸는지 확인
    expect(get(isSidebarCollapsed)).toBe(false);
  });
});
