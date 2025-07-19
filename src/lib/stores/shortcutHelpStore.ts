import { writable } from "svelte/store";
import type { ShortcutHelpData } from "../types/shortcut";

interface ShortcutHelpState {
  isOpen: boolean;
  shortcutData: ShortcutHelpData[];
}

const initialState: ShortcutHelpState = {
  isOpen: false,
  shortcutData: [],
};

function createShortcutHelpStore() {
  const { subscribe, set, update } = writable<ShortcutHelpState>(initialState);

  return {
    subscribe,

    /**
     * 도움말 모달을 엽니다
     */
    open: (shortcutData: ShortcutHelpData[]) => {
      update((state) => ({
        ...state,
        isOpen: true,
        shortcutData,
      }));
    },

    /**
     * 도움말 모달을 닫습니다
     */
    close: () => {
      update((state) => ({
        ...state,
        isOpen: false,
      }));
    },

    /**
     * 단축키 데이터를 업데이트합니다
     */
    updateShortcutData: (shortcutData: ShortcutHelpData[]) => {
      update((state) => ({
        ...state,
        shortcutData,
      }));
    },

    /**
     * 스토어를 초기 상태로 리셋합니다
     */
    reset: () => {
      set(initialState);
    },
  };
}

export const shortcutHelpStore = createShortcutHelpStore();
