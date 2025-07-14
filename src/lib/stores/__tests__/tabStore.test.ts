import { describe, test, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { tabStore } from "../tabStore";
import type { Tab } from "../../database/types";

describe("TabStore", () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    tabStore.reset();
  });

  test("should initialize with empty tabs", () => {
    const tabs = get(tabStore);
    expect(tabs).toEqual([]);
  });

  test("should add new tab correctly", () => {
    const newTab: Tab = {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: true,
    };

    tabStore.addTab(newTab);
    const tabs = get(tabStore);

    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toEqual(newTab);
  });

  test("should set active tab correctly", () => {
    const tab1: Tab = {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: true,
    };
    const tab2: Tab = {
      id: "tab-2",
      noteId: "note-2",
      position: 1,
      isActive: false,
    };

    tabStore.addTab(tab1);
    tabStore.addTab(tab2);
    tabStore.setActiveTab("tab-2");

    const tabs = get(tabStore);
    expect(tabs[0].isActive).toBe(false);
    expect(tabs[1].isActive).toBe(true);
  });

  test("should remove tab correctly", () => {
    const tab1: Tab = {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: true,
    };
    const tab2: Tab = {
      id: "tab-2",
      noteId: "note-2",
      position: 1,
      isActive: false,
    };

    tabStore.addTab(tab1);
    tabStore.addTab(tab2);
    tabStore.removeTab("tab-1");

    const tabs = get(tabStore);
    expect(tabs).toHaveLength(1);
    expect(tabs[0].id).toBe("tab-2");
    expect(tabs[0].isActive).toBe(true); // 남은 탭이 활성화되어야 함
  });

  test("should reorder tabs correctly", () => {
    const tab1: Tab = {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: true,
    };
    const tab2: Tab = {
      id: "tab-2",
      noteId: "note-2",
      position: 1,
      isActive: false,
    };
    const tab3: Tab = {
      id: "tab-3",
      noteId: "note-3",
      position: 2,
      isActive: false,
    };

    tabStore.addTab(tab1);
    tabStore.addTab(tab2);
    tabStore.addTab(tab3);

    // tab-2를 첫 번째 위치로 이동
    tabStore.reorderTabs("tab-2", 0);

    const tabs = get(tabStore);
    expect(tabs[0].id).toBe("tab-2");
    expect(tabs[0].position).toBe(0);
    expect(tabs[1].id).toBe("tab-1");
    expect(tabs[1].position).toBe(1);
    expect(tabs[2].id).toBe("tab-3");
    expect(tabs[2].position).toBe(2);
  });

  test("should get active tab correctly", () => {
    const tab1: Tab = {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: false,
    };
    const tab2: Tab = {
      id: "tab-2",
      noteId: "note-2",
      position: 1,
      isActive: true,
    };

    tabStore.addTab(tab1);
    tabStore.addTab(tab2);

    const activeTab = tabStore.getActiveTab();
    expect(activeTab).toEqual(tab2);
  });

  test("should return null when no active tab", () => {
    const activeTab = tabStore.getActiveTab();
    expect(activeTab).toBe(null);
  });

  test("should close all tabs except one", () => {
    const tab1: Tab = {
      id: "tab-1",
      noteId: "note-1",
      position: 0,
      isActive: true,
    };
    const tab2: Tab = {
      id: "tab-2",
      noteId: "note-2",
      position: 1,
      isActive: false,
    };
    const tab3: Tab = {
      id: "tab-3",
      noteId: "note-3",
      position: 2,
      isActive: false,
    };

    tabStore.addTab(tab1);
    tabStore.addTab(tab2);
    tabStore.addTab(tab3);

    tabStore.closeOtherTabs("tab-2");

    const tabs = get(tabStore);
    expect(tabs).toHaveLength(1);
    expect(tabs[0].id).toBe("tab-2");
    expect(tabs[0].isActive).toBe(true);
  });
});
