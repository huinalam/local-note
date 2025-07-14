import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ShortcutConfigManager } from "../ShortcutConfigManager";
import {
  ShortcutContext,
  type Shortcut,
  type ShortcutConfig,
} from "../../types/shortcut";

// LocalStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ShortcutConfigManager", () => {
  let configManager: ShortcutConfigManager;
  let mockDefaultShortcuts: Shortcut[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockDefaultShortcuts = [
      {
        id: "default.file.new",
        keys: "ctrl+n",
        action: "file.new",
        context: ShortcutContext.GLOBAL,
        description: "새로운 메모를 생성합니다",
        category: "file",
        enabled: true,
        priority: 10,
      },
      {
        id: "default.file.save",
        keys: "ctrl+s",
        action: "file.save",
        context: ShortcutContext.GLOBAL,
        description: "현재 메모를 저장합니다",
        category: "file",
        enabled: true,
        priority: 10,
      },
    ];

    configManager = new ShortcutConfigManager();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("initialization", () => {
    it("should create ShortcutConfigManager instance", () => {
      expect(configManager).toBeInstanceOf(ShortcutConfigManager);
    });
  });

  describe("saveConfig", () => {
    it("should save shortcut configuration to localStorage", () => {
      const config: ShortcutConfig = {
        shortcuts: mockDefaultShortcuts,
        version: "1.0.0",
        lastModified: new Date(),
      };

      configManager.saveConfig(config);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "shortcut-config",
        JSON.stringify(config)
      );
    });

    it("should handle save errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const config: ShortcutConfig = {
        shortcuts: mockDefaultShortcuts,
        version: "1.0.0",
        lastModified: new Date(),
      };

      // 에러가 발생해도 예외가 던져지지 않아야 함
      expect(() => configManager.saveConfig(config)).not.toThrow();
    });
  });

  describe("loadConfig", () => {
    it("should load shortcut configuration from localStorage", () => {
      const config: ShortcutConfig = {
        shortcuts: mockDefaultShortcuts,
        version: "1.0.0",
        lastModified: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(config));

      const loadedConfig = configManager.loadConfig();

      expect(localStorageMock.getItem).toHaveBeenCalledWith("shortcut-config");
      expect(loadedConfig).toEqual(config);
    });

    it("should return null when no config exists", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const loadedConfig = configManager.loadConfig();

      expect(loadedConfig).toBeNull();
    });

    it("should return null when config is invalid JSON", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      const loadedConfig = configManager.loadConfig();

      expect(loadedConfig).toBeNull();
    });

    it("should handle load errors gracefully", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      const loadedConfig = configManager.loadConfig();

      expect(loadedConfig).toBeNull();
    });
  });

  describe("mergeWithDefaults", () => {
    it("should merge user config with default shortcuts", () => {
      const userShortcuts: Shortcut[] = [
        {
          id: "user.custom",
          keys: "ctrl+alt+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "커스텀 새 메모",
          category: "file",
          enabled: true,
          priority: 20,
        },
      ];

      const merged = configManager.mergeWithDefaults(
        mockDefaultShortcuts,
        userShortcuts
      );

      expect(merged).toHaveLength(3); // 2 default + 1 user
      expect(
        merged.find((s: Shortcut) => s.id === "user.custom")
      ).toBeDefined();
      expect(
        merged.find((s: Shortcut) => s.id === "default.file.new")
      ).toBeDefined();
    });

    it("should override default shortcuts with user shortcuts", () => {
      const userShortcuts: Shortcut[] = [
        {
          id: "default.file.new",
          keys: "ctrl+alt+n", // 다른 키 조합
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "수정된 새 메모",
          category: "file",
          enabled: true,
          priority: 20,
        },
      ];

      const merged = configManager.mergeWithDefaults(
        mockDefaultShortcuts,
        userShortcuts
      );

      expect(merged).toHaveLength(2); // 1 overridden + 1 default
      const overriddenShortcut = merged.find(
        (s: Shortcut) => s.id === "default.file.new"
      );
      expect(overriddenShortcut?.keys).toBe("ctrl+alt+n");
      expect(overriddenShortcut?.description).toBe("수정된 새 메모");
    });

    it("should handle empty user shortcuts", () => {
      const merged = configManager.mergeWithDefaults(mockDefaultShortcuts, []);

      expect(merged).toEqual(mockDefaultShortcuts);
    });

    it("should handle empty default shortcuts", () => {
      const userShortcuts: Shortcut[] = [
        {
          id: "user.custom",
          keys: "ctrl+alt+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "커스텀 새 메모",
          category: "file",
          enabled: true,
          priority: 20,
        },
      ];

      const merged = configManager.mergeWithDefaults([], userShortcuts);

      expect(merged).toEqual(userShortcuts);
    });
  });

  describe("validateConfig", () => {
    it("should validate correct shortcut configuration", () => {
      const config: ShortcutConfig = {
        shortcuts: mockDefaultShortcuts,
        version: "1.0.0",
        lastModified: new Date(),
      };

      const isValid = configManager.validateConfig(config);

      expect(isValid).toBe(true);
    });

    it("should reject config without shortcuts array", () => {
      const config = {
        version: "1.0.0",
        lastModified: new Date(),
      } as any;

      const isValid = configManager.validateConfig(config);

      expect(isValid).toBe(false);
    });

    it("should reject config without version", () => {
      const config = {
        shortcuts: mockDefaultShortcuts,
        lastModified: new Date(),
      } as any;

      const isValid = configManager.validateConfig(config);

      expect(isValid).toBe(false);
    });

    it("should reject config with invalid shortcuts", () => {
      const config: ShortcutConfig = {
        shortcuts: [
          {
            id: "invalid",
            keys: "", // 빈 키 조합
            action: "file.new",
            context: ShortcutContext.GLOBAL,
            description: "잘못된 단축키",
            category: "file",
            enabled: true,
            priority: 10,
          },
        ],
        version: "1.0.0",
        lastModified: new Date(),
      };

      const isValid = configManager.validateConfig(config);

      expect(isValid).toBe(false);
    });
  });

  describe("detectConflicts", () => {
    it("should detect key combination conflicts", () => {
      const shortcuts: Shortcut[] = [
        {
          id: "shortcut1",
          keys: "ctrl+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "새 메모 1",
          category: "file",
          enabled: true,
          priority: 10,
        },
        {
          id: "shortcut2",
          keys: "ctrl+n", // 동일한 키 조합
          action: "file.save",
          context: ShortcutContext.GLOBAL,
          description: "저장",
          category: "file",
          enabled: true,
          priority: 10,
        },
      ];

      const conflicts = configManager.detectConflicts(shortcuts);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].keyCombo).toBe("ctrl+n");
      expect(conflicts[0].shortcuts).toHaveLength(2);
      expect(conflicts[0].shortcuts.map((s: Shortcut) => s.id)).toEqual([
        "shortcut1",
        "shortcut2",
      ]);
    });

    it("should not detect conflicts in different contexts", () => {
      const shortcuts: Shortcut[] = [
        {
          id: "shortcut1",
          keys: "ctrl+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "새 메모",
          category: "file",
          enabled: true,
          priority: 10,
        },
        {
          id: "shortcut2",
          keys: "ctrl+n",
          action: "editor.new",
          context: ShortcutContext.EDITOR, // 다른 컨텍스트
          description: "에디터에서 새 메모",
          category: "editor",
          enabled: true,
          priority: 10,
        },
      ];

      const conflicts = configManager.detectConflicts(shortcuts);

      expect(conflicts).toHaveLength(0);
    });

    it("should ignore disabled shortcuts in conflict detection", () => {
      const shortcuts: Shortcut[] = [
        {
          id: "shortcut1",
          keys: "ctrl+n",
          action: "file.new",
          context: ShortcutContext.GLOBAL,
          description: "새 메모",
          category: "file",
          enabled: true,
          priority: 10,
        },
        {
          id: "shortcut2",
          keys: "ctrl+n",
          action: "file.save",
          context: ShortcutContext.GLOBAL,
          description: "저장",
          category: "file",
          enabled: false, // 비활성화됨
          priority: 10,
        },
      ];

      const conflicts = configManager.detectConflicts(shortcuts);

      expect(conflicts).toHaveLength(0);
    });

    it("should return empty array when no conflicts exist", () => {
      const conflicts = configManager.detectConflicts(mockDefaultShortcuts);

      expect(conflicts).toHaveLength(0);
    });
  });

  describe("resetToDefaults", () => {
    it("should reset configuration to defaults", () => {
      configManager.resetToDefaults(mockDefaultShortcuts);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "shortcut-config"
      );
    });

    it("should handle reset errors gracefully", () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      expect(() =>
        configManager.resetToDefaults(mockDefaultShortcuts)
      ).not.toThrow();
    });
  });
});
