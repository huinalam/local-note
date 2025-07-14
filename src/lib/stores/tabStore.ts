import { writable, derived, get } from "svelte/store";
import type { Tab } from "../database/types";

// 탭 배열을 저장하는 기본 스토어
const tabsStore = writable<Tab[]>([]);

// 탭 스토어 인터페이스 정의
interface TabStore {
  subscribe: typeof tabsStore.subscribe;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  reorderTabs: (tabId: string, newPosition: number) => void;
  getActiveTab: () => Tab | null;
  closeOtherTabs: (exceptTabId: string) => void;
  reset: () => void;
}

// 탭 스토어 구현
export const tabStore: TabStore = {
  subscribe: tabsStore.subscribe,

  addTab: (tab: Tab) => {
    tabsStore.update((tabs) => {
      // 새 탭 추가 시 다른 탭들은 비활성화
      const updatedTabs = tabs.map((t) => ({ ...t, isActive: false }));
      return [...updatedTabs, { ...tab, isActive: true }];
    });
  },

  removeTab: (tabId: string) => {
    tabsStore.update((tabs) => {
      const filteredTabs = tabs.filter((tab) => tab.id !== tabId);

      // 제거된 탭이 활성 탭이었다면 다른 탭을 활성화
      const removedTab = tabs.find((tab) => tab.id === tabId);
      if (removedTab?.isActive && filteredTabs.length > 0) {
        filteredTabs[0].isActive = true;
      }

      // position 재정렬
      return filteredTabs.map((tab, index) => ({
        ...tab,
        position: index,
      }));
    });
  },

  setActiveTab: (tabId: string) => {
    tabsStore.update((tabs) => {
      return tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
      }));
    });
  },

  reorderTabs: (tabId: string, newPosition: number) => {
    tabsStore.update((tabs) => {
      const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return tabs;

      const reorderedTabs = [...tabs];
      const [movedTab] = reorderedTabs.splice(tabIndex, 1);
      reorderedTabs.splice(newPosition, 0, movedTab);

      // position 재정렬
      return reorderedTabs.map((tab, index) => ({
        ...tab,
        position: index,
      }));
    });
  },

  getActiveTab: () => {
    const tabs = get(tabsStore);
    return tabs.find((tab) => tab.isActive) || null;
  },

  closeOtherTabs: (exceptTabId: string) => {
    tabsStore.update((tabs) => {
      const keptTab = tabs.find((tab) => tab.id === exceptTabId);
      if (!keptTab) return tabs;

      return [
        {
          ...keptTab,
          isActive: true,
          position: 0,
        },
      ];
    });
  },

  reset: () => {
    tabsStore.set([]);
  },
};

// 활성 탭을 쉽게 가져올 수 있는 derived store
export const activeTab = derived(
  tabsStore,
  ($tabs) => $tabs.find((tab) => tab.isActive) || null
);
