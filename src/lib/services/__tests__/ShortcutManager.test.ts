import { describe, it, expect, beforeEach, vi } from "vitest";
import { ShortcutManager } from "../ShortcutManager";
import {
  ShortcutContext,
  type Shortcut,
  type ShortcutAction,
} from "../../types/shortcut";

describe("ShortcutManager", () => {
  let manager: ShortcutManager;

  beforeEach(() => {
    manager = new ShortcutManager();
  });

  describe("registerShortcut", () => {
    it("should register a shortcut", () => {
      const shortcut: Shortcut = {
        id: "test-shortcut",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      manager.registerShortcut(shortcut);
      expect(manager.getShortcut("test-shortcut")).toEqual(shortcut);
    });

    it("should throw error for duplicate shortcut registration", () => {
      const shortcut: Shortcut = {
        id: "test-shortcut",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      manager.registerShortcut(shortcut);
      expect(() => manager.registerShortcut(shortcut)).toThrow();
    });
  });

  describe("registerAction", () => {
    it("should register an action", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      manager.registerAction(action);
      expect(manager.getAction("test-action")).toEqual(action);
    });
  });

  describe("handleKeyEvent", () => {
    it("should handle key event and execute action", async () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "save",
        name: "Save",
        description: "Save note",
        handler: mockHandler,
      };

      const shortcut: Shortcut = {
        id: "save-shortcut",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      manager.registerAction(action);
      manager.registerShortcut(shortcut);

      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      const result = await manager.handleKeyEvent(event);
      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it("should return false when no matching shortcut found", async () => {
      const event = new KeyboardEvent("keydown", {
        key: "x",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      const result = await manager.handleKeyEvent(event);
      expect(result).toBe(false);
    });

    it("should return false when shortcut is disabled", async () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "save",
        name: "Save",
        description: "Save note",
        handler: mockHandler,
      };

      const shortcut: Shortcut = {
        id: "save-shortcut",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: false,
        priority: 10,
      };

      manager.registerAction(action);
      manager.registerShortcut(shortcut);

      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      const result = await manager.handleKeyEvent(event);
      expect(result).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should handle context-specific shortcuts", async () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "find",
        name: "Find",
        description: "Find text",
        handler: mockHandler,
      };

      const shortcut: Shortcut = {
        id: "find-shortcut",
        keys: "ctrl+f",
        action: "find",
        context: ShortcutContext.EDITOR,
        description: "Find text",
        category: "edit",
        enabled: true,
        priority: 10,
      };

      manager.registerAction(action);
      manager.registerShortcut(shortcut);
      manager.setContext(ShortcutContext.EDITOR);

      const event = new KeyboardEvent("keydown", {
        key: "f",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      const result = await manager.handleKeyEvent(event);
      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it("should not execute context-specific shortcut in wrong context", async () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "find",
        name: "Find",
        description: "Find text",
        handler: mockHandler,
      };

      const shortcut: Shortcut = {
        id: "find-shortcut",
        keys: "ctrl+f",
        action: "find",
        context: ShortcutContext.EDITOR,
        description: "Find text",
        category: "edit",
        enabled: true,
        priority: 10,
      };

      manager.registerAction(action);
      manager.registerShortcut(shortcut);
      manager.setContext(ShortcutContext.LIST);

      const event = new KeyboardEvent("keydown", {
        key: "f",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      const result = await manager.handleKeyEvent(event);
      expect(result).toBe(false);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("context management", () => {
    it("should set context", () => {
      manager.setContext(ShortcutContext.EDITOR);
      expect(manager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should push and pop context", () => {
      manager.setContext(ShortcutContext.EDITOR);
      manager.pushContext(ShortcutContext.MODAL);

      expect(manager.getCurrentContext()).toBe(ShortcutContext.MODAL);

      const popped = manager.popContext();
      expect(popped).toBe(ShortcutContext.MODAL);
      expect(manager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should not pop below global context", () => {
      const popped = manager.popContext();
      expect(popped).toBeUndefined();
      expect(manager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });
  });

  describe("getActiveShortcuts", () => {
    it("should return active shortcuts for current context", () => {
      const globalShortcut: Shortcut = {
        id: "global-shortcut",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      const editorShortcut: Shortcut = {
        id: "editor-shortcut",
        keys: "ctrl+f",
        action: "find",
        context: ShortcutContext.EDITOR,
        description: "Find text",
        category: "edit",
        enabled: true,
        priority: 10,
      };

      manager.registerShortcut(globalShortcut);
      manager.registerShortcut(editorShortcut);

      // Global context should include global shortcuts
      manager.setContext(ShortcutContext.GLOBAL);
      let activeShortcuts = manager.getActiveShortcuts();
      expect(activeShortcuts).toHaveLength(1);
      expect(activeShortcuts[0]).toEqual(globalShortcut);

      // Editor context should include both global and editor shortcuts
      manager.setContext(ShortcutContext.EDITOR);
      activeShortcuts = manager.getActiveShortcuts();
      expect(activeShortcuts).toHaveLength(2);
      expect(activeShortcuts).toContain(globalShortcut);
      expect(activeShortcuts).toContain(editorShortcut);
    });

    it("should sort shortcuts by priority", () => {
      const lowPriorityShortcut: Shortcut = {
        id: "low-priority",
        keys: "ctrl+l",
        action: "low",
        context: ShortcutContext.GLOBAL,
        description: "Low priority",
        category: "system",
        enabled: true,
        priority: 5,
      };

      const highPriorityShortcut: Shortcut = {
        id: "high-priority",
        keys: "ctrl+h",
        action: "high",
        context: ShortcutContext.GLOBAL,
        description: "High priority",
        category: "system",
        enabled: true,
        priority: 15,
      };

      manager.registerShortcut(lowPriorityShortcut);
      manager.registerShortcut(highPriorityShortcut);

      const activeShortcuts = manager.getActiveShortcuts();
      expect(activeShortcuts[0]).toEqual(highPriorityShortcut);
      expect(activeShortcuts[1]).toEqual(lowPriorityShortcut);
    });

    it("should filter out disabled shortcuts", () => {
      const enabledShortcut: Shortcut = {
        id: "enabled-shortcut",
        keys: "ctrl+e",
        action: "enabled",
        context: ShortcutContext.GLOBAL,
        description: "Enabled shortcut",
        category: "system",
        enabled: true,
        priority: 10,
      };

      const disabledShortcut: Shortcut = {
        id: "disabled-shortcut",
        keys: "ctrl+d",
        action: "disabled",
        context: ShortcutContext.GLOBAL,
        description: "Disabled shortcut",
        category: "system",
        enabled: false,
        priority: 10,
      };

      manager.registerShortcut(enabledShortcut);
      manager.registerShortcut(disabledShortcut);

      const activeShortcuts = manager.getActiveShortcuts();
      expect(activeShortcuts).toHaveLength(1);
      expect(activeShortcuts[0]).toEqual(enabledShortcut);
    });
  });

  describe("destroy", () => {
    it("should clean up resources", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      manager.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });
});
