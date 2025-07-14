import type { ShortcutAction } from "../types/shortcut";

/**
 * 에디터에 포커스를 설정하는 액션
 */
export const focusEditorAction: ShortcutAction = {
  id: "focusEditor",
  name: "에디터 포커스",
  description: "에디터에 포커스를 설정합니다",
  handler: async (event: KeyboardEvent) => {
    try {
      const editorElement = document.querySelector<HTMLElement>(
        '[data-context="editor"]'
      );
      if (editorElement) {
        editorElement.focus();
        console.log("에디터에 포커스가 설정되었습니다");
      } else {
        console.log("에디터 요소를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("에디터 포커스 설정 실패:", error);
      throw error;
    }
  },
};

/**
 * 노트 목록에 포커스를 설정하는 액션
 */
export const focusNoteListAction: ShortcutAction = {
  id: "focusNoteList",
  name: "목록 포커스",
  description: "노트 목록에 포커스를 설정합니다",
  handler: async (event: KeyboardEvent) => {
    try {
      const listElement = document.querySelector<HTMLElement>(
        '[data-context="list"]'
      );
      if (listElement) {
        listElement.focus();
        console.log("노트 목록에 포커스가 설정되었습니다");
      } else {
        console.log("목록 요소를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("목록 포커스 설정 실패:", error);
      throw error;
    }
  },
};

/**
 * 사이드바를 토글하는 액션
 */
export const toggleSidebarAction: ShortcutAction = {
  id: "toggleSidebar",
  name: "사이드바 토글",
  description: "사이드바를 열거나 닫습니다",
  handler: async (event: KeyboardEvent) => {
    try {
      const sidebarElement =
        document.querySelector<HTMLElement>("[data-sidebar]");
      if (sidebarElement) {
        const isHidden =
          sidebarElement.style.display === "none" ||
          sidebarElement.classList.contains("hidden");

        if (isHidden) {
          sidebarElement.style.display = "";
          sidebarElement.classList.remove("hidden");
          console.log("사이드바가 열렸습니다");
        } else {
          sidebarElement.style.display = "none";
          sidebarElement.classList.add("hidden");
          console.log("사이드바가 닫혔습니다");
        }
      } else {
        console.log("사이드바 요소를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("사이드바 토글 실패:", error);
      throw error;
    }
  },
};

/**
 * 다음 포커스 가능한 요소로 이동하는 액션
 */
export const focusNextElementAction: ShortcutAction = {
  id: "focusNextElement",
  name: "다음 요소 포커스",
  description: "다음 포커스 가능한 요소로 이동합니다",
  handler: async (event: KeyboardEvent) => {
    try {
      const focusableElements = document.querySelectorAll<HTMLElement>(
        'input, button, textarea, select, [tabindex]:not([tabindex="-1"])'
      );

      const currentElement = document.activeElement as HTMLElement;
      const currentIndex =
        Array.from(focusableElements).indexOf(currentElement);

      if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
        console.log("다음 요소로 포커스가 이동되었습니다");
      } else if (focusableElements.length > 0) {
        // 마지막 요소에서 첫 번째 요소로 순환
        focusableElements[0].focus();
        console.log("첫 번째 요소로 포커스가 이동되었습니다");
      }
    } catch (error) {
      console.error("다음 요소 포커스 이동 실패:", error);
      throw error;
    }
  },
};

/**
 * 이전 포커스 가능한 요소로 이동하는 액션
 */
export const focusPreviousElementAction: ShortcutAction = {
  id: "focusPreviousElement",
  name: "이전 요소 포커스",
  description: "이전 포커스 가능한 요소로 이동합니다",
  handler: async (event: KeyboardEvent) => {
    try {
      const focusableElements = document.querySelectorAll<HTMLElement>(
        'input, button, textarea, select, [tabindex]:not([tabindex="-1"])'
      );

      const currentElement = document.activeElement as HTMLElement;
      const currentIndex =
        Array.from(focusableElements).indexOf(currentElement);

      if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus();
        console.log("이전 요소로 포커스가 이동되었습니다");
      } else if (focusableElements.length > 0) {
        // 첫 번째 요소에서 마지막 요소로 순환
        focusableElements[focusableElements.length - 1].focus();
        console.log("마지막 요소로 포커스가 이동되었습니다");
      }
    } catch (error) {
      console.error("이전 요소 포커스 이동 실패:", error);
      throw error;
    }
  },
};

/**
 * 모든 네비게이션 액션 목록
 */
export const navigationActions: ShortcutAction[] = [
  focusEditorAction,
  focusNoteListAction,
  toggleSidebarAction,
  focusNextElementAction,
  focusPreviousElementAction,
];
