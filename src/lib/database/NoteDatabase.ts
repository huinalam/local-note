import Dexie, { type Table } from "dexie";
import type { Note, Tab, Setting } from "./types";

export class NoteDatabase extends Dexie {
  notes!: Table<Note>;
  tabs!: Table<Tab>;
  settings!: Table<Setting>;

  constructor() {
    super("NoteDatabase");

    this.version(1).stores({
      notes: "id, title, content, *tags, createdAt, updatedAt",
      tabs: "id, noteId, position, isActive",
      settings: "key, value",
    });
  }
}

// Export singleton instance
export const db = new NoteDatabase();
