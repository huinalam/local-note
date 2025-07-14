import type { ShortcutAction } from "../types/shortcut";
import { tabStore } from "../stores/tabStore";
import { get } from "svelte/store";

export function createTabActions() {
  const createNewTab: ShortcutAction = {
    id: "tab.new",
    name: "새 탭",
    description: "새로운 탭을 생성합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        const newNoteId = crypto.randomUUID();
        const newTabId = crypto.randomUUID();

        // Tab 인터페이스에 맞는 객체 생성
        tabStore.addTab({
          id: newTabId,
          noteId: newNoteId,
          position: 0, // position은 addTab에서 자동으로 설정됨
          isActive: true, // addTab에서 자동으로 설정됨
        });
        console.log("새 탭이 생성되었습니다");
      } catch (error) {
        console.error("탭 생성 실패:", error);
      }
    },
  };

  const closeCurrentTab: ShortcutAction = {
    id: "tab.close",
    name: "탭 닫기",
    description: "현재 탭을 닫습니다",
    handler: async (event: KeyboardEvent) => {
      try {
        const activeTab = tabStore.getActiveTab();
        if (activeTab) {
          tabStore.removeTab(activeTab.id);
          console.log("탭이 닫혔습니다");
        } else {
          console.log("닫을 탭이 없습니다");
        }
      } catch (error) {
        console.error("탭 닫기 실패:", error);
      }
    },
  };

  const nextTab: ShortcutAction = {
    id: "tab.next",
    name: "다음 탭",
    description: "다음 탭으로 이동합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        // tabStore를 구독하여 현재 탭 목록 가져오기
        const allTabs = get(tabStore);
        const activeTab = tabStore.getActiveTab();

        if (allTabs.length <= 1 || !activeTab) {
          return;
        }

        const currentIndex = allTabs.findIndex(
          (tab: any) => tab.id === activeTab.id
        );
        const nextIndex = (currentIndex + 1) % allTabs.length;
        const nextTab = allTabs[nextIndex];

        tabStore.setActiveTab(nextTab.id);
        console.log(`다음 탭으로 이동: ${nextTab.id}`);
      } catch (error) {
        console.error("다음 탭 이동 실패:", error);
      }
    },
  };

  const previousTab: ShortcutAction = {
    id: "tab.prev",
    name: "이전 탭",
    description: "이전 탭으로 이동합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        // tabStore를 구독하여 현재 탭 목록 가져오기
        const allTabs = get(tabStore);
        const activeTab = tabStore.getActiveTab();

        if (allTabs.length <= 1 || !activeTab) {
          return;
        }

        const currentIndex = allTabs.findIndex(
          (tab: any) => tab.id === activeTab.id
        );
        const prevIndex =
          currentIndex === 0 ? allTabs.length - 1 : currentIndex - 1;
        const prevTab = allTabs[prevIndex];

        tabStore.setActiveTab(prevTab.id);
        console.log(`이전 탭으로 이동: ${prevTab.id}`);
      } catch (error) {
        console.error("이전 탭 이동 실패:", error);
      }
    },
  };

  const searchTabs: ShortcutAction = {
    id: "tab.search",
    name: "탭 검색",
    description: "탭을 검색합니다",
    handler: async (event: KeyboardEvent) => {
      try {
        // TODO: 실제 탭 검색 UI 구현
        console.log("탭 검색 기능 실행");
      } catch (error) {
        console.error("탭 검색 실패:", error);
      }
    },
  };

  return {
    createNewTab,
    closeCurrentTab,
    nextTab,
    previousTab,
    searchTabs,
  };
}
