import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ContextIntegration } from "../ContextIntegration";
import { ContextManager } from "../ContextManager";
import { ShortcutContext } from "../../types/shortcut";

// DOM 환경 설정
Object.defineProperty(window, "MutationObserver", {
  writable: true,
  value: vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  })),
});

describe("ContextIntegration", () => {
  let contextManager: ContextManager;
  let contextIntegration: ContextIntegration;
  let mockElement: HTMLElement;

  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = "";

    contextManager = new ContextManager();
    contextIntegration = new ContextIntegration(contextManager);

    // 테스트용 요소 생성
    mockElement = document.createElement("div");
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    contextIntegration.destroy();
    document.body.innerHTML = "";
  });

  describe("element context management", () => {
    it("should set element context attribute", () => {
      contextIntegration.setElementContext(mockElement, ShortcutContext.EDITOR);

      expect(mockElement.getAttribute("data-context")).toBe(
        ShortcutContext.EDITOR
      );
    });

    it("should change context when element receives focus", () => {
      contextIntegration.setElementContext(mockElement, ShortcutContext.EDITOR);

      // 포커스 이벤트 시뮬레이션
      const focusEvent = new Event("focus", { bubbles: true });
      mockElement.dispatchEvent(focusEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should change context when element receives focusin", () => {
      contextIntegration.setElementContext(mockElement, ShortcutContext.LIST);

      // focusin 이벤트 시뮬레이션
      const focusinEvent = new Event("focusin", { bubbles: true });
      mockElement.dispatchEvent(focusinEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.LIST);
    });
  });

  describe("modal management", () => {
    it("should open modal and set MODAL context", () => {
      const modalElement = document.createElement("div");
      const focusableInput = document.createElement("input");
      modalElement.appendChild(focusableInput);
      document.body.appendChild(modalElement);

      contextIntegration.openModal(modalElement);

      expect(modalElement.getAttribute("data-context")).toBe(
        ShortcutContext.MODAL
      );
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.MODAL);
    });

    it("should close modal and restore previous context", () => {
      const modalElement = document.createElement("div");
      document.body.appendChild(modalElement);

      // 먼저 EDITOR 컨텍스트 설정
      contextManager.setContext(ShortcutContext.EDITOR);

      // 모달 열기
      contextIntegration.openModal(modalElement);
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.MODAL);

      // 모달 닫기
      contextIntegration.closeModal(modalElement);
      expect(modalElement.getAttribute("data-context")).toBeNull();
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should focus first focusable element in modal", () => {
      const modalElement = document.createElement("div");
      const button = document.createElement("button");
      const input = document.createElement("input");

      modalElement.appendChild(button);
      modalElement.appendChild(input);
      document.body.appendChild(modalElement);

      const focusSpy = vi.spyOn(button, "focus");

      contextIntegration.openModal(modalElement);

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("focus management", () => {
    it("should focus editor element", () => {
      const editorElement = document.createElement("textarea");
      editorElement.setAttribute("data-context", "editor");
      document.body.appendChild(editorElement);

      const focusSpy = vi.spyOn(editorElement, "focus");

      contextIntegration.focusEditor();

      expect(focusSpy).toHaveBeenCalled();
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should focus list element", () => {
      const listElement = document.createElement("div");
      listElement.setAttribute("data-context", "list");
      listElement.setAttribute("tabindex", "0");
      document.body.appendChild(listElement);

      const focusSpy = vi.spyOn(listElement, "focus");

      contextIntegration.focusList();

      expect(focusSpy).toHaveBeenCalled();
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.LIST);
    });

    it("should handle missing editor element gracefully", () => {
      // 에디터 요소가 없는 상태에서 focusEditor 호출
      expect(() => {
        contextIntegration.focusEditor();
      }).not.toThrow();

      // 컨텍스트는 변경되지 않아야 함
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });

    it("should handle missing list element gracefully", () => {
      // 목록 요소가 없는 상태에서 focusList 호출
      expect(() => {
        contextIntegration.focusList();
      }).not.toThrow();

      // 컨텍스트는 변경되지 않아야 함
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });
  });

  describe("global click handling", () => {
    it("should reset to GLOBAL context when clicking outside context elements", () => {
      // 먼저 EDITOR 컨텍스트로 설정
      contextManager.setContext(ShortcutContext.EDITOR);

      // 컨텍스트가 없는 요소 클릭 시뮬레이션
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      const clickEvent = new Event("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", {
        value: outsideElement,
        enumerable: true,
      });

      document.dispatchEvent(clickEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });

    it("should not change context when clicking inside context elements", () => {
      // EDITOR 컨텍스트 설정
      contextManager.setContext(ShortcutContext.EDITOR);

      // 컨텍스트가 있는 요소 클릭 시뮬레이션
      const contextElement = document.createElement("div");
      contextElement.setAttribute("data-context", "editor");
      document.body.appendChild(contextElement);

      const clickEvent = new Event("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", {
        value: contextElement,
        enumerable: true,
      });

      document.dispatchEvent(clickEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });
  });

  describe("focus event handling", () => {
    it("should change context when focusing editor element", () => {
      const editorElement = document.createElement("textarea");
      editorElement.setAttribute("data-context", "editor");
      document.body.appendChild(editorElement);

      const focusinEvent = new Event("focusin", { bubbles: true });
      Object.defineProperty(focusinEvent, "target", {
        value: editorElement,
        enumerable: true,
      });

      document.dispatchEvent(focusinEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should change context when focusing list element", () => {
      const listElement = document.createElement("div");
      listElement.setAttribute("data-context", "list");
      document.body.appendChild(listElement);

      const focusinEvent = new Event("focusin", { bubbles: true });
      Object.defineProperty(focusinEvent, "target", {
        value: listElement,
        enumerable: true,
      });

      document.dispatchEvent(focusinEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.LIST);
    });

    it("should handle focus on child elements", () => {
      const containerElement = document.createElement("div");
      containerElement.setAttribute("data-context", "editor");

      const childElement = document.createElement("input");
      containerElement.appendChild(childElement);
      document.body.appendChild(containerElement);

      const focusinEvent = new Event("focusin", { bubbles: true });
      Object.defineProperty(focusinEvent, "target", {
        value: childElement,
        enumerable: true,
      });

      document.dispatchEvent(focusinEvent);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });
  });

  describe("cleanup", () => {
    it("should remove event listeners on destroy", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      contextIntegration.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "focusin",
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
    });

    it("should disconnect mutation observer on destroy", () => {
      const mockDisconnect = vi.fn();
      const MockMutationObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: mockDisconnect,
        takeRecords: vi.fn(),
      }));

      // MutationObserver 모킹
      const originalMutationObserver = window.MutationObserver;
      window.MutationObserver = MockMutationObserver;

      // 새로운 인스턴스 생성
      const newContextIntegration = new ContextIntegration(contextManager);
      newContextIntegration.destroy();

      expect(mockDisconnect).toHaveBeenCalled();

      // 원래 MutationObserver 복원
      window.MutationObserver = originalMutationObserver;
    });
  });
});
