import type { ShortcutManager } from "./ShortcutManager";
import { createFileActions } from "../actions/fileActions";
import { createTabActions } from "../actions/tabActions";
import { ShortcutContext, type Shortcut } from "../types/shortcut";
import type { NoteService } from "./noteService";
import type { AutoSaveService } from "./autoSaveService";

export class DefaultShortcuts {
  private shortcutManager: ShortcutManager;
  private defaultShortcuts: Shortcut[] = [];

  constructor(shortcutManager: ShortcutManager) {
    this.shortcutManager = shortcutManager;
    this.initializeDefaultShortcuts();
  }

  /**
   * 기본 단축키 설정을 초기화합니다
   */
  private initializeDefaultShortcuts(): void {
    this.defaultShortcuts = [
      // 파일 관리 단축키
      {
        id: "default.file.new",
        keys: "ctrl+n",
        action: "file.new",
        context: ShortcutContext.GLOBAL,
        description: "새로운 메모를 생성합니다",
        category: "file",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.file.save",
        keys: "ctrl+s",
        action: "file.save",
        context: ShortcutContext.GLOBAL,
        description: "현재 메모를 저장합니다",
        category: "file",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.file.saveAll",
        keys: "ctrl+shift+s",
        action: "file.saveAll",
        context: ShortcutContext.GLOBAL,
        description: "모든 메모를 저장합니다",
        category: "file",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.file.openList",
        keys: "ctrl+o",
        action: "file.openList",
        context: ShortcutContext.GLOBAL,
        description: "메모 목록을 엽니다",
        category: "file",
        enabled: true,
        priority: 10,
      },
      // 탭 관리 단축키
      {
        id: "default.tab.new",
        keys: "ctrl+t",
        action: "tab.new",
        context: ShortcutContext.GLOBAL,
        description: "새로운 탭을 생성합니다",
        category: "tab",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.tab.close",
        keys: "ctrl+w",
        action: "tab.close",
        context: ShortcutContext.GLOBAL,
        description: "현재 탭을 닫습니다",
        category: "tab",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.tab.next",
        keys: "ctrl+tab",
        action: "tab.next",
        context: ShortcutContext.GLOBAL,
        description: "다음 탭으로 이동합니다",
        category: "tab",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.tab.prev",
        keys: "ctrl+shift+tab",
        action: "tab.prev",
        context: ShortcutContext.GLOBAL,
        description: "이전 탭으로 이동합니다",
        category: "tab",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.tab.search",
        keys: "ctrl+p",
        action: "tab.search",
        context: ShortcutContext.GLOBAL,
        description: "탭을 검색합니다",
        category: "tab",
        enabled: true,
        priority: 10,
      },
    ];
  }

  /**
   * 모든 기본 단축키와 액션을 등록합니다
   */
  registerAll(
    noteService?: NoteService,
    autoSaveService?: AutoSaveService
  ): void {
    try {
      // 액션 등록 (서비스가 제공된 경우에만)
      if (noteService && autoSaveService) {
        const fileActions = createFileActions(noteService, autoSaveService);
        const tabActions = createTabActions();

        // 파일 액션 등록
        this.shortcutManager.registerAction(fileActions.createNewNote);
        this.shortcutManager.registerAction(fileActions.saveNote);
        this.shortcutManager.registerAction(fileActions.saveAllNotes);
        this.shortcutManager.registerAction(fileActions.openNoteList);

        // 탭 액션 등록
        this.shortcutManager.registerAction(tabActions.createNewTab);
        this.shortcutManager.registerAction(tabActions.closeCurrentTab);
        this.shortcutManager.registerAction(tabActions.nextTab);
        this.shortcutManager.registerAction(tabActions.previousTab);
        this.shortcutManager.registerAction(tabActions.searchTabs);
      }

      // 단축키 등록
      this.defaultShortcuts.forEach((shortcut) => {
        this.shortcutManager.registerShortcut(shortcut);
      });

      console.log("기본 단축키가 등록되었습니다");
    } catch (error) {
      console.error("기본 단축키 등록 실패:", error);
    }
  }

  /**
   * 모든 기본 단축키와 액션을 해제합니다
   */
  unregisterAll(): void {
    try {
      // 액션 해제
      const actionIds = [
        "file.new",
        "file.save",
        "file.saveAll",
        "file.openList",
        "tab.new",
        "tab.close",
        "tab.next",
        "tab.prev",
        "tab.search",
      ];

      actionIds.forEach((actionId) => {
        this.shortcutManager.unregisterAction(actionId);
      });

      // 단축키 해제
      this.defaultShortcuts.forEach((shortcut) => {
        this.shortcutManager.unregisterShortcut(shortcut.id);
      });

      console.log("기본 단축키가 해제되었습니다");
    } catch (error) {
      console.error("기본 단축키 해제 실패:", error);
    }
  }

  /**
   * 모든 기본 단축키 설정을 반환합니다
   */
  getDefaultShortcuts(): Shortcut[] {
    return [...this.defaultShortcuts];
  }

  /**
   * 카테고리별 단축키를 반환합니다
   */
  getShortcutsByCategory(category: string): Shortcut[] {
    return this.defaultShortcuts.filter(
      (shortcut) => shortcut.category === category
    );
  }

  /**
   * 컨텍스트별 단축키를 반환합니다
   */
  getShortcutsByContext(context: ShortcutContext): Shortcut[] {
    return this.defaultShortcuts.filter(
      (shortcut) => shortcut.context === context
    );
  }
}
