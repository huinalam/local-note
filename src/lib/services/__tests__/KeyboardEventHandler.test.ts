import { describe, it, expect, beforeEach } from "vitest";
import { KeyboardEventHandler } from "../KeyboardEventHandler";
import type { KeyCombo } from "../../types/shortcut";

describe("KeyboardEventHandler", () => {
  let handler: KeyboardEventHandler;

  beforeEach(() => {
    handler = new KeyboardEventHandler();
  });

  describe("normalizeKey", () => {
    it("should normalize key names correctly", () => {
      const event = new KeyboardEvent("keydown", { key: "Control" });
      const normalized = handler.normalizeKey(event);
      expect(normalized).toBe("control");
    });

    it("should handle special keys", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      const normalized = handler.normalizeKey(event);
      expect(normalized).toBe("arrowleft");
    });

    it("should handle regular keys", () => {
      const event = new KeyboardEvent("keydown", { key: "s" });
      const normalized = handler.normalizeKey(event);
      expect(normalized).toBe("s");
    });
  });

  describe("parseKeyCombo", () => {
    it("should parse simple key combo", () => {
      const combo = handler.parseKeyCombo("ctrl+s");
      expect(combo).toEqual({
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
        key: "s",
      });
    });

    it("should parse complex key combo", () => {
      const combo = handler.parseKeyCombo("ctrl+shift+alt+n");
      expect(combo).toEqual({
        ctrl: true,
        alt: true,
        shift: true,
        meta: false,
        key: "n",
      });
    });

    it("should handle single key", () => {
      const combo = handler.parseKeyCombo("escape");
      expect(combo).toEqual({
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
        key: "escape",
      });
    });

    it("should handle meta key", () => {
      const combo = handler.parseKeyCombo("meta+space");
      expect(combo).toEqual({
        ctrl: false,
        alt: false,
        shift: false,
        meta: true,
        key: "space",
      });
    });
  });

  describe("matchesCombo", () => {
    it("should match exact key combination", () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
      const combo: KeyCombo = {
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
        key: "s",
      };

      expect(handler.matchesCombo(event, combo)).toBe(true);
    });

    it("should not match when modifier keys differ", () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
      const combo: KeyCombo = {
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
        key: "s",
      };

      expect(handler.matchesCombo(event, combo)).toBe(false);
    });

    it("should not match when key differs", () => {
      const event = new KeyboardEvent("keydown", {
        key: "a",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });
      const combo: KeyCombo = {
        ctrl: true,
        alt: false,
        shift: false,
        meta: false,
        key: "s",
      };

      expect(handler.matchesCombo(event, combo)).toBe(false);
    });

    it("should match complex combination", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      });
      const combo: KeyCombo = {
        ctrl: true,
        alt: false,
        shift: true,
        meta: false,
        key: "tab",
      };

      expect(handler.matchesCombo(event, combo)).toBe(true);
    });
  });

  describe("eventToKeyString", () => {
    it("should convert event to key string", () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      expect(handler.eventToKeyString(event)).toBe("ctrl+s");
    });

    it("should handle multiple modifiers", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        ctrlKey: true,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      });

      expect(handler.eventToKeyString(event)).toBe("ctrl+shift+tab");
    });

    it("should handle no modifiers", () => {
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      expect(handler.eventToKeyString(event)).toBe("escape");
    });
  });
});
