import type { ShortcutAction } from "../types/shortcut";

export class ActionRegistry {
  private actions: Map<string, ShortcutAction> = new Map();

  /**
   * 액션을 등록합니다
   */
  register(action: ShortcutAction, force: boolean = false): void {
    if (this.actions.has(action.id) && !force) {
      throw new Error(`Action with id "${action.id}" already exists`);
    }
    this.actions.set(action.id, action);
  }

  /**
   * 액션을 해제합니다
   */
  unregister(actionId: string): boolean {
    return this.actions.delete(actionId);
  }

  /**
   * ID로 액션을 조회합니다
   */
  get(actionId: string): ShortcutAction | undefined {
    return this.actions.get(actionId);
  }

  /**
   * 모든 액션을 반환합니다
   */
  getAll(): ShortcutAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * 액션을 실행합니다
   */
  async execute(actionId: string, event: KeyboardEvent): Promise<boolean> {
    const action = this.actions.get(actionId);
    if (!action) {
      return false;
    }

    // canExecute 체크
    if (action.canExecute && !action.canExecute()) {
      return false;
    }

    try {
      await action.handler(event);
      return true;
    } catch (error) {
      console.error(`Error executing action "${actionId}":`, error);
      return false;
    }
  }

  /**
   * 액션이 실행 가능한지 확인합니다
   */
  canExecute(actionId: string): boolean {
    const action = this.actions.get(actionId);
    if (!action) {
      return false;
    }

    return action.canExecute ? action.canExecute() : true;
  }

  /**
   * 모든 액션을 삭제합니다
   */
  clear(): void {
    this.actions.clear();
  }
}
