import type { Shortcut, ShortcutContext } from "../types/shortcut";

export class ShortcutRegistry {
  private shortcuts: Map<string, Shortcut> = new Map();

  /**
   * 단축키를 등록합니다
   */
  register(shortcut: Shortcut, force: boolean = false): void {
    if (this.shortcuts.has(shortcut.id) && !force) {
      throw new Error(`Shortcut with id "${shortcut.id}" already exists`);
    }
    this.shortcuts.set(shortcut.id, shortcut);
  }

  /**
   * 단축키를 해제합니다
   */
  unregister(shortcutId: string): boolean {
    return this.shortcuts.delete(shortcutId);
  }

  /**
   * ID로 단축키를 조회합니다
   */
  get(shortcutId: string): Shortcut | undefined {
    return this.shortcuts.get(shortcutId);
  }

  /**
   * 모든 단축키를 반환합니다
   */
  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * 키 조합으로 단축키를 찾습니다
   */
  getByKeys(keys: string): Shortcut | undefined {
    return this.getAll().find((shortcut) => shortcut.keys === keys);
  }

  /**
   * 컨텍스트별로 단축키를 필터링합니다
   */
  getByContext(context: ShortcutContext): Shortcut[] {
    return this.getAll().filter((shortcut) => shortcut.context === context);
  }

  /**
   * 모든 단축키를 삭제합니다
   */
  clear(): void {
    this.shortcuts.clear();
  }
}
