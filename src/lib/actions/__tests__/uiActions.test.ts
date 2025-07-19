import { describe, it, expect, beforeEach, vi } from "vitest";
import { get } from "svelte/store";
import { uiActions } from "../uiActions";
import { isSidebarCollapsed, toggleSidebar } from "../../stores/uiStore";

// uiStore의 toggleSidebar 함수 모킹
vi.mock("../../stores/uiStore", async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    toggleSidebar: vi.fn(),
  };
});

describe("uiActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 사이드바 상태 초기화
    isSidebarCollapsed.set(false);
  });

  describe("toggleSidebar action", () => {
    it("액션이 올바른 ID, 설명, 키 바인딩을 가져야 함", () => {
      const action = uiActions.toggleSidebar;
      expect(action.id).toBe("toggleSidebar");
      expect(action.description).toBe("사이드바 토글");
      expect(action.keybinding).toEqual({
        mac: "Meta+Shift+\\",
        default: "Ctrl+Shift+\\",
      });
    });

    it("execute 함수가 uiStore.toggleSidebar를 호출해야 함", async () => {
      // 액션 실행
      await uiActions.toggleSidebar.execute();

      // toggleSidebar 함수가 한 번 호출되었는지 확인
      expect(toggleSidebar).toHaveBeenCalledTimes(1);
    });

    it("execute 함수가 여러 번 호출되어도 정상 동작해야 함", async () => {
      // 3번 실행
      await uiActions.toggleSidebar.execute();
      await uiActions.toggleSidebar.execute();
      await uiActions.toggleSidebar.execute();

      // toggleSidebar 함수가 3번 호출되었는지 확인
      expect(toggleSidebar).toHaveBeenCalledTimes(3);
    });
  });
});
