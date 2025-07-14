import type { ShortcutAction } from "../types/shortcut";
import type { NoteService } from "../services/noteService";
import type { AutoSaveService } from "../services/autoSaveService";

export function createFileActions(
  noteService: NoteService,
  autoSaveService: AutoSaveService
) {
  const createNewNote: ShortcutAction = {
    id: "file.new",
    name: "새 메모 생성",
    description: "새로운 메모를 생성합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        await noteService.createNote("", "", []);
        console.log("새 메모가 생성되었습니다");
      } catch (error) {
        console.error("메모 생성 실패:", error);
      }
    },
  };

  const saveNote: ShortcutAction = {
    id: "file.save",
    name: "메모 저장",
    description: "현재 메모를 저장합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        // 현재 활성 메모가 있다면 저장 (실제 구현에서는 현재 메모 ID를 가져와야 함)
        // 지금은 모든 pending saves를 저장
        await autoSaveService.saveAll();
        console.log("메모가 저장되었습니다");
      } catch (error) {
        console.error("메모 저장 실패:", error);
      }
    },
  };

  const saveAllNotes: ShortcutAction = {
    id: "file.saveAll",
    name: "모든 메모 저장",
    description: "열린 모든 메모를 저장합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        await autoSaveService.saveAll();
        console.log("모든 메모가 저장되었습니다");
      } catch (error) {
        console.error("전체 저장 실패:", error);
      }
    },
  };

  const openNoteList: ShortcutAction = {
    id: "file.openList",
    name: "메모 목록 열기",
    description: "메모 목록을 엽니다",
    handler: async (event: KeyboardEvent) => {
      try {
        const notes = await noteService.getAllNotes();
        console.log(`${notes.length}개의 메모를 불러왔습니다`);
      } catch (error) {
        console.error("메모 목록 로딩 실패:", error);
      }
    },
  };

  return {
    createNewNote,
    saveNote,
    saveAllNotes,
    openNoteList,
  };
}
