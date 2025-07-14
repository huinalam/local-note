import { describe, it, expect, beforeEach, vi } from "vitest";
import { DefaultShortcuts } from "../DefaultShortcuts";
import { ShortcutContext, type Shortcut } from "../../types/shortcut";
import type { ShortcutManager } from "../ShortcutManager";

describe("DefaultShortcuts", () => {
  let mockShortcutManager: Partial<ShortcutManager>;
  let defaultShortcuts: DefaultShortcuts;

  beforeEach(() => {
    mockShortcutManager = {
      registerShortcut: vi.fn(),
      registerAction: vi.fn(),
      unregisterShortcut: vi.fn(),
      unregisterAction: vi.fn(),
    };

    defaultShortcuts = new DefaultShortcuts(
      mockShortcutManager as ShortcutManager
    );
  });

  describe("initialization", () => {
    it("should create DefaultShortcuts instance", () => {
      expect(defaultShortcuts).toBeInstanceOf(DefaultShortcuts);
    });

    it("should have shortcut manager reference", () => {
      expect(defaultShortcuts["shortcutManager"]).toBe(mockShortcutManager);
    });
  });

  describe("registerAll", () => {
    it("should register all default shortcuts without services", () => {
      defaultShortcuts.registerAll();

      // 단축키 등록 확인
      expect(mockShortcutManager.registerShortcut).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: "ctrl+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
        })
      );

      expect(mockShortcutManager.registerShortcut).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: "ctrl+t",
          action: "tab.new",
          context: ShortcutContext.GLOBAL,
        })
      );

      // 서비스가 없으면 액션은 등록되지 않음
      expect(mockShortcutManager.registerAction).not.toHaveBeenCalled();
    });

    it("should register file management shortcuts", () => {
      defaultShortcuts.registerAll();

      const fileShortcuts = [
        { keys: "ctrl+n", action: "file.new" },
        { keys: "ctrl+s", action: "file.save" },
        { keys: "ctrl+shift+s", action: "file.saveAll" },
        { keys: "ctrl+o", action: "file.openList" },
      ];

      fileShortcuts.forEach((shortcut) => {
        expect(mockShortcutManager.registerShortcut).toHaveBeenCalledWith(
          expect.objectContaining({
            keys: shortcut.keys,
            action: shortcut.action,
            context: ShortcutContext.GLOBAL,
          })
        );
      });
    });

    it("should register tab management shortcuts", () => {
      defaultShortcuts.registerAll();

      const tabShortcuts = [
        { keys: "ctrl+t", action: "tab.new" },
        { keys: "ctrl+w", action: "tab.close" },
        { keys: "ctrl+tab", action: "tab.next" },
        { keys: "ctrl+shift+tab", action: "tab.prev" },
        { keys: "ctrl+p", action: "tab.search" },
      ];

      tabShortcuts.forEach((shortcut) => {
        expect(mockShortcutManager.registerShortcut).toHaveBeenCalledWith(
          expect.objectContaining({
            keys: shortcut.keys,
            action: shortcut.action,
            context: ShortcutContext.GLOBAL,
          })
        );
      });
    });

    it("should handle registration errors gracefully", () => {
      (mockShortcutManager.registerShortcut as any).mockImplementation(() => {
        throw new Error("Registration failed");
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      expect(() => defaultShortcuts.registerAll()).not.toThrow();
    });
  });

  describe("unregisterAll", () => {
    it("should unregister all shortcuts and actions", () => {
      defaultShortcuts.unregisterAll();

      // 모든 기본 액션 해제 확인
      const expectedActions = [
        "file.new",
        "file.save",
        "file.saveAll",
        "file.openList",
        "tab.new",
        "tab.close",
        "tab.next",
        "tab.prev",
        "tab.search",
      ];

      expectedActions.forEach((actionId) => {
        expect(mockShortcutManager.unregisterAction).toHaveBeenCalledWith(
          actionId
        );
      });

      // 모든 기본 단축키 해제 확인
      const expectedShortcuts = [
        "default.file.new",
        "default.file.save",
        "default.file.saveAll",
        "default.file.openList",
        "default.tab.new",
        "default.tab.close",
        "default.tab.next",
        "default.tab.prev",
        "default.tab.search",
      ];

      expectedShortcuts.forEach((shortcutId) => {
        expect(mockShortcutManager.unregisterShortcut).toHaveBeenCalledWith(
          shortcutId
        );
      });
    });

    it("should handle unregistration errors gracefully", () => {
      (mockShortcutManager.unregisterAction as any).mockImplementation(() => {
        throw new Error("Unregistration failed");
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      expect(() => defaultShortcuts.unregisterAll()).not.toThrow();
    });
  });

  describe("getDefaultShortcuts", () => {
    it("should return all default shortcuts configuration", () => {
      const shortcuts = defaultShortcuts.getDefaultShortcuts();

      expect(shortcuts).toBeInstanceOf(Array);
      expect(shortcuts.length).toBeGreaterThan(0);

      // 파일 관리 단축키 확인
      const fileNewShortcut = shortcuts.find(
        (s: Shortcut) => s.action === "file.new"
      );
      expect(fileNewShortcut).toEqual(
        expect.objectContaining({
          keys: "ctrl+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "새로운 메모를 생성합니다",
          category: "file",
        })
      );

      // 탭 관리 단축키 확인
      const tabNewShortcut = shortcuts.find(
        (s: Shortcut) => s.action === "tab.new"
      );
      expect(tabNewShortcut).toEqual(
        expect.objectContaining({
          keys: "ctrl+t",
          action: "tab.new",
          context: ShortcutContext.GLOBAL,
          description: "새로운 탭을 생성합니다",
          category: "tab",
        })
      );
    });

    it("should return shortcuts with consistent structure", () => {
      const shortcuts = defaultShortcuts.getDefaultShortcuts();

      shortcuts.forEach((shortcut: Shortcut) => {
        expect(shortcut).toHaveProperty("id");
        expect(shortcut).toHaveProperty("keys");
        expect(shortcut).toHaveProperty("action");
        expect(shortcut).toHaveProperty("context");
        expect(shortcut).toHaveProperty("description");
        expect(shortcut).toHaveProperty("category");
        expect(shortcut).toHaveProperty("enabled");
        expect(shortcut).toHaveProperty("priority");

        expect(typeof shortcut.id).toBe("string");
        expect(typeof shortcut.keys).toBe("string");
        expect(typeof shortcut.action).toBe("string");
        expect(typeof shortcut.description).toBe("string");
        expect(typeof shortcut.category).toBe("string");
        expect(typeof shortcut.enabled).toBe("boolean");
        expect(typeof shortcut.priority).toBe("number");
      });
    });
  });

  describe("getShortcutsByCategory", () => {
    it("should return shortcuts filtered by category", () => {
      const fileShortcuts = defaultShortcuts.getShortcutsByCategory("file");
      const tabShortcuts = defaultShortcuts.getShortcutsByCategory("tab");

      expect(fileShortcuts.every((s: Shortcut) => s.category === "file")).toBe(
        true
      );
      expect(tabShortcuts.every((s: Shortcut) => s.category === "tab")).toBe(
        true
      );

      expect(fileShortcuts.length).toBeGreaterThan(0);
      expect(tabShortcuts.length).toBeGreaterThan(0);
    });

    it("should return empty array for non-existent category", () => {
      const nonExistentShortcuts =
        defaultShortcuts.getShortcutsByCategory("nonexistent");
      expect(nonExistentShortcuts).toEqual([]);
    });
  });

  describe("getShortcutsByContext", () => {
    it("should return shortcuts filtered by context", () => {
      const globalShortcuts = defaultShortcuts.getShortcutsByContext(
        ShortcutContext.GLOBAL
      );

      expect(
        globalShortcuts.every(
          (s: Shortcut) => s.context === ShortcutContext.GLOBAL
        )
      ).toBe(true);
      expect(globalShortcuts.length).toBeGreaterThan(0);
    });

    it("should return empty array for context with no shortcuts", () => {
      const modalShortcuts = defaultShortcuts.getShortcutsByContext(
        ShortcutContext.MODAL
      );
      expect(modalShortcuts).toEqual([]);
    });
  });
});
