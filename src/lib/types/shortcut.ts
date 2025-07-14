// 단축키 시스템 타입 정의

// 컨텍스트 정의
export enum ShortcutContext {
  GLOBAL = "global",
  EDITOR = "editor",
  LIST = "list",
  MODAL = "modal",
}

// 기본 단축키 정의
export interface Shortcut {
  id: string;
  keys: string; // 'ctrl+s', 'alt+shift+n'
  action: string;
  context: ShortcutContext;
  description: string;
  category: string;
  enabled: boolean;
  priority: number;
}

// 액션 정의
export interface ShortcutAction {
  id: string;
  name: string;
  description: string;
  handler: (event: KeyboardEvent) => void | Promise<void>;
  canExecute?: () => boolean;
}

// 키 조합 정의
export interface KeyCombo {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

// 충돌 해결 전략
export enum ConflictResolution {
  PRIORITY = "priority",
  CONTEXT = "context",
  USER_CHOICE = "user",
  AUTO_REASSIGN = "auto",
}

// 충돌 정의
export interface Conflict {
  keyCombo: string;
  context: ShortcutContext;
  shortcuts: Shortcut[];
  resolution: ConflictResolution;
}

// 단축키 설정 정의
export interface ShortcutConfig {
  shortcuts: Shortcut[];
  version: string;
  lastModified: Date;
}

// 단축키 카테고리
export type ShortcutCategory =
  | "file"
  | "edit"
  | "tab"
  | "navigation"
  | "system";
