import { describe, it, expect, beforeEach, vi } from "vitest";
import { ContextManager } from "../ContextManager";
import { ShortcutContext } from "../../types/shortcut";
import type { Shortcut } from "../../types/shortcut";

describe("ContextManager", () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  describe("basic context management", () => {
    it("should start with GLOBAL context", () => {
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });

    it("should set context correctly", () => {
      contextManager.setContext(ShortcutContext.EDITOR);
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should maintain context stack", () => {
      contextManager.setContext(ShortcutContext.EDITOR);
      contextManager.pushContext(ShortcutContext.MODAL);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.MODAL);

      const popped = contextManager.popContext();
      expect(popped).toBe(ShortcutContext.MODAL);
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });
  });

  describe("context stack operations", () => {
    it("should push context to stack", () => {
      contextManager.setContext(ShortcutContext.EDITOR);
      contextManager.pushContext(ShortcutContext.MODAL);
      contextManager.pushContext(ShortcutContext.LIST);

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.LIST);
    });

    it("should pop context from stack", () => {
      contextManager.setContext(ShortcutContext.EDITOR);
      contextManager.pushContext(ShortcutContext.MODAL);

      const popped = contextManager.popContext();
      expect(popped).toBe(ShortcutContext.MODAL);
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.EDITOR);
    });

    it("should return undefined when popping from empty stack", () => {
      // Only GLOBAL context in stack
      const popped = contextManager.popContext();
      expect(popped).toBeUndefined();
      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });

    it("should never pop GLOBAL context", () => {
      contextManager.popContext();
      contextManager.popContext();

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
    });
  });

  describe("active shortcuts filtering", () => {
    const mockShortcuts: Shortcut[] = [
      {
        id: "global1",
        keys: "ctrl+n",
        action: "newNote",
        context: ShortcutContext.GLOBAL,
        description: "New note",
        category: "file",
        enabled: true,
        priority: 10,
      },
      {
        id: "editor1",
        keys: "ctrl+s",
        action: "save",
        context: ShortcutContext.EDITOR,
        description: "Save",
        category: "file",
        enabled: true,
        priority: 10,
      },
      {
        id: "editor2",
        keys: "ctrl+z",
        action: "undo",
        context: ShortcutContext.EDITOR,
        description: "Undo",
        category: "edit",
        enabled: true,
        priority: 9,
      },
      {
        id: "list1",
        keys: "enter",
        action: "openNote",
        context: ShortcutContext.LIST,
        description: "Open note",
        category: "navigation",
        enabled: true,
        priority: 8,
      },
      {
        id: "modal1",
        keys: "escape",
        action: "closeModal",
        context: ShortcutContext.MODAL,
        description: "Close modal",
        category: "navigation",
        enabled: true,
        priority: 10,
      },
    ];

    it("should return global shortcuts in GLOBAL context", () => {
      contextManager.setContext(ShortcutContext.GLOBAL);

      const active = contextManager.getActiveShortcuts(mockShortcuts);
      const ids = active.map((s) => s.id);

      expect(ids).toContain("global1");
      expect(ids).not.toContain("editor1");
      expect(ids).not.toContain("list1");
      expect(ids).not.toContain("modal1");
    });

    it("should return global and editor shortcuts in EDITOR context", () => {
      contextManager.setContext(ShortcutContext.EDITOR);

      const active = contextManager.getActiveShortcuts(mockShortcuts);
      const ids = active.map((s) => s.id);

      expect(ids).toContain("global1");
      expect(ids).toContain("editor1");
      expect(ids).toContain("editor2");
      expect(ids).not.toContain("list1");
      expect(ids).not.toContain("modal1");
    });

    it("should return global and list shortcuts in LIST context", () => {
      contextManager.setContext(ShortcutContext.LIST);

      const active = contextManager.getActiveShortcuts(mockShortcuts);
      const ids = active.map((s) => s.id);

      expect(ids).toContain("global1");
      expect(ids).toContain("list1");
      expect(ids).not.toContain("editor1");
      expect(ids).not.toContain("modal1");
    });

    it("should return global and modal shortcuts in MODAL context", () => {
      contextManager.setContext(ShortcutContext.MODAL);

      const active = contextManager.getActiveShortcuts(mockShortcuts);
      const ids = active.map((s) => s.id);

      expect(ids).toContain("global1");
      expect(ids).toContain("modal1");
      expect(ids).not.toContain("editor1");
      expect(ids).not.toContain("list1");
    });

    it("should sort shortcuts by priority (highest first)", () => {
      contextManager.setContext(ShortcutContext.EDITOR);

      const active = contextManager.getActiveShortcuts(mockShortcuts);

      // Should be sorted by priority: global1(10), editor1(10), editor2(9)
      expect(active[0].priority).toBeGreaterThanOrEqual(active[1].priority);
      expect(active[1].priority).toBeGreaterThanOrEqual(active[2].priority);
    });

    it("should filter out disabled shortcuts", () => {
      const shortcutsWithDisabled = [
        ...mockShortcuts,
        {
          id: "disabled1",
          keys: "ctrl+d",
          action: "disabled",
          context: ShortcutContext.GLOBAL,
          description: "Disabled",
          category: "test",
          enabled: false,
          priority: 10,
        },
      ];

      contextManager.setContext(ShortcutContext.GLOBAL);

      const active = contextManager.getActiveShortcuts(shortcutsWithDisabled);
      const ids = active.map((s) => s.id);

      expect(ids).not.toContain("disabled1");
    });
  });

  describe("context events", () => {
    it("should emit context change events", () => {
      const mockCallback = vi.fn();
      contextManager.onContextChange(mockCallback);

      contextManager.setContext(ShortcutContext.EDITOR);

      expect(mockCallback).toHaveBeenCalledWith(
        ShortcutContext.EDITOR,
        ShortcutContext.GLOBAL
      );
    });

    it("should emit context push events", () => {
      const mockCallback = vi.fn();
      contextManager.onContextChange(mockCallback);

      contextManager.pushContext(ShortcutContext.MODAL);

      expect(mockCallback).toHaveBeenCalledWith(
        ShortcutContext.MODAL,
        ShortcutContext.GLOBAL
      );
    });

    it("should emit context pop events", () => {
      const mockCallback = vi.fn();
      contextManager.onContextChange(mockCallback);

      contextManager.pushContext(ShortcutContext.MODAL);
      contextManager.popContext();

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenLastCalledWith(
        ShortcutContext.GLOBAL,
        ShortcutContext.MODAL
      );
    });

    it("should remove event listeners", () => {
      const mockCallback = vi.fn();
      const unsubscribe = contextManager.onContextChange(mockCallback);

      unsubscribe();
      contextManager.setContext(ShortcutContext.EDITOR);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("context utilities", () => {
    it("should check if context is active", () => {
      contextManager.setContext(ShortcutContext.EDITOR);

      expect(contextManager.isContextActive(ShortcutContext.EDITOR)).toBe(true);
      expect(contextManager.isContextActive(ShortcutContext.GLOBAL)).toBe(true); // Always active
      expect(contextManager.isContextActive(ShortcutContext.LIST)).toBe(false);
    });

    it("should get context stack", () => {
      contextManager.setContext(ShortcutContext.EDITOR);
      contextManager.pushContext(ShortcutContext.MODAL);

      const stack = contextManager.getContextStack();
      expect(stack).toEqual([
        ShortcutContext.GLOBAL,
        ShortcutContext.EDITOR,
        ShortcutContext.MODAL,
      ]);
    });

    it("should reset to initial state", () => {
      contextManager.setContext(ShortcutContext.EDITOR);
      contextManager.pushContext(ShortcutContext.MODAL);

      contextManager.reset();

      expect(contextManager.getCurrentContext()).toBe(ShortcutContext.GLOBAL);
      expect(contextManager.getContextStack()).toEqual([
        ShortcutContext.GLOBAL,
      ]);
    });
  });
});
