import type { ShortcutAction } from "../types/shortcut";
import type { NoteService } from "../services/noteService";
import type { Note } from "../database/types";

// ConfirmDialog 서비스 인터페이스
interface ConfirmDialogService {
  show: (config: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "warning" | "info";
    onConfirm: () => void;
    onCancel: () => void;
  }) => void;
  hide: () => void;
  isOpen: boolean;
}

// 현재 노트 상태 관리 함수들
type GetCurrentNoteFn = () => Note | null;
type SetCurrentNoteFn = (note: Note | null) => void;
type LoadNotesFn = () => Promise<void>;

export function createDeleteActions(
  noteService: NoteService,
  confirmDialog: ConfirmDialogService,
  getCurrentNote: GetCurrentNoteFn,
  setCurrentNote: SetCurrentNoteFn,
  loadNotes: LoadNotesFn
) {
  /**
   * 현재 노트를 삭제하는 액션 (확인 다이얼로그 포함)
   */
  const deleteCurrentNote: ShortcutAction = {
    id: "note.delete",
    name: "노트 삭제",
    description: "현재 노트를 삭제합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        const currentNote = getCurrentNote();
        if (!currentNote) {
          console.log("삭제할 노트가 없습니다");
          return;
        }

        // 확인 다이얼로그 표시
        confirmDialog.show({
          title: "노트 삭제",
          message:
            "정말로 이 노트를 삭제하시겠습니까?\n삭제된 노트는 복구할 수 없습니다.",
          confirmText: "삭제",
          cancelText: "취소",
          variant: "danger",
          onConfirm: async () => {
            try {
              const success = await noteService.deleteNote(currentNote.id);
              if (success) {
                // 노트 목록 새로고침
                await loadNotes();

                // 현재 노트 초기화
                setCurrentNote(null);

                console.log("노트가 성공적으로 삭제되었습니다");
              } else {
                console.error("노트 삭제 실패: 노트를 찾을 수 없습니다");
              }
            } catch (error) {
              console.error("노트 삭제 실패:", error);
            }
            confirmDialog.hide();
          },
          onCancel: () => {
            console.log("노트 삭제가 취소되었습니다");
            confirmDialog.hide();
          },
        });
      } catch (error) {
        console.error("노트 삭제 액션 실행 실패:", error);
      }
    },
  };

  /**
   * 선택된 노트를 삭제하는 액션 (ID 기반)
   */
  const deleteSelectedNote: ShortcutAction = {
    id: "note.deleteSelected",
    name: "선택된 노트 삭제",
    description: "목록에서 선택된 노트를 삭제합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        const currentNote = getCurrentNote();
        if (!currentNote) {
          console.log("삭제할 노트가 없습니다");
          return;
        }

        // 노트 존재 확인
        const note = await noteService.getNote(currentNote.id);
        if (!note) {
          console.error("노트 삭제 실패: 노트를 찾을 수 없습니다");
          return;
        }

        // 확인 다이얼로그 표시
        confirmDialog.show({
          title: "노트 삭제",
          message: `"${
            note.title || "제목 없음"
          }" 노트를 삭제하시겠습니까?\n삭제된 노트는 복구할 수 없습니다.`,
          confirmText: "삭제",
          cancelText: "취소",
          variant: "danger",
          onConfirm: async () => {
            try {
              const success = await noteService.deleteNote(currentNote.id);
              if (success) {
                // 노트 목록 새로고침
                await loadNotes();

                // 현재 노트가 삭제된 노트와 같다면 현재 노트를 초기화
                const current = getCurrentNote();
                if (current && current.id === currentNote.id) {
                  setCurrentNote(null);
                }

                console.log("노트가 성공적으로 삭제되었습니다");
              } else {
                console.error("노트 삭제 실패: 노트를 찾을 수 없습니다");
              }
            } catch (error) {
              console.error("노트 삭제 실패:", error);
            }
            confirmDialog.hide();
          },
          onCancel: () => {
            console.log("노트 삭제가 취소되었습니다");
            confirmDialog.hide();
          },
        });
      } catch (error) {
        console.error("선택된 노트 삭제 액션 실행 실패:", error);
      }
    },
  };

  /**
   * 확인 없이 즉시 노트를 삭제하는 액션 (고급 사용자용)
   */
  const deleteNoteWithoutConfirm: ShortcutAction = {
    id: "note.deleteImmediate",
    name: "즉시 노트 삭제",
    description: "확인 없이 즉시 노트를 삭제합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        const currentNote = getCurrentNote();
        const targetNoteId = currentNote?.id;

        if (!targetNoteId) {
          console.log("삭제할 노트가 없습니다");
          return;
        }

        const success = await noteService.deleteNote(targetNoteId);
        if (success) {
          // 노트 목록 새로고침
          await loadNotes();

          // 현재 노트가 삭제된 노트와 같다면 현재 노트를 초기화
          const current = getCurrentNote();
          if (current && current.id === targetNoteId) {
            setCurrentNote(null);
          }

          console.log("노트가 즉시 삭제되었습니다");
        } else {
          console.error("노트 삭제 실패: 노트를 찾을 수 없습니다");
        }
      } catch (error) {
        console.error("즉시 노트 삭제 실패:", error);
      }
    },
  };

  return {
    deleteCurrentNote,
    deleteSelectedNote,
    deleteNoteWithoutConfirm,
  };
}
