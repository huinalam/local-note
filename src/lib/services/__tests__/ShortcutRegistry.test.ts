import { describe, it, expect, beforeEach } from "vitest";
import { ShortcutRegistry } from "../ShortcutRegistry";
import { ShortcutContext, type Shortcut } from "../../types/shortcut";

describe("ShortcutRegistry", () => {
  let registry: ShortcutRegistry;

  beforeEach(() => {
    registry = new ShortcutRegistry();
  });

  describe("register", () => {
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

      registry.register(shortcut);
      expect(registry.get("test-shortcut")).toEqual(shortcut);
    });

    it("should throw error when registering duplicate shortcut", () => {
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

      registry.register(shortcut);
      expect(() => registry.register(shortcut)).toThrow(
        'Shortcut with id "test-shortcut" already exists'
      );
    });

    it("should allow overwriting shortcut with force flag", () => {
      const shortcut1: Shortcut = {
        id: "test-shortcut",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      const shortcut2: Shortcut = {
        id: "test-shortcut",
        keys: "ctrl+shift+s",
        action: "saveAs",
        context: ShortcutContext.GLOBAL,
        description: "Save as",
        category: "file",
        enabled: true,
        priority: 9,
      };

      registry.register(shortcut1);
      registry.register(shortcut2, true);
      expect(registry.get("test-shortcut")).toEqual(shortcut2);
    });
  });

  describe("unregister", () => {
    it("should unregister a shortcut", () => {
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

      registry.register(shortcut);
      registry.unregister("test-shortcut");
      expect(registry.get("test-shortcut")).toBeUndefined();
    });

    it("should return false when unregistering non-existent shortcut", () => {
      const result = registry.unregister("non-existent");
      expect(result).toBe(false);
    });

    it("should return true when unregistering existing shortcut", () => {
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

      registry.register(shortcut);
      const result = registry.unregister("test-shortcut");
      expect(result).toBe(true);
    });
  });

  describe("getAll", () => {
    it("should return all registered shortcuts", () => {
      const shortcut1: Shortcut = {
        id: "shortcut1",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.GLOBAL,
        description: "Save note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      const shortcut2: Shortcut = {
        id: "shortcut2",
        keys: "ctrl+n",
        action: "new",
        context: ShortcutContext.GLOBAL,
        description: "New note",
        category: "file",
        enabled: true,
        priority: 10,
      };

      registry.register(shortcut1);
      registry.register(shortcut2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(shortcut1);
      expect(all).toContain(shortcut2);
    });

    it("should return empty array when no shortcuts registered", () => {
      const all = registry.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe("getByKeys", () => {
    it("should find shortcut by key combination", () => {
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

      registry.register(shortcut);
      const found = registry.getByKeys("ctrl+s");
      expect(found).toEqual(shortcut);
    });

    it("should return undefined when shortcut not found", () => {
      const found = registry.getByKeys("ctrl+x");
      expect(found).toBeUndefined();
    });
  });

  describe("getByContext", () => {
    it("should filter shortcuts by context", () => {
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

      registry.register(globalShortcut);
      registry.register(editorShortcut);

      const globalShortcuts = registry.getByContext(ShortcutContext.GLOBAL);
      expect(globalShortcuts).toHaveLength(1);
      expect(globalShortcuts[0]).toEqual(globalShortcut);

      const editorShortcuts = registry.getByContext(ShortcutContext.EDITOR);
      expect(editorShortcuts).toHaveLength(1);
      expect(editorShortcuts[0]).toEqual(editorShortcut);
    });

    it("should return empty array when no shortcuts match context", () => {
      const shortcuts = registry.getByContext(ShortcutContext.MODAL);
      expect(shortcuts).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should clear all shortcuts", () => {
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

      registry.register(shortcut);
      registry.clear();
      expect(registry.getAll()).toHaveLength(0);
    });
  });
});
