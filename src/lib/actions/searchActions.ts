import type { ShortcutAction } from "../types/shortcut";

export function createSearchActions(openSearchModal: () => void) {
  const openSearchModalAction: ShortcutAction = {
    id: "search.openModal",
    name: "검색 모달 열기",
    description: "메모 검색 모달을 엽니다",
    handler: async (event: KeyboardEvent) => {
      try {
        // 이벤트 전파 방지
        event.preventDefault();
        event.stopPropagation();

        // 검색 모달 열기
        openSearchModal();

        console.log("검색 모달을 열었습니다");
      } catch (error) {
        console.error("검색 모달 열기 실패:", error);
      }
    },
  };

  return {
    openSearchModal: openSearchModalAction,
  };
}
