import { ShortcutContext } from "../types/shortcut";
import type { ContextManager } from "./ContextManager";

export class ContextIntegration {
  private contextManager: ContextManager;
  private focusEventListeners: (() => void)[] = [];

  constructor(contextManager: ContextManager) {
    this.contextManager = contextManager;
    this.setupFocusListeners();
  }

  /**
   * 포커스 이벤트 리스너를 설정합니다
   */
  private setupFocusListeners(): void {
    // 에디터 포커스 감지
    this.addFocusListener('[data-context="editor"]', () => {
      this.contextManager.setContext(ShortcutContext.EDITOR);
    });

    // 노트 목록 포커스 감지
    this.addFocusListener('[data-context="list"]', () => {
      this.contextManager.setContext(ShortcutContext.LIST);
    });

    // 모달 감지
    this.addModalListeners();

    // 전역 클릭 이벤트로 기본 컨텍스트 복원
    this.addGlobalClickListener();
  }

  /**
   * 특정 선택자에 포커스 이벤트 리스너를 추가합니다
   */
  private addFocusListener(selector: string, callback: () => void): void {
    const handleFocus = (event: Event) => {
      const target = event.target as Element;
      if (target.matches(selector) || target.closest(selector)) {
        callback();
      }
    };

    document.addEventListener("focusin", handleFocus);
    this.focusEventListeners.push(() => {
      document.removeEventListener("focusin", handleFocus);
    });
  }

  /**
   * 모달 이벤트 리스너를 추가합니다
   */
  private addModalListeners(): void {
    // 모달 열기 감지
    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // 모달 요소 감지
            if (
              node.matches('[data-context="modal"]') ||
              node.querySelector('[data-context="modal"]')
            ) {
              this.contextManager.pushContext(ShortcutContext.MODAL);
            }
          }
        });

        mutation.removedNodes.forEach((node) => {
          if (node instanceof Element) {
            // 모달 제거 감지
            if (
              node.matches('[data-context="modal"]') ||
              node.querySelector('[data-context="modal"]')
            ) {
              this.contextManager.popContext();
            }
          }
        });
      });
    });

    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.focusEventListeners.push(() => {
      modalObserver.disconnect();
    });
  }

  /**
   * 전역 클릭 이벤트 리스너를 추가합니다
   */
  private addGlobalClickListener(): void {
    const handleGlobalClick = (event: Event) => {
      const target = event.target as Element;

      // 특정 컨텍스트 요소가 아닌 곳을 클릭하면 GLOBAL로 복원
      if (!target.closest("[data-context]")) {
        this.contextManager.setContext(ShortcutContext.GLOBAL);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    this.focusEventListeners.push(() => {
      document.removeEventListener("click", handleGlobalClick);
    });
  }

  /**
   * 특정 요소에 컨텍스트를 설정합니다
   */
  setElementContext(element: HTMLElement, context: ShortcutContext): void {
    element.setAttribute("data-context", context);

    // 포커스 이벤트 핸들러 추가
    const handleFocus = () => {
      this.contextManager.setContext(context);
    };

    element.addEventListener("focus", handleFocus);
    element.addEventListener("focusin", handleFocus);
  }

  /**
   * 모달을 열고 컨텍스트를 MODAL로 설정합니다
   */
  openModal(modalElement: HTMLElement): void {
    modalElement.setAttribute("data-context", ShortcutContext.MODAL);
    this.contextManager.pushContext(ShortcutContext.MODAL);

    // 모달 내부의 첫 번째 포커스 가능한 요소에 포커스
    const focusableElement = modalElement.querySelector<HTMLElement>(
      'input, button, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElement) {
      focusableElement.focus();
    }
  }

  /**
   * 모달을 닫고 이전 컨텍스트로 복원합니다
   */
  closeModal(modalElement: HTMLElement): void {
    modalElement.removeAttribute("data-context");
    this.contextManager.popContext();
  }

  /**
   * 에디터에 포커스를 설정합니다
   */
  focusEditor(): void {
    const editorElement = document.querySelector<HTMLElement>(
      '[data-context="editor"]'
    );
    if (editorElement) {
      editorElement.focus();
      this.contextManager.setContext(ShortcutContext.EDITOR);
    }
  }

  /**
   * 노트 목록에 포커스를 설정합니다
   */
  focusList(): void {
    const listElement = document.querySelector<HTMLElement>(
      '[data-context="list"]'
    );
    if (listElement) {
      listElement.focus();
      this.contextManager.setContext(ShortcutContext.LIST);
    }
  }

  /**
   * 리소스를 정리합니다
   */
  destroy(): void {
    this.focusEventListeners.forEach((cleanup) => cleanup());
    this.focusEventListeners = [];
  }
}
