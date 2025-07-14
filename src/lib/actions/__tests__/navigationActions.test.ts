import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  focusEditorAction,
  focusNoteListAction,
  toggleSidebarAction,
  focusNextElementAction,
  focusPreviousElementAction,
  navigationActions,
} from "../navigationActions";

describe("Navigation Actions", () => {
  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = "";
    // console.log와 console.error 모킹
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("focusEditorAction", () => {
    it("should focus editor element when it exists", async () => {
      const editorElement = document.createElement("textarea");
      editorElement.setAttribute("data-context", "editor");
      document.body.appendChild(editorElement);

      const focusSpy = vi.spyOn(editorElement, "focus");
      const mockEvent = new KeyboardEvent("keydown");

      await focusEditorAction.handler(mockEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "에디터에 포커스가 설정되었습니다"
      );
    });

    it("should log message when editor element does not exist", async () => {
      const mockEvent = new KeyboardEvent("keydown");

      await focusEditorAction.handler(mockEvent);

      expect(console.log).toHaveBeenCalledWith(
        "에디터 요소를 찾을 수 없습니다"
      );
    });

    it("should handle errors gracefully", async () => {
      const editorElement = document.createElement("textarea");
      editorElement.setAttribute("data-context", "editor");
      document.body.appendChild(editorElement);

      // focus 메서드에서 에러 발생 시뮬레이션
      vi.spyOn(editorElement, "focus").mockImplementation(() => {
        throw new Error("Focus failed");
      });

      const mockEvent = new KeyboardEvent("keydown");

      await expect(focusEditorAction.handler(mockEvent)).rejects.toThrow(
        "Focus failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "에디터 포커스 설정 실패:",
        expect.any(Error)
      );
    });
  });

  describe("focusNoteListAction", () => {
    it("should focus list element when it exists", async () => {
      const listElement = document.createElement("div");
      listElement.setAttribute("data-context", "list");
      listElement.setAttribute("tabindex", "0");
      document.body.appendChild(listElement);

      const focusSpy = vi.spyOn(listElement, "focus");
      const mockEvent = new KeyboardEvent("keydown");

      await focusNoteListAction.handler(mockEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "노트 목록에 포커스가 설정되었습니다"
      );
    });

    it("should log message when list element does not exist", async () => {
      const mockEvent = new KeyboardEvent("keydown");

      await focusNoteListAction.handler(mockEvent);

      expect(console.log).toHaveBeenCalledWith("목록 요소를 찾을 수 없습니다");
    });

    it("should handle errors gracefully", async () => {
      const listElement = document.createElement("div");
      listElement.setAttribute("data-context", "list");
      document.body.appendChild(listElement);

      // focus 메서드에서 에러 발생 시뮬레이션
      vi.spyOn(listElement, "focus").mockImplementation(() => {
        throw new Error("Focus failed");
      });

      const mockEvent = new KeyboardEvent("keydown");

      await expect(focusNoteListAction.handler(mockEvent)).rejects.toThrow(
        "Focus failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "목록 포커스 설정 실패:",
        expect.any(Error)
      );
    });
  });

  describe("toggleSidebarAction", () => {
    it("should show hidden sidebar", async () => {
      const sidebarElement = document.createElement("div");
      sidebarElement.setAttribute("data-sidebar", "true");
      sidebarElement.style.display = "none";
      document.body.appendChild(sidebarElement);

      const mockEvent = new KeyboardEvent("keydown");

      await toggleSidebarAction.handler(mockEvent);

      expect(sidebarElement.style.display).toBe("");
      expect(sidebarElement.classList.contains("hidden")).toBe(false);
      expect(console.log).toHaveBeenCalledWith("사이드바가 열렸습니다");
    });

    it("should hide visible sidebar", async () => {
      const sidebarElement = document.createElement("div");
      sidebarElement.setAttribute("data-sidebar", "true");
      document.body.appendChild(sidebarElement);

      const mockEvent = new KeyboardEvent("keydown");

      await toggleSidebarAction.handler(mockEvent);

      expect(sidebarElement.style.display).toBe("none");
      expect(sidebarElement.classList.contains("hidden")).toBe(true);
      expect(console.log).toHaveBeenCalledWith("사이드바가 닫혔습니다");
    });

    it("should show sidebar with hidden class", async () => {
      const sidebarElement = document.createElement("div");
      sidebarElement.setAttribute("data-sidebar", "true");
      sidebarElement.classList.add("hidden");
      document.body.appendChild(sidebarElement);

      const mockEvent = new KeyboardEvent("keydown");

      await toggleSidebarAction.handler(mockEvent);

      expect(sidebarElement.style.display).toBe("");
      expect(sidebarElement.classList.contains("hidden")).toBe(false);
      expect(console.log).toHaveBeenCalledWith("사이드바가 열렸습니다");
    });

    it("should log message when sidebar element does not exist", async () => {
      const mockEvent = new KeyboardEvent("keydown");

      await toggleSidebarAction.handler(mockEvent);

      expect(console.log).toHaveBeenCalledWith(
        "사이드바 요소를 찾을 수 없습니다"
      );
    });

    it("should handle errors gracefully", async () => {
      const sidebarElement = document.createElement("div");
      sidebarElement.setAttribute("data-sidebar", "true");
      document.body.appendChild(sidebarElement);

      // style 속성 접근에서 에러 발생 시뮬레이션
      Object.defineProperty(sidebarElement, "style", {
        get: () => {
          throw new Error("Style access failed");
        },
      });

      const mockEvent = new KeyboardEvent("keydown");

      await expect(toggleSidebarAction.handler(mockEvent)).rejects.toThrow(
        "Style access failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "사이드바 토글 실패:",
        expect.any(Error)
      );
    });
  });

  describe("focusNextElementAction", () => {
    it("should focus next focusable element", async () => {
      const input1 = document.createElement("input");
      const input2 = document.createElement("input");
      const button = document.createElement("button");

      document.body.appendChild(input1);
      document.body.appendChild(input2);
      document.body.appendChild(button);

      // 첫 번째 input에 포커스 설정
      input1.focus();

      const focusSpy = vi.spyOn(input2, "focus");
      const mockEvent = new KeyboardEvent("keydown");

      await focusNextElementAction.handler(mockEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "다음 요소로 포커스가 이동되었습니다"
      );
    });

    it("should wrap to first element when at last element", async () => {
      const input1 = document.createElement("input");
      const input2 = document.createElement("input");

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      // 마지막 input에 포커스 설정
      input2.focus();

      const focusSpy = vi.spyOn(input1, "focus");
      const mockEvent = new KeyboardEvent("keydown");

      await focusNextElementAction.handler(mockEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "첫 번째 요소로 포커스가 이동되었습니다"
      );
    });

    it("should handle no focusable elements gracefully", async () => {
      const mockEvent = new KeyboardEvent("keydown");

      await expect(
        focusNextElementAction.handler(mockEvent)
      ).resolves.not.toThrow();
    });

    it("should handle errors gracefully", async () => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      // querySelectorAll에서 에러 발생 시뮬레이션
      vi.spyOn(document, "querySelectorAll").mockImplementation(() => {
        throw new Error("Query failed");
      });

      const mockEvent = new KeyboardEvent("keydown");

      await expect(focusNextElementAction.handler(mockEvent)).rejects.toThrow(
        "Query failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "다음 요소 포커스 이동 실패:",
        expect.any(Error)
      );
    });
  });

  describe("focusPreviousElementAction", () => {
    it("should focus previous focusable element", async () => {
      const input1 = document.createElement("input");
      const input2 = document.createElement("input");
      const button = document.createElement("button");

      document.body.appendChild(input1);
      document.body.appendChild(input2);
      document.body.appendChild(button);

      // 두 번째 input에 포커스 설정
      input2.focus();

      const focusSpy = vi.spyOn(input1, "focus");
      const mockEvent = new KeyboardEvent("keydown");

      await focusPreviousElementAction.handler(mockEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "이전 요소로 포커스가 이동되었습니다"
      );
    });

    it("should wrap to last element when at first element", async () => {
      const input1 = document.createElement("input");
      const input2 = document.createElement("input");

      document.body.appendChild(input1);
      document.body.appendChild(input2);

      // 첫 번째 input에 포커스 설정
      input1.focus();

      const focusSpy = vi.spyOn(input2, "focus");
      const mockEvent = new KeyboardEvent("keydown");

      await focusPreviousElementAction.handler(mockEvent);

      expect(focusSpy).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "마지막 요소로 포커스가 이동되었습니다"
      );
    });

    it("should handle no focusable elements gracefully", async () => {
      const mockEvent = new KeyboardEvent("keydown");

      await expect(
        focusPreviousElementAction.handler(mockEvent)
      ).resolves.not.toThrow();
    });

    it("should handle errors gracefully", async () => {
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      // querySelectorAll에서 에러 발생 시뮬레이션
      vi.spyOn(document, "querySelectorAll").mockImplementation(() => {
        throw new Error("Query failed");
      });

      const mockEvent = new KeyboardEvent("keydown");

      await expect(
        focusPreviousElementAction.handler(mockEvent)
      ).rejects.toThrow("Query failed");
      expect(console.error).toHaveBeenCalledWith(
        "이전 요소 포커스 이동 실패:",
        expect.any(Error)
      );
    });
  });

  describe("navigationActions array", () => {
    it("should contain all navigation actions", () => {
      expect(navigationActions).toHaveLength(5);
      expect(navigationActions).toContain(focusEditorAction);
      expect(navigationActions).toContain(focusNoteListAction);
      expect(navigationActions).toContain(toggleSidebarAction);
      expect(navigationActions).toContain(focusNextElementAction);
      expect(navigationActions).toContain(focusPreviousElementAction);
    });

    it("should have unique action IDs", () => {
      const ids = navigationActions.map((action) => action.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid action structure", () => {
      navigationActions.forEach((action) => {
        expect(action).toHaveProperty("id");
        expect(action).toHaveProperty("name");
        expect(action).toHaveProperty("description");
        expect(action).toHaveProperty("handler");
        expect(typeof action.id).toBe("string");
        expect(typeof action.name).toBe("string");
        expect(typeof action.description).toBe("string");
        expect(typeof action.handler).toBe("function");
      });
    });
  });
});
