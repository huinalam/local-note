import { describe, it, expect, vi, beforeEach } from "vitest";
import { createShortcutHelpActions } from "../shortcutHelpActions";

describe("shortcutHelpActions", () => {
  let mockOpenHelp: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOpenHelp = vi.fn();
  });

  describe("createShortcutHelpActions", () => {
    it("should create openShortcutHelp action", () => {
      const actions = createShortcutHelpActions(mockOpenHelp);

      expect(actions.openShortcutHelp).toBeDefined();
      expect(actions.openShortcutHelp.id).toBe("help.openShortcutHelp");
      expect(actions.openShortcutHelp.name).toBe("단축키 도움말 열기");
      expect(actions.openShortcutHelp.description).toBe(
        "단축키 도움말 모달을 엽니다"
      );
    });

    it("should execute openHelp callback when action is triggered", async () => {
      const actions = createShortcutHelpActions(mockOpenHelp);
      const mockEvent = new KeyboardEvent("keydown", { key: "F1" });

      await actions.openShortcutHelp.handler(mockEvent);

      expect(mockOpenHelp).toHaveBeenCalledTimes(1);
    });

    it("should prevent default and stop propagation", async () => {
      const actions = createShortcutHelpActions(mockOpenHelp);
      const mockEvent = new KeyboardEvent("keydown", { key: "F1" });

      const preventDefaultSpy = vi.spyOn(mockEvent, "preventDefault");
      const stopPropagationSpy = vi.spyOn(mockEvent, "stopPropagation");

      await actions.openShortcutHelp.handler(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const mockOpenHelpWithError = vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      const actions = createShortcutHelpActions(mockOpenHelpWithError);
      const mockEvent = new KeyboardEvent("keydown", { key: "F1" });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        actions.openShortcutHelp.handler(mockEvent)
      ).resolves.not.toThrow();

      expect(mockOpenHelpWithError).toHaveBeenCalledTimes(1);
    });

    it("should always be executable", () => {
      const actions = createShortcutHelpActions(mockOpenHelp);

      if (actions.openShortcutHelp.canExecute) {
        expect(actions.openShortcutHelp.canExecute()).toBe(true);
      } else {
        // canExecute가 undefined면 항상 실행 가능한 것으로 간주
        expect(actions.openShortcutHelp.canExecute).toBeUndefined();
      }
    });
  });

  describe("edge cases", () => {
    it("should handle null/undefined callback", async () => {
      const actions = createShortcutHelpActions(null as any);
      const mockEvent = new KeyboardEvent("keydown", { key: "F1" });

      // null callback이어도 에러가 발생하지 않아야 함
      await expect(
        actions.openShortcutHelp.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });
});
