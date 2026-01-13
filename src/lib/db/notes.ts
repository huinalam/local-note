import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type NoteEditorType = "simplemde" | "monaco";

export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  editorType: NoteEditorType;
}

interface NotesDbSchema extends DBSchema {
  notes: {
    key: string;
    value: NoteRecord;
    indexes: {
      "by-updatedAt": string;
    };
  };
}

export class NotesDbError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "NotesDbError";
  }
}

export class NotesDbUnavailableError extends NotesDbError {
  constructor() {
    super("IndexedDB is not available in this environment.");
    this.name = "NotesDbUnavailableError";
  }
}

export class NoteNotFoundError extends NotesDbError {
  constructor(noteId: string) {
    super(`Note with id "${noteId}" was not found.`);
    this.name = "NoteNotFoundError";
  }
}

const DB_NAME = "local-note";
const DB_VERSION = 2;
const STORE_NAME = "notes" as const;
const UPDATED_AT_INDEX = "by-updatedAt" as const;

let dbPromise: Promise<IDBPDatabase<NotesDbSchema>> | null = null;

const ensureIndexedDbAvailable = () => {
  if (typeof indexedDB === "undefined") {
    throw new NotesDbUnavailableError();
  }
};

const getDb = () => {
  ensureIndexedDbAvailable();

  dbPromise ??= openDB<NotesDbSchema>(DB_NAME, DB_VERSION, {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async upgrade(db, oldVersion, _newVersion, transaction) {
      const store =
        oldVersion < 1 || !db.objectStoreNames.contains(STORE_NAME)
          ? db.createObjectStore(STORE_NAME, {
              keyPath: "id",
            })
          : transaction.objectStore(STORE_NAME);

      if (!store.indexNames.contains(UPDATED_AT_INDEX)) {
        store.createIndex(UPDATED_AT_INDEX, "updatedAt");
      }

      if (oldVersion < 2) {
        let cursor = await store.openCursor();
        while (cursor) {
          const value = cursor.value;
          if (!("editorType" in value) || !value.editorType) {
            value.editorType = "simplemde";
            await cursor.update(value);
          }
          cursor = await cursor.continue();
        }
      }
    },
  });

  return dbPromise;
};

const withDb = async <T>(
  fn: (db: IDBPDatabase<NotesDbSchema>) => Promise<T>,
) => {
  try {
    const db = await getDb();
    return await fn(db);
  } catch (error) {
    if (error instanceof NotesDbError) {
      throw error;
    }
    throw new NotesDbError("Failed to execute IndexedDB operation.", {
      cause: error,
    });
  }
};

const createTimestamp = () => new Date().toISOString();

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

export type CreateNoteInput = {
  title?: string;
  content?: string;
  editorType?: NoteEditorType;
};

export const createNote = async (
  input: CreateNoteInput = {},
): Promise<NoteRecord> => {
  const now = createTimestamp();
  const record: NoteRecord = {
    id: createId(),
    title: input.title?.trim() ?? "Untitled note",
    content: input.content ?? "",
    createdAt: now,
    updatedAt: now,
    editorType: input.editorType ?? "monaco",
  };

  await withDb((db) => db.add(STORE_NAME, record));
  return record;
};

export const getNote = async (id: string): Promise<NoteRecord> => {
  const note = await withDb((db) => db.get(STORE_NAME, id));
  if (!note) {
    throw new NoteNotFoundError(id);
  }
  return note;
};

export const listNotes = async (): Promise<NoteRecord[]> => {
  return withDb(async (db) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.store;
    const index = store.index(UPDATED_AT_INDEX);
    const notes: NoteRecord[] = [];

    let cursor = await index.openCursor(null, "prev");
    while (cursor) {
      notes.push(cursor.value);
      cursor = await cursor.continue();
    }

    await tx.done;
    return notes;
  });
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  editorType?: NoteEditorType;
};

export const updateNote = async (
  id: string,
  input: UpdateNoteInput,
): Promise<NoteRecord> => {
  return withDb(async (db) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.store;
    const existing = await store.get(id);

    if (!existing) {
      throw new NoteNotFoundError(id);
    }

    const updated: NoteRecord = {
      ...existing,
      title: input.title?.trim() ?? existing.title,
      content: input.content ?? existing.content,
      editorType: input.editorType ?? existing.editorType,
      updatedAt: createTimestamp(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  });
};

export const deleteNote = async (id: string): Promise<void> => {
  await withDb(async (db) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    await tx.store.delete(id);
    await tx.done;
  });
};

export const clearNotes = async (): Promise<void> => {
  await withDb(async (db) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    await tx.store.clear();
    await tx.done;
  });
};

export const seedWelcomeNote = async () => {
  const notes = await listNotes();
  if (notes.length > 0) {
    return notes[0]!;
  }

  return createNote({
    title: "Welcome to Local Note",
    content: [
      "# Welcome to Local Note",
      "",
      "This note lives entirely in your browser using IndexedDB.",
      "",
      "- Create additional notes using the New Note button.",
      "- Edits save automatically every second while you type.",
      "- All notes stay private to this device.",
    ].join("\n"),
  });
};
