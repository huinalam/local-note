import type { Shortcut, ShortcutConfig, Conflict } from "../types/shortcut";

export class ShortcutConfigManager {
  private readonly STORAGE_KEY = "shortcut-config";

  /**
   * 단축키 설정을 localStorage에 저장합니다
   */
  saveConfig(config: ShortcutConfig): void {
    try {
      const serializedConfig = JSON.stringify(config);
      localStorage.setItem(this.STORAGE_KEY, serializedConfig);
      console.log("단축키 설정이 저장되었습니다");
    } catch (error) {
      console.error("단축키 설정 저장 실패:", error);
    }
  }

  /**
   * localStorage에서 단축키 설정을 로드합니다
   */
  loadConfig(): ShortcutConfig | null {
    try {
      const serializedConfig = localStorage.getItem(this.STORAGE_KEY);
      if (!serializedConfig) {
        return null;
      }

      const config = JSON.parse(serializedConfig);

      // 날짜 객체 복원
      if (config.lastModified) {
        config.lastModified = new Date(config.lastModified);
      }

      return this.validateConfig(config) ? config : null;
    } catch (error) {
      console.error("단축키 설정 로드 실패:", error);
      return null;
    }
  }

  /**
   * 기본 단축키와 사용자 설정을 병합합니다
   */
  mergeWithDefaults(
    defaultShortcuts: Shortcut[],
    userShortcuts: Shortcut[]
  ): Shortcut[] {
    const merged = new Map<string, Shortcut>();

    // 기본 단축키를 먼저 추가
    defaultShortcuts.forEach((shortcut) => {
      merged.set(shortcut.id, shortcut);
    });

    // 사용자 설정으로 덮어쓰기
    userShortcuts.forEach((shortcut) => {
      merged.set(shortcut.id, shortcut);
    });

    return Array.from(merged.values());
  }

  /**
   * 단축키 설정의 유효성을 검사합니다
   */
  validateConfig(config: any): config is ShortcutConfig {
    if (!config || typeof config !== "object") {
      return false;
    }

    // 필수 필드 확인
    if (!Array.isArray(config.shortcuts)) {
      return false;
    }

    if (typeof config.version !== "string") {
      return false;
    }

    // 단축키 배열 유효성 검사
    for (const shortcut of config.shortcuts) {
      if (!this.validateShortcut(shortcut)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 개별 단축키의 유효성을 검사합니다
   */
  private validateShortcut(shortcut: any): shortcut is Shortcut {
    if (!shortcut || typeof shortcut !== "object") {
      return false;
    }

    const requiredFields = [
      "id",
      "keys",
      "action",
      "context",
      "description",
      "category",
    ];

    for (const field of requiredFields) {
      if (typeof shortcut[field] !== "string" || !shortcut[field]) {
        return false;
      }
    }

    if (typeof shortcut.enabled !== "boolean") {
      return false;
    }

    if (typeof shortcut.priority !== "number") {
      return false;
    }

    return true;
  }

  /**
   * 단축키 충돌을 감지합니다
   */
  detectConflicts(shortcuts: Shortcut[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const keyMap = new Map<string, Shortcut[]>();

    // 활성화된 단축키만 검사
    const enabledShortcuts = shortcuts.filter((s) => s.enabled);

    // 컨텍스트별 키 조합 그룹화
    enabledShortcuts.forEach((shortcut) => {
      const key = `${shortcut.context}:${shortcut.keys}`;
      if (!keyMap.has(key)) {
        keyMap.set(key, []);
      }
      keyMap.get(key)!.push(shortcut);
    });

    // 충돌 검사
    keyMap.forEach((conflictingShortcuts, key) => {
      if (conflictingShortcuts.length > 1) {
        const [context, keyCombo] = key.split(":");
        conflicts.push({
          keyCombo,
          context: context as any,
          shortcuts: conflictingShortcuts,
          resolution: "priority" as any,
        });
      }
    });

    return conflicts;
  }

  /**
   * 설정을 기본값으로 재설정합니다
   */
  resetToDefaults(defaultShortcuts: Shortcut[]): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("단축키 설정이 기본값으로 재설정되었습니다");
    } catch (error) {
      console.error("단축키 설정 재설정 실패:", error);
    }
  }
}
