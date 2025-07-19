import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock svelte/store first
vi.mock("svelte/store", () => ({
  get: vi.fn(() => []),
}));

// Mock tab store
vi.mock("../../stores/tabStore", () => ({
  tabStore: {
    subscribe: vi.fn(),
    addTab: vi.fn(),
    removeTab: vi.fn(),
    setActiveTab: vi.fn(),
    reorderTabs: vi.fn(),
    getActiveTab: vi.fn(),
    closeOtherTabs: vi.fn(),
    reset: vi.fn(),
  },
}));

import { createTabActions } from "../tabActions";
import { tabStore } from "../../stores/tabStore";

describe("Tab Actions", () => {
  let tabActions: ReturnType<typeof createTabActions>;

  beforeEach(() => {
    vi.clearAllMocks();
    tabActions = createTabActions();
  });

  describe("createNewTab action", () => {
    it("should have correct metadata", () => {
      const action = tabActions.createNewTab;
      expect(action.id).toBe("tab.new");
      expect(action.name).toBe("새 탭");
      expect(action.description).toBe("새로운 탭을 생성합니다");
    });

    it("should create a new tab", async () => {
      const mockEvent = new KeyboardEvent("keydown", {
        key: "t",
        ctrlKey: true,
      });
      await tabActions.createNewTab.handler(mockEvent);

      expect(tabStore.addTab).toHaveBeenCalledWith({
        id: expect.any(String),
        noteId: expect.any(String),
        position: 0,
        isActive: true,
      });
    });

    it("should handle creation errors gracefully", async () => {
      (tabStore.addTab as any).mockImplementation(() => {
        throw new Error("Tab creation failed");
      });

      const mockEvent = new KeyboardEvent("keydown", {
        key: "t",
        ctrlKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        tabActions.createNewTab.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });

  describe("closeCurrentTab action", () => {
    it("should have correct metadata", () => {
      const action = tabActions.closeCurrentTab;
      expect(action.id).toBe("tab.close");
      expect(action.name).toBe("탭 닫기");
      expect(action.description).toBe("현재 탭을 닫습니다");
    });

    it("should close current tab when tab exists", async () => {
      const mockTab = {
        id: "tab-1",
        noteId: "note-1",
        position: 0,
        isActive: true,
      };

      (tabStore.getActiveTab as any).mockReturnValue(mockTab);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "w",
        ctrlKey: true,
      });
      await tabActions.closeCurrentTab.handler(mockEvent);

      expect(tabStore.removeTab).toHaveBeenCalledWith("tab-1");
    });

    it("should not close tab when no active tab", async () => {
      (tabStore.getActiveTab as any).mockReturnValue(null);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "w",
        ctrlKey: true,
      });
      await tabActions.closeCurrentTab.handler(mockEvent);

      expect(tabStore.removeTab).not.toHaveBeenCalled();
    });

    it("should handle close errors gracefully", async () => {
      const mockTab = {
        id: "tab-1",
        noteId: "note-1",
        position: 0,
        isActive: true,
      };

      (tabStore.getActiveTab as any).mockReturnValue(mockTab);
      (tabStore.removeTab as any).mockImplementation(() => {
        throw new Error("Tab close failed");
      });

      const mockEvent = new KeyboardEvent("keydown", {
        key: "w",
        ctrlKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        tabActions.closeCurrentTab.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });

  describe("nextTab action", () => {
    it("should have correct metadata", () => {
      const action = tabActions.nextTab;
      expect(action.id).toBe("tab.next");
      expect(action.name).toBe("다음 탭");
      expect(action.description).toBe("다음 탭으로 이동합니다");
    });

    it("should move to next tab", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: false },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: false },
      ];

      // Mock get function to return tabs
      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);
      (tabStore.getActiveTab as any).mockReturnValue(mockTabs[0]);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
      });
      await tabActions.nextTab.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-2");
    });

    it("should wrap to first tab when at last tab", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: false },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: false },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: true },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);
      (tabStore.getActiveTab as any).mockReturnValue(mockTabs[2]);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
      });
      await tabActions.nextTab.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-1");
    });

    it("should handle single tab gracefully", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);
      (tabStore.getActiveTab as any).mockReturnValue(mockTabs[0]);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
      });
      await tabActions.nextTab.handler(mockEvent);

      // 단일 탭일 때는 setActiveTab이 호출되지 않아야 함
      expect(tabStore.setActiveTab).not.toHaveBeenCalled();
    });
  });

  describe("previousTab action", () => {
    it("should have correct metadata", () => {
      const action = tabActions.previousTab;
      expect(action.id).toBe("tab.prev");
      expect(action.name).toBe("이전 탭");
      expect(action.description).toBe("이전 탭으로 이동합니다");
    });

    it("should move to previous tab", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: false },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: true },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: false },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);
      (tabStore.getActiveTab as any).mockReturnValue(mockTabs[1]);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
        shiftKey: true,
      });
      await tabActions.previousTab.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-1");
    });

    it("should wrap to last tab when at first tab", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: false },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: false },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);
      (tabStore.getActiveTab as any).mockReturnValue(mockTabs[0]);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
        shiftKey: true,
      });
      await tabActions.previousTab.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-3");
    });
  });

  describe("searchTabs action", () => {
    it("should have correct metadata", () => {
      const action = tabActions.searchTabs;
      expect(action.id).toBe("tab.search");
      expect(action.name).toBe("탭 검색");
      expect(action.description).toBe("탭을 검색합니다");
    });

    it("should log search functionality", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "p",
        ctrlKey: true,
      });
      await tabActions.searchTabs.handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith("탭 검색 기능 실행");

      consoleSpy.mockRestore();
    });

    it("should handle search errors gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {
        throw new Error("Search failed");
      });

      const mockEvent = new KeyboardEvent("keydown", {
        key: "p",
        ctrlKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        tabActions.searchTabs.handler(mockEvent)
      ).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("goToTab actions", () => {
    it("should have correct metadata for all tab number actions", () => {
      expect(tabActions.goToTab1.id).toBe("tab.goTo1");
      expect(tabActions.goToTab1.name).toBe("탭 1로 이동");
      expect(tabActions.goToTab1.description).toBe("1번째 탭으로 이동합니다");

      expect(tabActions.goToTab0.id).toBe("tab.goTo0");
      expect(tabActions.goToTab0.name).toBe("탭 0로 이동");
      expect(tabActions.goToTab0.description).toBe(
        "0번째 탭으로 이동합니다 (마지막 탭)"
      );
    });

    it("should go to first tab with Ctrl+1", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: false },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: true },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: false },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "1",
        ctrlKey: true,
      });
      await tabActions.goToTab1.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-1");
    });

    it("should go to third tab with Ctrl+3", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: false },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: false },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "3",
        ctrlKey: true,
      });
      await tabActions.goToTab3.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-3");
    });

    it("should go to last tab with Ctrl+0", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: false },
        { id: "tab-3", noteId: "note-3", position: 2, isActive: false },
        { id: "tab-4", noteId: "note-4", position: 3, isActive: false },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "0",
        ctrlKey: true,
      });
      await tabActions.goToTab0.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-4");
    });

    it("should handle non-existing tab number gracefully", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: false },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "5",
        ctrlKey: true,
      });
      await tabActions.goToTab5.handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        "5번째 탭이 존재하지 않습니다 (총 2개 탭)"
      );
      expect(tabStore.setActiveTab).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle empty tabs gracefully", async () => {
      const { get } = await import("svelte/store");
      (get as any).mockReturnValue([]);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "1",
        ctrlKey: true,
      });
      await tabActions.goToTab1.handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith("이동할 탭이 없습니다");
      expect(tabStore.setActiveTab).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle errors gracefully", async () => {
      const { get } = await import("svelte/store");
      (get as any).mockImplementation(() => {
        throw new Error("Store error");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "1",
        ctrlKey: true,
      });

      await expect(
        tabActions.goToTab1.handler(mockEvent)
      ).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "탭 1 이동 실패:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should work correctly with single tab (Ctrl+0)", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: true },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "0",
        ctrlKey: true,
      });
      await tabActions.goToTab0.handler(mockEvent);

      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-1");
    });

    it("should not move to tab when Ctrl key is not pressed", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: false },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: true },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      // Ctrl 키 없이 이벤트 생성
      const mockEvent = new KeyboardEvent("keydown", {
        key: "1",
        ctrlKey: false,
      });
      await tabActions.goToTab1.handler(mockEvent);

      // 탭 이동이 발생하지 않아야 함
      expect(tabStore.setActiveTab).not.toHaveBeenCalled();
    });

    it("should require both Ctrl key and proper event state", async () => {
      const mockTabs = [
        { id: "tab-1", noteId: "note-1", position: 0, isActive: false },
        { id: "tab-2", noteId: "note-2", position: 1, isActive: true },
      ];

      const { get } = await import("svelte/store");
      (get as any).mockReturnValue(mockTabs);

      // 다양한 잘못된 조건들 테스트
      const invalidEvents = [
        // Ctrl 키 없음
        new KeyboardEvent("keydown", { key: "1", ctrlKey: false }),
        // Shift+1 (Ctrl이 아님)
        new KeyboardEvent("keydown", { key: "1", shiftKey: true }),
        // Alt+1 (Ctrl이 아님)
        new KeyboardEvent("keydown", { key: "1", altKey: true }),
      ];

      for (const invalidEvent of invalidEvents) {
        await tabActions.goToTab1.handler(invalidEvent);
      }

      // 모든 잘못된 이벤트에 대해 탭 이동이 발생하지 않아야 함
      expect(tabStore.setActiveTab).not.toHaveBeenCalled();

      // 올바른 조건에서는 작동해야 함
      const validEvent = new KeyboardEvent("keydown", {
        key: "1",
        ctrlKey: true,
      });
      await tabActions.goToTab1.handler(validEvent);

      // 이번에는 탭 이동이 발생해야 함
      expect(tabStore.setActiveTab).toHaveBeenCalledWith("tab-1");
    });
  });
});
