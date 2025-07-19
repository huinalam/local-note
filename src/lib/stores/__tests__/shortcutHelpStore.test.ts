import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { shortcutHelpStore } from "../shortcutHelpStore";
import {
  HelpShortcutCategory,
  type ShortcutHelpData,
} from "../../types/shortcut";

describe("shortcutHelpStore", () => {
  const mockShortcutData: ShortcutHelpData[] = [
    {
      category: HelpShortcutCategory.FILE,
      shortcuts: [
        {
          id: "file.new",
          keys: "ctrl+n",
          action: "file.new",
          context: "global" as any,
          description: "새로운 메모를 생성합니다",
          category: "file",
          enabled: true,
          priority: 10,
        },
      ],
    },
    {
      category: HelpShortcutCategory.EDITOR,
      shortcuts: [
        {
          id: "editor.bold",
          keys: "Cmd-B",
          action: "toggleBold",
          description: "텍스트를 굵게 만듭니다",
          category: HelpShortcutCategory.EDITOR,
        },
      ],
    },
  ];

  beforeEach(() => {
    // 각 테스트 전에 스토어를 초기 상태로 리셋
    shortcutHelpStore.reset();
  });

  describe("초기 상태", () => {
    it("should have initial state with modal closed and empty data", () => {
      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(false);
      expect(state.shortcutData).toEqual([]);
    });
  });

  describe("open", () => {
    it("should open modal and set shortcut data", () => {
      shortcutHelpStore.open(mockShortcutData);

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(true);
      expect(state.shortcutData).toEqual(mockShortcutData);
    });

    it("should open modal with empty data", () => {
      shortcutHelpStore.open([]);

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(true);
      expect(state.shortcutData).toEqual([]);
    });
  });

  describe("close", () => {
    it("should close modal while keeping shortcut data", () => {
      // 먼저 모달을 열고 데이터를 설정
      shortcutHelpStore.open(mockShortcutData);

      // 모달 닫기
      shortcutHelpStore.close();

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(false);
      expect(state.shortcutData).toEqual(mockShortcutData); // 데이터는 유지
    });

    it("should close modal when already closed", () => {
      // 이미 닫힌 상태에서 close 호출
      shortcutHelpStore.close();

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(false);
      expect(state.shortcutData).toEqual([]);
    });
  });

  describe("updateShortcutData", () => {
    it("should update shortcut data without changing modal state", () => {
      // 먼저 모달을 열고
      shortcutHelpStore.open([]);

      // 데이터만 업데이트
      shortcutHelpStore.updateShortcutData(mockShortcutData);

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(true); // 모달 상태는 유지
      expect(state.shortcutData).toEqual(mockShortcutData);
    });

    it("should update shortcut data when modal is closed", () => {
      // 모달이 닫힌 상태에서 데이터 업데이트
      shortcutHelpStore.updateShortcutData(mockShortcutData);

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(false); // 모달 상태는 닫힌 채로 유지
      expect(state.shortcutData).toEqual(mockShortcutData);
    });
  });

  describe("reset", () => {
    it("should reset store to initial state", () => {
      // 스토어 상태 변경
      shortcutHelpStore.open(mockShortcutData);

      // 리셋
      shortcutHelpStore.reset();

      const state = get(shortcutHelpStore);

      expect(state.isOpen).toBe(false);
      expect(state.shortcutData).toEqual([]);
    });
  });

  describe("상태 변화 구독", () => {
    it("should notify subscribers when state changes", () => {
      let stateChanges: any[] = [];

      const unsubscribe = shortcutHelpStore.subscribe((state) => {
        stateChanges.push({ ...state });
      });

      try {
        // 초기 상태
        expect(stateChanges).toHaveLength(1);
        expect(stateChanges[0].isOpen).toBe(false);

        // 모달 열기
        shortcutHelpStore.open(mockShortcutData);
        expect(stateChanges).toHaveLength(2);
        expect(stateChanges[1].isOpen).toBe(true);

        // 모달 닫기
        shortcutHelpStore.close();
        expect(stateChanges).toHaveLength(3);
        expect(stateChanges[2].isOpen).toBe(false);
      } finally {
        unsubscribe();
      }
    });
  });
});
