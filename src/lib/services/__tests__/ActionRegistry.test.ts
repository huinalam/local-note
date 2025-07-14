import { describe, it, expect, beforeEach, vi } from "vitest";
import { ActionRegistry } from "../ActionRegistry";
import type { ShortcutAction } from "../../types/shortcut";

describe("ActionRegistry", () => {
  let registry: ActionRegistry;

  beforeEach(() => {
    registry = new ActionRegistry();
  });

  describe("register", () => {
    it("should register an action", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);
      expect(registry.get("test-action")).toEqual(action);
    });

    it("should throw error when registering duplicate action", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);
      expect(() => registry.register(action)).toThrow(
        'Action with id "test-action" already exists'
      );
    });

    it("should allow overwriting action with force flag", () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();

      const action1: ShortcutAction = {
        id: "test-action",
        name: "Test Action 1",
        description: "Test action 1 description",
        handler: mockHandler1,
      };

      const action2: ShortcutAction = {
        id: "test-action",
        name: "Test Action 2",
        description: "Test action 2 description",
        handler: mockHandler2,
      };

      registry.register(action1);
      registry.register(action2, true);
      expect(registry.get("test-action")).toEqual(action2);
    });
  });

  describe("unregister", () => {
    it("should unregister an action", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);
      registry.unregister("test-action");
      expect(registry.get("test-action")).toBeUndefined();
    });

    it("should return false when unregistering non-existent action", () => {
      const result = registry.unregister("non-existent");
      expect(result).toBe(false);
    });

    it("should return true when unregistering existing action", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);
      const result = registry.unregister("test-action");
      expect(result).toBe(true);
    });
  });

  describe("execute", () => {
    it("should execute action handler", async () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);

      const mockEvent = new KeyboardEvent("keydown", { key: "s" });
      const result = await registry.execute("test-action", mockEvent);

      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(mockEvent);
    });

    it("should return false when action not found", async () => {
      const mockEvent = new KeyboardEvent("keydown", { key: "s" });
      const result = await registry.execute("non-existent", mockEvent);

      expect(result).toBe(false);
    });

    it("should check canExecute before executing", async () => {
      const mockHandler = vi.fn();
      const mockCanExecute = vi.fn().mockReturnValue(false);

      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
        canExecute: mockCanExecute,
      };

      registry.register(action);

      const mockEvent = new KeyboardEvent("keydown", { key: "s" });
      const result = await registry.execute("test-action", mockEvent);

      expect(result).toBe(false);
      expect(mockCanExecute).toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("should execute when canExecute returns true", async () => {
      const mockHandler = vi.fn();
      const mockCanExecute = vi.fn().mockReturnValue(true);

      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
        canExecute: mockCanExecute,
      };

      registry.register(action);

      const mockEvent = new KeyboardEvent("keydown", { key: "s" });
      const result = await registry.execute("test-action", mockEvent);

      expect(result).toBe(true);
      expect(mockCanExecute).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle async action handlers", async () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined);
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);

      const mockEvent = new KeyboardEvent("keydown", { key: "s" });
      const result = await registry.execute("test-action", mockEvent);

      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle errors in action handlers", async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error("Test error"));
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);

      const mockEvent = new KeyboardEvent("keydown", { key: "s" });
      const result = await registry.execute("test-action", mockEvent);

      expect(result).toBe(false);
      expect(mockHandler).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe("canExecute", () => {
    it("should return true when action exists and has no canExecute function", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);
      expect(registry.canExecute("test-action")).toBe(true);
    });

    it("should return false when action does not exist", () => {
      expect(registry.canExecute("non-existent")).toBe(false);
    });

    it("should return result of canExecute function", () => {
      const mockHandler = vi.fn();
      const mockCanExecute = vi.fn().mockReturnValue(false);

      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
        canExecute: mockCanExecute,
      };

      registry.register(action);
      expect(registry.canExecute("test-action")).toBe(false);
      expect(mockCanExecute).toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should return all registered actions", () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();

      const action1: ShortcutAction = {
        id: "action1",
        name: "Action 1",
        description: "Action 1 description",
        handler: mockHandler1,
      };

      const action2: ShortcutAction = {
        id: "action2",
        name: "Action 2",
        description: "Action 2 description",
        handler: mockHandler2,
      };

      registry.register(action1);
      registry.register(action2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(action1);
      expect(all).toContain(action2);
    });

    it("should return empty array when no actions registered", () => {
      const all = registry.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should clear all actions", () => {
      const mockHandler = vi.fn();
      const action: ShortcutAction = {
        id: "test-action",
        name: "Test Action",
        description: "Test action description",
        handler: mockHandler,
      };

      registry.register(action);
      registry.clear();
      expect(registry.getAll()).toHaveLength(0);
    });
  });
});
