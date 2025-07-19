import type { ShortcutAction } from "../types/shortcut";
import type { Note } from "../database/types";

export function createNoteNavigationActions(
  getNotes: () => Note[],
  getCurrentNote: () => Note | null,
  setCurrentNote: (note: Note) => void
) {
  const goToNoteByIndex = (index: number): ShortcutAction => {
    return {
      id: `note.goTo${index + 1}`,
      name: `${index + 1}번째 메모로 이동`,
      description: `${index + 1}번째 메모로 이동합니다`,
      handler: async (event: KeyboardEvent) => {
        try {
          // 사용자가 명시적으로 단축키를 누른 경우에만 실행
          if (!event.ctrlKey || event.defaultPrevented) {
            return;
          }

          const notes = getNotes();

          if (notes.length === 0) {
            console.log("이동할 메모가 없습니다");
            return;
          }

          // 유효한 인덱스 범위 체크
          if (index >= 0 && index < notes.length) {
            const targetNote = notes[index];
            setCurrentNote(targetNote);
            console.log(
              `${index + 1}번째 메모로 이동: ${targetNote.title || "제목 없음"}`
            );
          } else {
            console.log(
              `${index + 1}번째 메모가 존재하지 않습니다 (총 ${
                notes.length
              }개 메모)`
            );
          }
        } catch (error) {
          console.error(`메모 ${index + 1} 이동 실패:`, error);
        }
      },
    };
  };

  // 1-9번 메모 이동 액션들 생성
  const goToNote1 = goToNoteByIndex(0);
  const goToNote2 = goToNoteByIndex(1);
  const goToNote3 = goToNoteByIndex(2);
  const goToNote4 = goToNoteByIndex(3);
  const goToNote5 = goToNoteByIndex(4);
  const goToNote6 = goToNoteByIndex(5);
  const goToNote7 = goToNoteByIndex(6);
  const goToNote8 = goToNoteByIndex(7);
  const goToNote9 = goToNoteByIndex(8);

  return {
    goToNote1,
    goToNote2,
    goToNote3,
    goToNote4,
    goToNote5,
    goToNote6,
    goToNote7,
    goToNote8,
    goToNote9,
  };
}
