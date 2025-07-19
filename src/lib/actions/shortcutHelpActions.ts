import type { ShortcutAction } from "../types/shortcut";

export function createShortcutHelpActions(openHelp: () => void) {
  const openShortcutHelpAction: ShortcutAction = {
    id: "help.openShortcutHelp",
    name: "단축키 도움말 열기",
    description: "단축키 도움말 모달을 엽니다",
    handler: async (event: KeyboardEvent) => {
      try {
        // 이벤트 전파 방지
        event.preventDefault();
        event.stopPropagation();

        // 도움말 모달 열기
        if (openHelp && typeof openHelp === "function") {
          openHelp();
        }

        console.log("단축키 도움말을 열었습니다");
      } catch (error) {
        console.error("단축키 도움말 열기 실패:", error);
        // 에러가 발생해도 예외를 던지지 않음
      }
    },
    canExecute: () => true, // 항상 실행 가능
  };

  return {
    openShortcutHelp: openShortcutHelpAction,
  };
}
