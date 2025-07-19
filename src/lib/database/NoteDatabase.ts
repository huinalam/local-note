import Dexie, { type Table } from "dexie";
import type { Note, Setting } from "./types";

export class NoteDatabase extends Dexie {
  notes!: Table<Note>;
  settings!: Table<Setting>;

  constructor() {
    super("NoteDatabase");

    this.version(1).stores({
      notes: "id, title, content, *tags, createdAt, updatedAt",
      tabs: "id, noteId, position, isActive",
      settings: "key, value",
    });

    // 버전 2: order 필드 추가
    this.version(2).stores({
      notes: "id, title, content, *tags, createdAt, updatedAt, order",
      tabs: "id, noteId, position, isActive",
      settings: "key, value",
    });

    // 버전 3: 탭 테이블 제거 (메모 중심 설계로 변경)
    this.version(3).stores({
      notes: "id, title, content, *tags, createdAt, updatedAt, order",
      settings: "key, value",
    });
  }
}

// Export singleton instance
export const db = new NoteDatabase();
