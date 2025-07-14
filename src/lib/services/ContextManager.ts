import { ShortcutContext } from "../types/shortcut";
import type { Shortcut } from "../types/shortcut";

export type ContextChangeCallback = (
  newContext: ShortcutContext,
  oldContext: ShortcutContext
) => void;

export class ContextManager {
  private contextStack: ShortcutContext[] = [ShortcutContext.GLOBAL];
  private contextChangeCallbacks: ContextChangeCallback[] = [];

  /**
   * 현재 활성 컨텍스트를 반환합니다.
   */
  getCurrentContext(): ShortcutContext {
    return this.contextStack[this.contextStack.length - 1];
  }

  /**
   * 컨텍스트를 설정합니다. 기존 스택을 초기화하고 새로운 컨텍스트로 설정합니다.
   */
  setContext(context: ShortcutContext): void {
    const oldContext = this.getCurrentContext();
    this.contextStack = [ShortcutContext.GLOBAL];

    if (context !== ShortcutContext.GLOBAL) {
      this.contextStack.push(context);
    }

    this.emitContextChange(context, oldContext);
  }

  /**
   * 컨텍스트를 스택에 추가합니다.
   */
  pushContext(context: ShortcutContext): void {
    const oldContext = this.getCurrentContext();
    this.contextStack.push(context);
    this.emitContextChange(context, oldContext);
  }

  /**
   * 컨텍스트를 스택에서 제거합니다.
   * GLOBAL 컨텍스트는 제거할 수 없습니다.
   */
  popContext(): ShortcutContext | undefined {
    if (this.contextStack.length <= 1) {
      return undefined;
    }

    const oldContext = this.getCurrentContext();
    const popped = this.contextStack.pop();
    const newContext = this.getCurrentContext();

    this.emitContextChange(newContext, oldContext);
    return popped;
  }

  /**
   * 현재 컨텍스트에서 활성화된 단축키들을 반환합니다.
   * 현재 컨텍스트와 GLOBAL 컨텍스트의 단축키들을 포함합니다.
   */
  getActiveShortcuts(shortcuts: Shortcut[]): Shortcut[] {
    const currentContext = this.getCurrentContext();

    return shortcuts
      .filter(
        (shortcut) =>
          shortcut.enabled &&
          (shortcut.context === currentContext ||
            shortcut.context === ShortcutContext.GLOBAL)
      )
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * 특정 컨텍스트가 현재 활성화되어 있는지 확인합니다.
   */
  isContextActive(context: ShortcutContext): boolean {
    if (context === ShortcutContext.GLOBAL) {
      return true; // GLOBAL은 항상 활성화
    }
    return this.contextStack.includes(context);
  }

  /**
   * 현재 컨텍스트 스택을 반환합니다.
   */
  getContextStack(): ShortcutContext[] {
    return [...this.contextStack];
  }

  /**
   * 컨텍스트를 초기 상태로 리셋합니다.
   */
  reset(): void {
    const oldContext = this.getCurrentContext();
    this.contextStack = [ShortcutContext.GLOBAL];
    this.emitContextChange(ShortcutContext.GLOBAL, oldContext);
  }

  /**
   * 컨텍스트 변경 이벤트 리스너를 등록합니다.
   */
  onContextChange(callback: ContextChangeCallback): () => void {
    this.contextChangeCallbacks.push(callback);

    // 구독 해제 함수 반환
    return () => {
      const index = this.contextChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.contextChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 컨텍스트 변경 이벤트를 발생시킵니다.
   */
  private emitContextChange(
    newContext: ShortcutContext,
    oldContext: ShortcutContext
  ): void {
    if (newContext !== oldContext) {
      this.contextChangeCallbacks.forEach((callback) => {
        try {
          callback(newContext, oldContext);
        } catch (error) {
          console.error("Error in context change callback:", error);
        }
      });
    }
  }
}
