const isBrowser = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const logStorageError = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error);
  }
};

export const storage = {
  read(key: string): string | null {
    if (!isBrowser()) {
      return null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      logStorageError(
        `Failed to read settings value for key "${key}" from localStorage`,
        error,
      );
      return null;
    }
  },
  write(key: string, value: string): boolean {
    if (!isBrowser()) {
      return false;
    }
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logStorageError(
        `Failed to write settings value for key "${key}" to localStorage`,
        error,
      );
      return false;
    }
  },
  remove(key: string): boolean {
    if (!isBrowser()) {
      return false;
    }
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      logStorageError(
        `Failed to remove settings value for key "${key}" from localStorage`,
        error,
      );
      return false;
    }
  },
  readJSON<T>(key: string): T | null {
    const raw = this.read(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      logStorageError(
        `Failed to parse settings value for key "${key}" stored in localStorage`,
        error,
      );
      return null;
    }
  },
  writeJSON<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.write(key, serialized);
    } catch (error) {
      logStorageError(
        `Failed to serialise settings value for key "${key}" before writing to localStorage`,
        error,
      );
      return false;
    }
  },
};
