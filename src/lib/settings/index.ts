import { storage } from "./storage";

const SETTINGS_NAMESPACE = "local-note:settings.";

const SETTINGS_KEY_MAP = {
  sidebarCollapsed: `${SETTINGS_NAMESPACE}sidebarCollapsed`,
} as const;

type SettingsValues = {
  sidebarCollapsed: boolean;
};

export type SettingsKey = keyof SettingsValues;

type SettingsValue<K extends SettingsKey> = SettingsValues[K];

export const getSetting = <K extends SettingsKey>(
  key: K,
): SettingsValue<K> | null =>
  storage.readJSON<SettingsValue<K>>(SETTINGS_KEY_MAP[key]) ?? null;

export const setSetting = <K extends SettingsKey>(
  key: K,
  value: SettingsValue<K>,
): boolean => storage.writeJSON(SETTINGS_KEY_MAP[key], value);

export const removeSetting = (key: SettingsKey): boolean =>
  storage.remove(SETTINGS_KEY_MAP[key]);
