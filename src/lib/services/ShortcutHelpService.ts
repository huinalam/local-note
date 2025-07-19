import type { ShortcutManager } from "./ShortcutManager";
import {
  HelpShortcutCategory,
  type Shortcut,
  type EditorShortcut,
  type ShortcutHelpData,
  type FormattedKeyCombo,
  type PlatformKeyMap,
} from "../types/shortcut";

export class ShortcutHelpService {
  private shortcutManager: ShortcutManager;
  private platform: "mac" | "windows" | "linux";

  // 플랫폼별 키 매핑
  private readonly platformKeyMaps: Record<string, PlatformKeyMap> = {
    mac: {
      cmd: "⌘",
      ctrl: "⌃",
      alt: "⌥",
      shift: "⇧",
      meta: "⌘",
    },
    windows: {
      cmd: "Ctrl",
      ctrl: "Ctrl",
      alt: "Alt",
      shift: "Shift",
      meta: "Win",
    },
    linux: {
      cmd: "Ctrl",
      ctrl: "Ctrl",
      alt: "Alt",
      shift: "Shift",
      meta: "Super",
    },
  };

  // EasyMDE 액션 설명 매핑
  private readonly easyMDEActionDescriptions: Record<string, string> = {
    toggleBold: "텍스트를 굵게 만듭니다",
    toggleItalic: "텍스트를 기울임체로 만듭니다",
    toggleStrikethrough: "텍스트에 취소선을 적용합니다",
    toggleBlockquote: "인용문 블록을 만듭니다",
    toggleCodeBlock: "코드 블록을 만듭니다",
    toggleHeadingSmaller: "헤딩 레벨을 조정합니다",
    toggleUnorderedList: "순서 없는 목록을 만듭니다",
    toggleOrderedList: "순서 있는 목록을 만듭니다",
    drawLink: "링크를 삽입합니다",
    drawImage: "이미지를 삽입합니다",
    drawTable: "표를 삽입합니다",
    drawHorizontalRule: "구분선을 삽입합니다",
    togglePreview: "미리보기를 토글합니다",
    toggleSideBySide: "좌우 분할 뷰를 토글합니다",
    toggleFullScreen: "전체화면 모드를 토글합니다",
  };

  // 카테고리 매핑
  private readonly categoryMap: Record<string, HelpShortcutCategory> = {
    file: HelpShortcutCategory.FILE,
    search: HelpShortcutCategory.SEARCH,
    note: HelpShortcutCategory.NAVIGATION,
    navigation: HelpShortcutCategory.NAVIGATION,
    delete: HelpShortcutCategory.DELETE,
    help: HelpShortcutCategory.HELP,
    view: HelpShortcutCategory.VIEW,
    editing: HelpShortcutCategory.EDITING,
    editor: HelpShortcutCategory.EDITOR,
  };

  // 카테고리 정렬 순서
  private readonly categoryOrder: HelpShortcutCategory[] = [
    HelpShortcutCategory.FILE,
    HelpShortcutCategory.NAVIGATION,
    HelpShortcutCategory.SEARCH,
    HelpShortcutCategory.EDITING,
    HelpShortcutCategory.EDITOR,
    HelpShortcutCategory.DELETE,
    HelpShortcutCategory.VIEW,
    HelpShortcutCategory.HELP,
  ];

  constructor(shortcutManager: ShortcutManager) {
    this.shortcutManager = shortcutManager;
    this.platform = this.detectPlatform();
  }

  /**
   * 플랫폼을 감지합니다
   */
  detectPlatform(): "mac" | "windows" | "linux" {
    if (typeof navigator === "undefined") {
      return "linux"; // 서버 사이드에서는 기본값
    }

    const platform = navigator.platform.toLowerCase();
    if (platform.includes("mac")) {
      return "mac";
    } else if (platform.includes("win")) {
      return "windows";
    } else {
      return "linux";
    }
  }

  /**
   * 카테고리별로 단축키를 그룹화합니다
   */
  getShortcutsByCategory(
    editorShortcuts?: EditorShortcut[]
  ): ShortcutHelpData[] {
    // 애플리케이션 단축키 가져오기
    const appShortcuts = this.shortcutManager.getAllShortcuts();

    // 카테고리별로 그룹화
    const grouped = new Map<
      HelpShortcutCategory,
      (Shortcut | EditorShortcut)[]
    >();

    // 애플리케이션 단축키 그룹화
    appShortcuts.forEach((shortcut) => {
      const category = this.mapCategoryFromString(shortcut.category);
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(shortcut);
    });

    // 에디터 단축키 그룹화
    if (editorShortcuts) {
      editorShortcuts.forEach((shortcut) => {
        if (!grouped.has(shortcut.category)) {
          grouped.set(shortcut.category, []);
        }
        grouped.get(shortcut.category)!.push(shortcut);
      });
    }

    // 정렬된 결과 반환
    return this.categoryOrder
      .filter((category) => grouped.has(category))
      .map((category) => ({
        category,
        shortcuts: grouped.get(category)!,
      }));
  }

  /**
   * 키 조합을 플랫폼에 맞게 포맷팅합니다
   */
  formatKeyCombo(
    keys: string,
    platform?: "mac" | "windows" | "linux"
  ): FormattedKeyCombo {
    const targetPlatform = platform || this.platform;
    const keyMap = this.platformKeyMaps[targetPlatform];

    // EasyMDE 형식을 표준 형식으로 변환 (Cmd-B -> cmd+b)
    const normalizedKeys = keys
      .toLowerCase()
      .replace(/-/g, "+")
      .replace(/cmd/g, targetPlatform === "mac" ? "cmd" : "ctrl");

    const keyParts = normalizedKeys.split("+").map((key) => key.trim());
    const formattedKeys: string[] = [];
    const displayKeys: string[] = [];

    keyParts.forEach((key) => {
      formattedKeys.push(key);

      if (keyMap[key]) {
        displayKeys.push(keyMap[key]);
      } else {
        // 일반 키는 대문자로 표시
        displayKeys.push(key.toUpperCase());
      }
    });

    const separator = targetPlatform === "mac" ? "" : "+";
    const display = displayKeys.join(separator);

    return {
      keys: formattedKeys,
      display,
      platform: targetPlatform,
    };
  }

  /**
   * EasyMDE 단축키 설정을 EditorShortcut 배열로 변환합니다
   */
  convertEasyMDEShortcuts(
    easyMDEConfig: Record<string, string>
  ): EditorShortcut[] {
    return Object.entries(easyMDEConfig).map(([action, keys]) => ({
      id: `editor.${action}`,
      keys,
      action,
      description:
        this.easyMDEActionDescriptions[action] || `${action} 기능을 실행합니다`,
      category: HelpShortcutCategory.EDITOR,
    }));
  }

  /**
   * 문자열 카테고리를 HelpShortcutCategory로 매핑합니다
   */
  mapCategoryFromString(categoryString: string): HelpShortcutCategory {
    return this.categoryMap[categoryString] || HelpShortcutCategory.EDITING;
  }

  /**
   * ShortcutManager에서 모든 단축키를 조회합니다
   */
  getAllShortcuts(): Shortcut[] {
    return this.shortcutManager.getAllShortcuts();
  }

  /**
   * 현재 플랫폼을 반환합니다
   */
  getCurrentPlatform(): "mac" | "windows" | "linux" {
    return this.platform;
  }
}
