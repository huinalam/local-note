import { render, fireEvent, screen } from "@testing-library/svelte";
import { expect, test, describe, vi, beforeEach } from "vitest";
import ShortcutHelpModal from "../ShortcutHelpModal.svelte";
import {
  HelpShortcutCategory,
  type ShortcutHelpData,
} from "../../types/shortcut";

describe("ShortcutHelpModal", () => {
  const mockShortcutData: ShortcutHelpData[] = [
    {
      category: HelpShortcutCategory.FILE,
      shortcuts: [
        {
          id: "file.new",
          keys: "ctrl+n",
          action: "file.new",
          context: "global" as any,
          description: "새로운 메모를 생성합니다",
          category: "file",
          enabled: true,
          priority: 10,
        },
        {
          id: "file.save",
          keys: "ctrl+s",
          action: "file.save",
          context: "global" as any,
          description: "현재 메모를 저장합니다",
          category: "file",
          enabled: true,
          priority: 10,
        },
      ],
    },
    {
      category: HelpShortcutCategory.EDITOR,
      shortcuts: [
        {
          id: "editor.bold",
          keys: "Cmd-B",
          action: "toggleBold",
          description: "텍스트를 굵게 만듭니다",
          category: HelpShortcutCategory.EDITOR,
        },
        {
          id: "editor.italic",
          keys: "Cmd-I",
          action: "toggleItalic",
          description: "텍스트를 기울임체로 만듭니다",
          category: HelpShortcutCategory.EDITOR,
        },
      ],
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    shortcutData: mockShortcutData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("렌더링", () => {
    test("should render modal when open", () => {
      render(ShortcutHelpModal, { props: defaultProps });

      expect(screen.getByTestId("shortcut-help-modal")).toBeInTheDocument();
      expect(screen.getByText("단축키 도움말")).toBeInTheDocument();
    });

    test("should not render when closed", () => {
      render(ShortcutHelpModal, {
        props: { ...defaultProps, isOpen: false },
      });

      expect(
        screen.queryByTestId("shortcut-help-modal")
      ).not.toBeInTheDocument();
    });

    test("should display category tabs", () => {
      render(ShortcutHelpModal, { props: defaultProps });

      expect(screen.getByText("파일 관리")).toBeInTheDocument();
      expect(screen.getByText("마크다운 편집")).toBeInTheDocument();
    });

    test("should display shortcuts for selected category", () => {
      render(ShortcutHelpModal, { props: defaultProps });

      // 첫 번째 카테고리(파일 관리)가 기본 선택됨
      expect(screen.getByText("새로운 메모를 생성합니다")).toBeInTheDocument();
      expect(screen.getByText("현재 메모를 저장합니다")).toBeInTheDocument();
    });

    test("should display formatted key combinations", () => {
      render(ShortcutHelpModal, { props: defaultProps });

      // 키 조합이 플랫폼에 맞게 포맷되어 표시되어야 함
      expect(screen.getByTestId("shortcut-key-ctrl+n")).toBeInTheDocument();
      expect(screen.getByTestId("shortcut-key-ctrl+s")).toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    test("should close modal when close button is clicked", async () => {
      const onClose = vi.fn();
      render(ShortcutHelpModal, {
        props: { ...defaultProps, onClose },
      });

      const closeButton = screen.getByLabelText("도움말 모달 닫기");
      await fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("should close modal when Escape key is pressed", async () => {
      const onClose = vi.fn();
      render(ShortcutHelpModal, {
        props: { ...defaultProps, onClose },
      });

      await fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("should close modal when backdrop is clicked", async () => {
      const onClose = vi.fn();
      render(ShortcutHelpModal, {
        props: { ...defaultProps, onClose },
      });

      const backdrop = screen.getByTestId("shortcut-help-backdrop");
      await fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("should switch categories when tab is clicked", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      // 에디터 탭 클릭
      const editorTab = screen.getByText("마크다운 편집");
      await fireEvent.click(editorTab);

      // 에디터 단축키들이 표시되어야 함
      expect(screen.getByText("텍스트를 굵게 만듭니다")).toBeInTheDocument();
      expect(
        screen.getByText("텍스트를 기울임체로 만듭니다")
      ).toBeInTheDocument();

      // 파일 단축키들은 보이지 않아야 함
      expect(
        screen.queryByText("새로운 메모를 생성합니다")
      ).not.toBeInTheDocument();
    });

    test("should navigate categories with arrow keys", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      // ArrowRight로 다음 카테고리로 이동
      await fireEvent.keyDown(document, { key: "ArrowRight" });

      // 에디터 단축키들이 표시되어야 함
      expect(screen.getByText("텍스트를 굵게 만듭니다")).toBeInTheDocument();
    });

    test("should navigate categories with tab key", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const modal = screen.getByTestId("shortcut-help-modal");

      // Tab 키로 포커스 이동 테스트
      await fireEvent.keyDown(modal, { key: "Tab" });

      // 포커스가 다음 요소로 이동해야 함 (구체적인 요소는 구현에 따라 달라짐)
      expect(document.activeElement).not.toBe(modal);
    });
  });

  describe("접근성", () => {
    test("should have proper ARIA attributes", () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const modal = screen.getByTestId("shortcut-help-modal");
      expect(modal).toHaveAttribute("role", "dialog");
      expect(modal).toHaveAttribute("aria-modal", "true");
      expect(modal).toHaveAttribute("aria-labelledby");
    });

    test("should focus on modal when opened", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const modal = screen.getByTestId("shortcut-help-modal");

      // 포커스는 비동기로 설정되므로 잠시 기다립니다
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(document.activeElement).toBe(modal);
    });

    test("should trap focus within modal", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const modal = screen.getByTestId("shortcut-help-modal");

      // 포커스가 비동기로 설정되므로 잠시 기다립니다
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Tab을 여러 번 눌러도 모달 내부에서만 포커스가 이동해야 함
      await fireEvent.keyDown(modal, { key: "Tab" });
      await fireEvent.keyDown(modal, { key: "Tab" });
      await fireEvent.keyDown(modal, { key: "Tab" });

      // 포커스가 모달 내부에 있어야 함 (모달이나 모달의 자식 요소)
      const activeElement = document.activeElement;
      expect(activeElement === modal || modal.contains(activeElement)).toBe(
        true
      );
    });
  });

  describe("검색 기능", () => {
    test("should filter shortcuts when search query is entered", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const searchInput = screen.getByPlaceholderText("단축키 검색...");
      await fireEvent.input(searchInput, { target: { value: "저장" } });

      // "저장"이 포함된 단축키만 표시되어야 함
      expect(screen.getByText("현재 메모를 저장합니다")).toBeInTheDocument();
      expect(
        screen.queryByText("새로운 메모를 생성합니다")
      ).not.toBeInTheDocument();
    });

    test("should clear search when clear button is clicked", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const searchInput = screen.getByPlaceholderText("단축키 검색...");
      await fireEvent.input(searchInput, { target: { value: "저장" } });

      const clearButton = screen.getByLabelText("검색 지우기");
      await fireEvent.click(clearButton);

      // 모든 단축키가 다시 표시되어야 함
      expect(searchInput).toHaveValue("");
      expect(screen.getByText("새로운 메모를 생성합니다")).toBeInTheDocument();
    });

    test("should show no results message when no shortcuts match", async () => {
      render(ShortcutHelpModal, { props: defaultProps });

      const searchInput = screen.getByPlaceholderText("단축키 검색...");
      await fireEvent.input(searchInput, {
        target: { value: "존재하지않는검색어" },
      });

      expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
    });
  });

  describe("빈 데이터 처리", () => {
    test("should handle empty shortcut data", () => {
      render(ShortcutHelpModal, {
        props: { ...defaultProps, shortcutData: [] },
      });

      expect(screen.getByText("등록된 단축키가 없습니다")).toBeInTheDocument();
    });

    test("should handle categories with no shortcuts", () => {
      const emptyCategory: ShortcutHelpData[] = [
        {
          category: HelpShortcutCategory.FILE,
          shortcuts: [],
        },
      ];

      render(ShortcutHelpModal, {
        props: { ...defaultProps, shortcutData: emptyCategory },
      });

      expect(
        screen.getByText("이 카테고리에는 단축키가 없습니다")
      ).toBeInTheDocument();
    });
  });
});
