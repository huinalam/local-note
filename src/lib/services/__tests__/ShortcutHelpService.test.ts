import { describe, it, expect, beforeEach, vi } from "vitest";
import { ShortcutHelpService } from "../ShortcutHelpService";
import { ShortcutManager } from "../ShortcutManager";
import {
  HelpShortcutCategory,
  type Shortcut,
  type EditorShortcut,
  ShortcutContext,
} from "../../types/shortcut";

describe("ShortcutHelpService", () => {
  let helpService: ShortcutHelpService;
  let mockShortcutManager: ShortcutManager;

  const mockShortcuts: Shortcut[] = [
    {
      id: "file.new",
      keys: "ctrl+n",
      action: "file.new",
      context: ShortcutContext.GLOBAL,
      description: "새로운 메모를 생성합니다",
      category: "file",
      enabled: true,
      priority: 10,
    },
    {
      id: "search.open",
      keys: "ctrl+e",
      action: "search.open",
      context: ShortcutContext.GLOBAL,
      description: "메모 검색을 엽니다",
      category: "search",
      enabled: true,
      priority: 10,
    },
  ];

  const mockEditorShortcuts: EditorShortcut[] = [
    {
      id: "editor.bold",
      keys: "Cmd-B",
      action: "toggleBold",
      description: "텍스트를 굵게 만듭니다",
      category: HelpShortcutCategory.EDITOR,
    },
    {
      id: "editor.italic",
      keys: "Cmd-I",
      action: "toggleItalic",
      description: "텍스트를 기울임체로 만듭니다",
      category: HelpShortcutCategory.EDITOR,
    },
  ];

  beforeEach(() => {
    mockShortcutManager = {
      getAllShortcuts: vi.fn().mockReturnValue(mockShortcuts),
    } as any;

    helpService = new ShortcutHelpService(mockShortcutManager);
  });

  describe("getShortcutsByCategory", () => {
    it("should group application shortcuts by category", () => {
      const result = helpService.getShortcutsByCategory();

      expect(result).toHaveLength(2);
      expect(
        result.find((group) => group.category === HelpShortcutCategory.FILE)
          ?.shortcuts
      ).toHaveLength(1);
      expect(
        result.find((group) => group.category === HelpShortcutCategory.SEARCH)
          ?.shortcuts
      ).toHaveLength(1);
    });

    it("should include editor shortcuts when provided", () => {
      const result = helpService.getShortcutsByCategory(mockEditorShortcuts);

      const editorGroup = result.find(
        (group) => group.category === HelpShortcutCategory.EDITOR
      );
      expect(editorGroup?.shortcuts).toHaveLength(2);
    });

    it("should sort categories in predefined order", () => {
      const result = helpService.getShortcutsByCategory(mockEditorShortcuts);

      const categoryOrder = result.map((group) => group.category);
      expect(categoryOrder.indexOf(HelpShortcutCategory.FILE)).toBeLessThan(
        categoryOrder.indexOf(HelpShortcutCategory.SEARCH)
      );
    });
  });

  describe("formatKeyCombo", () => {
    it("should format key combo for Mac platform", () => {
      const result = helpService.formatKeyCombo("cmd+b", "mac");

      expect(result.display).toBe("⌘B");
      expect(result.platform).toBe("mac");
    });

    it("should format key combo for Windows platform", () => {
      const result = helpService.formatKeyCombo("ctrl+b", "windows");

      expect(result.display).toBe("Ctrl+B");
      expect(result.platform).toBe("windows");
    });

    it("should convert EasyMDE format to standard format", () => {
      const result = helpService.formatKeyCombo("Cmd-B", "mac");

      expect(result.display).toBe("⌘B");
    });

    it("should handle complex key combinations", () => {
      const result = helpService.formatKeyCombo("ctrl+shift+s", "windows");

      expect(result.display).toBe("Ctrl+Shift+S");
    });
  });

  describe("convertEasyMDEShortcuts", () => {
    it("should convert EasyMDE shortcuts format to EditorShortcut format", () => {
      const easyMDEConfig = {
        toggleBold: "Cmd-B",
        toggleItalic: "Cmd-I",
        drawLink: "Cmd-K",
      };

      const result = helpService.convertEasyMDEShortcuts(easyMDEConfig);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: "editor.toggleBold",
        keys: "Cmd-B",
        action: "toggleBold",
        category: HelpShortcutCategory.EDITOR,
      });
    });

    it("should provide appropriate descriptions for known actions", () => {
      const easyMDEConfig = {
        toggleBold: "Cmd-B",
      };

      const result = helpService.convertEasyMDEShortcuts(easyMDEConfig);

      expect(result[0].description).toContain("굵게");
    });
  });

  describe("detectPlatform", () => {
    it("should detect Mac platform", () => {
      Object.defineProperty(navigator, "platform", {
        value: "MacIntel",
        configurable: true,
      });

      const platform = helpService.detectPlatform();
      expect(platform).toBe("mac");
    });

    it("should detect Windows platform", () => {
      Object.defineProperty(navigator, "platform", {
        value: "Win32",
        configurable: true,
      });

      const platform = helpService.detectPlatform();
      expect(platform).toBe("windows");
    });

    it("should default to Linux for unknown platforms", () => {
      Object.defineProperty(navigator, "platform", {
        value: "Unknown",
        configurable: true,
      });

      const platform = helpService.detectPlatform();
      expect(platform).toBe("linux");
    });
  });

  describe("mapCategoryFromString", () => {
    it("should map known category strings to HelpShortcutCategory", () => {
      expect(helpService.mapCategoryFromString("file")).toBe(
        HelpShortcutCategory.FILE
      );
      expect(helpService.mapCategoryFromString("search")).toBe(
        HelpShortcutCategory.SEARCH
      );
      expect(helpService.mapCategoryFromString("delete")).toBe(
        HelpShortcutCategory.DELETE
      );
    });

    it("should default to EDITING for unknown categories", () => {
      expect(helpService.mapCategoryFromString("unknown")).toBe(
        HelpShortcutCategory.EDITING
      );
    });
  });
});
