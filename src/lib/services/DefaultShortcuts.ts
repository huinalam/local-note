import { ShortcutManager } from "./ShortcutManager";
import { ShortcutContext, type Shortcut } from "../types/shortcut";
import { createFileActions } from "../actions/fileActions";
import { createNoteNavigationActions } from "../actions/noteNavigationActions";
import { createDeleteActions } from "../actions/deleteActions";
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

      // 검색 단축키
      {
        id: "default.search.openModal",
        keys: "ctrl+e",
        action: "search.openModal",
        context: ShortcutContext.GLOBAL,
        description: "메모 검색 모달을 엽니다",
        category: "search",
        enabled: true,
        priority: 10,
      },

      // 메모 네비게이션 단축키
      {
        id: "default.note.goTo1",
        keys: "ctrl+1",
        action: "note.goTo1",
        context: ShortcutContext.GLOBAL,
        description: "1번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo2",
        keys: "ctrl+2",
        action: "note.goTo2",
        context: ShortcutContext.GLOBAL,
        description: "2번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo3",
        keys: "ctrl+3",
        action: "note.goTo3",
        context: ShortcutContext.GLOBAL,
        description: "3번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo4",
        keys: "ctrl+4",
        action: "note.goTo4",
        context: ShortcutContext.GLOBAL,
        description: "4번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo5",
        keys: "ctrl+5",
        action: "note.goTo5",
        context: ShortcutContext.GLOBAL,
        description: "5번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo6",
        keys: "ctrl+6",
        action: "note.goTo6",
        context: ShortcutContext.GLOBAL,
        description: "6번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo7",
        keys: "ctrl+7",
        action: "note.goTo7",
        context: ShortcutContext.GLOBAL,
        description: "7번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo8",
        keys: "ctrl+8",
        action: "note.goTo8",
        context: ShortcutContext.GLOBAL,
        description: "8번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo9",
        keys: "ctrl+9",
        action: "note.goTo9",
        context: ShortcutContext.GLOBAL,
        description: "9번째 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.note.goTo0",
        keys: "ctrl+0",
        action: "note.goTo0",
        context: ShortcutContext.GLOBAL,
        description: "마지막 메모로 이동합니다",
        category: "note",
        enabled: true,
        priority: 10,
      },

      // 삭제 관리 단축키
      {
        id: "default.delete.current",
        keys: "ctrl+d",
        action: "note.delete",
        context: ShortcutContext.GLOBAL,
        description: "현재 노트를 삭제합니다",
        category: "delete",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.delete.selected",
        keys: "delete",
        action: "note.deleteSelected",
        context: ShortcutContext.LIST,
        description: "선택된 노트를 삭제합니다",
        category: "delete",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.delete.immediate",
        keys: "shift+delete",
        action: "note.deleteImmediate",
        context: ShortcutContext.GLOBAL,
        description: "확인 없이 즉시 노트를 삭제합니다",
        category: "delete",
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
    autoSaveService?: AutoSaveService,
    confirmDialogService?: any,
    getCurrentNote?: () => any,
    setCurrentNote?: (note: any) => void,
    loadNotes?: () => Promise<void>,
    tabStore?: any
  ): void {
    try {
      // 액션 등록 (서비스가 제공된 경우에만)
      if (noteService && autoSaveService) {
        const fileActions = createFileActions(noteService, autoSaveService);

        // 파일 액션 등록
        this.shortcutManager.registerAction(fileActions.createNewNote);
        this.shortcutManager.registerAction(fileActions.saveNote);
        this.shortcutManager.registerAction(fileActions.saveAllNotes);
        this.shortcutManager.registerAction(fileActions.openNoteList);

        // 삭제 액션 등록 (필요한 서비스가 모두 제공된 경우에만)
        if (
          confirmDialogService &&
          getCurrentNote &&
          setCurrentNote &&
          loadNotes
        ) {
          const deleteActions = createDeleteActions(
            noteService,
            confirmDialogService,
            getCurrentNote,
            setCurrentNote,
            loadNotes
          );
          this.shortcutManager.registerAction(deleteActions.deleteCurrentNote);
          this.shortcutManager.registerAction(deleteActions.deleteSelectedNote);
          this.shortcutManager.registerAction(
            deleteActions.deleteNoteWithoutConfirm
          );
        }
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
        "note.delete",
        "note.deleteSelected",
        "note.deleteImmediate",
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
