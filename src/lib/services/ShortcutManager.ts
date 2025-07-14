import { ShortcutRegistry } from "./ShortcutRegistry";
import { ActionRegistry } from "./ActionRegistry";
import { KeyboardEventHandler } from "./KeyboardEventHandler";
import { ContextManager } from "./ContextManager";
import {
  ShortcutContext,
  type Shortcut,
  type ShortcutAction,
} from "../types/shortcut";

export class ShortcutManager {
  private shortcutRegistry: ShortcutRegistry;
  private actionRegistry: ActionRegistry;
  private keyboardHandler: KeyboardEventHandler;
  private contextManager: ContextManager;
  private boundKeyHandler: (event: KeyboardEvent) => void;

  constructor() {
    this.shortcutRegistry = new ShortcutRegistry();
    this.actionRegistry = new ActionRegistry();
    this.keyboardHandler = new KeyboardEventHandler();
    this.contextManager = new ContextManager();

    // 키보드 이벤트 핸들러 바인딩
    this.boundKeyHandler = this.handleKeyEvent.bind(this);
    document.addEventListener("keydown", this.boundKeyHandler);
  }

  /**
   * 단축키를 등록합니다
   */
  registerShortcut(shortcut: Shortcut): void {
    this.shortcutRegistry.register(shortcut);
  }

  /**
   * 액션을 등록합니다
   */
  registerAction(action: ShortcutAction): void {
    this.actionRegistry.register(action);
  }

  /**
   * 단축키를 조회합니다
   */
  getShortcut(shortcutId: string): Shortcut | undefined {
    return this.shortcutRegistry.get(shortcutId);
  }

  /**
   * 액션을 조회합니다
   */
  getAction(actionId: string): ShortcutAction | undefined {
    return this.actionRegistry.get(actionId);
  }

  /**
   * 단축키를 해제합니다
   */
  unregisterShortcut(shortcutId: string): boolean {
    return this.shortcutRegistry.unregister(shortcutId);
  }

  /**
   * 액션을 해제합니다
   */
  unregisterAction(actionId: string): boolean {
    return this.actionRegistry.unregister(actionId);
  }

  /**
   * 키보드 이벤트를 처리합니다
   */
  async handleKeyEvent(event: KeyboardEvent): Promise<boolean> {
    const keyString = this.keyboardHandler.eventToKeyString(event);
    const activeShortcuts = this.getActiveShortcuts();

    // 키 조합에 맞는 단축키 찾기
    const matchingShortcut = activeShortcuts.find(
      (shortcut) => shortcut.keys === keyString && shortcut.enabled
    );

    if (!matchingShortcut) {
      return false;
    }

    // 액션 실행
    const executed = await this.actionRegistry.execute(
      matchingShortcut.action,
      event
    );

    if (executed) {
      event.preventDefault();
      event.stopPropagation();
    }

    return executed;
  }

  /**
   * 현재 컨텍스트를 설정합니다
   */
  setContext(context: ShortcutContext): void {
    this.contextManager.setContext(context);
  }

  /**
   * 컨텍스트를 스택에 푸시합니다
   */
  pushContext(context: ShortcutContext): void {
    this.contextManager.pushContext(context);
  }

  /**
   * 컨텍스트를 스택에서 팝합니다
   */
  popContext(): ShortcutContext | undefined {
    return this.contextManager.popContext();
  }

  /**
   * 현재 컨텍스트를 반환합니다
   */
  getCurrentContext(): ShortcutContext {
    return this.contextManager.getCurrentContext();
  }

  /**
   * 컨텍스트 변경 이벤트 리스너를 등록합니다
   */
  onContextChange(
    callback: (newContext: ShortcutContext, oldContext: ShortcutContext) => void
  ): () => void {
    return this.contextManager.onContextChange(callback);
  }

  /**
   * 현재 컨텍스트에서 활성화된 단축키들을 반환합니다
   */
  getActiveShortcuts(): Shortcut[] {
    const allShortcuts = this.shortcutRegistry.getAll();
    return this.contextManager.getActiveShortcuts(allShortcuts);
  }

  /**
   * 리소스를 정리합니다
   */
  destroy(): void {
    document.removeEventListener("keydown", this.boundKeyHandler);
    this.shortcutRegistry.clear();
    this.actionRegistry.clear();
  }
}
