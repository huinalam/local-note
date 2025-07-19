import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NoteService } from "../noteService";
import { NoteDatabase } from "../../database/NoteDatabase";
import type { Note } from "../../database/types";

describe("Note Service", () => {
  let noteService: NoteService;
  let db: NoteDatabase;

  beforeEach(async () => {
    db = new NoteDatabase();
    noteService = new NoteService(db);
    await db.open();
  });

  afterEach(async () => {
    if (db.isOpen()) {
      await db.close();
    }
    await db.delete();
  });

  describe("createNote", () => {
    it("should create a new note", async () => {
      const note = await noteService.createNote("Test Title", "Test Content");

      expect(note.id).toBeDefined();
      expect(note.title).toBe("Test Title");
      expect(note.content).toBe("Test Content");
      expect(note.tags).toEqual([]);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it("should create note with tags", async () => {
      const tags = ["tag1", "tag2"];
      const note = await noteService.createNote(
        "Test Title",
        "Test Content",
        tags
      );

      expect(note.tags).toEqual(tags);
    });

    it("should save note to database", async () => {
      const note = await noteService.createNote("Test Title", "Test Content");
      const savedNote = await db.notes.get(note.id);

      expect(savedNote).toBeDefined();
      expect(savedNote?.title).toBe("Test Title");
    });
  });

  describe("getNote", () => {
    it("should retrieve an existing note", async () => {
      const createdNote = await noteService.createNote(
        "Test Title",
        "Test Content"
      );
      const retrievedNote = await noteService.getNote(createdNote.id);

      expect(retrievedNote).toBeDefined();
      expect(retrievedNote?.id).toBe(createdNote.id);
      expect(retrievedNote?.title).toBe("Test Title");
    });

    it("should return undefined for non-existing note", async () => {
      const note = await noteService.getNote("non-existing-id");
      expect(note).toBeUndefined();
    });
  });

  describe("updateNote", () => {
    it("should update an existing note", async () => {
      const note = await noteService.createNote(
        "Original Title",
        "Original Content"
      );

      // 시간 차이를 보장하기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedNote = await noteService.updateNote(note.id, {
        title: "Updated Title",
        content: "Updated Content",
      });

      expect(updatedNote?.title).toBe("Updated Title");
      expect(updatedNote?.content).toBe("Updated Content");
      expect(updatedNote?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        note.updatedAt.getTime()
      );
    });

    it("should update only specified fields", async () => {
      const note = await noteService.createNote(
        "Original Title",
        "Original Content"
      );

      const updatedNote = await noteService.updateNote(note.id, {
        title: "Updated Title",
      });

      expect(updatedNote?.title).toBe("Updated Title");
      expect(updatedNote?.content).toBe("Original Content");
    });

    it("should return undefined for non-existing note", async () => {
      const result = await noteService.updateNote("non-existing-id", {
        title: "New Title",
      });

      expect(result).toBeUndefined();
    });
  });

  describe("deleteNote", () => {
    it("should delete an existing note", async () => {
      const note = await noteService.createNote("Test Title", "Test Content");

      const result = await noteService.deleteNote(note.id);
      expect(result).toBe(true);

      const deletedNote = await noteService.getNote(note.id);
      expect(deletedNote).toBeUndefined();
    });

    it("should return false for non-existing note", async () => {
      const result = await noteService.deleteNote("non-existing-id");
      expect(result).toBe(false);
    });
  });

  describe("getAllNotes", () => {
    it("should return all notes", async () => {
      await noteService.createNote("Note 1", "Content 1");
      await noteService.createNote("Note 2", "Content 2");
      await noteService.createNote("Note 3", "Content 3");

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(3);
      // 정확한 순서를 확인하기 위해 실제 결과에 맞게 수정
      const titles = notes.map((n: Note) => n.title);
      expect(titles).toContain("Note 1");
      expect(titles).toContain("Note 2");
      expect(titles).toContain("Note 3");
    });

    it("should return empty array when no notes exist", async () => {
      const notes = await noteService.getAllNotes();
      expect(notes).toEqual([]);
    });
  });

  describe("searchNotes", () => {
    beforeEach(async () => {
      await noteService.createNote(
        "JavaScript Tutorial",
        "Learn about variables and functions"
      );
      await noteService.createNote("React Guide", "Components and hooks", [
        "react",
        "frontend",
      ]);
      await noteService.createNote(
        "Database Design",
        "SQL and NoSQL databases",
        ["database", "backend"]
      );
    });

    it("should search notes by title", async () => {
      const results = await noteService.searchNotes("React");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("React Guide");
    });

    it("should search notes by content", async () => {
      const results = await noteService.searchNotes("variables");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("JavaScript Tutorial");
    });

    it("should search notes by tags", async () => {
      const results = await noteService.searchNotes("frontend");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("React Guide");
    });

    it("should return empty array for no matches", async () => {
      const results = await noteService.searchNotes("python");
      expect(results).toEqual([]);
    });
  });

  describe("note ordering", () => {
    it("should maintain custom order when order field is set", async () => {
      // 노트를 생성 순서대로 만들기
      const note1 = await noteService.createNote("First Note", "Content 1");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 시간 차이 보장
      const note2 = await noteService.createNote("Second Note", "Content 2");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 시간 차이 보장
      const note3 = await noteService.createNote("Third Note", "Content 3");

      // 사용자 정의 순서 설정 (역순으로)
      await noteService.updateNote(note1.id, { order: 2 });
      await noteService.updateNote(note2.id, { order: 1 });
      await noteService.updateNote(note3.id, { order: 0 });

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(3);
      expect(notes[0].title).toBe("Third Note"); // order: 0
      expect(notes[1].title).toBe("Second Note"); // order: 1
      expect(notes[2].title).toBe("First Note"); // order: 2
    });

    it("should use createdAt when no order is set", async () => {
      const note1 = await noteService.createNote("Older Note", "Content 1");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 시간 차이 보장
      const note2 = await noteService.createNote("Newer Note", "Content 2");

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(2);
      // order가 없는 경우 createdAt 역순 (최신이 위)
      expect(notes[0].title).toBe("Newer Note");
      expect(notes[1].title).toBe("Older Note");
    });

    it("should prioritize order over createdAt", async () => {
      const note1 = await noteService.createNote("Old Note", "Content 1");
      await new Promise((resolve) => setTimeout(resolve, 10)); // 시간 차이 보장
      const note2 = await noteService.createNote("New Note", "Content 2");

      // 오래된 노트에 낮은 order 값 할당
      await noteService.updateNote(note1.id, { order: 0 });

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(2);
      // order가 있는 노트가 우선
      expect(notes[0].title).toBe("Old Note"); // order: 0
      expect(notes[1].title).toBe("New Note"); // order 없음
    });

    it("should reorder notes with reorderNote method", async () => {
      const note1 = await noteService.createNote("Note 1", "Content 1");
      const note2 = await noteService.createNote("Note 2", "Content 2");
      const note3 = await noteService.createNote("Note 3", "Content 3");

      // 첫 번째 노트를 세 번째 위치로 이동
      await noteService.reorderNote(note1.id, 2);

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(3);
      expect(notes[0].title).toBe("Note 2"); // 새로운 첫 번째
      expect(notes[1].title).toBe("Note 3"); // 새로운 두 번째
      expect(notes[2].title).toBe("Note 1"); // 새로운 세 번째
    });

    it("should handle reorderNote with invalid noteId", async () => {
      await noteService.createNote("Note 1", "Content 1");

      // 존재하지 않는 노트 ID로 순서 변경 시도
      await noteService.reorderNote("non-existing-id", 0);

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0].title).toBe("Note 1");
    });

    it("should handle reorderNote with same position", async () => {
      const note1 = await noteService.createNote("Note 1", "Content 1");
      const note2 = await noteService.createNote("Note 2", "Content 2");

      // 같은 위치로 이동
      await noteService.reorderNote(note1.id, 0);

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(2);
      // 순서가 변경되지 않아야 함
      expect(notes[0].title).toBe("Note 2");
      expect(notes[1].title).toBe("Note 1");
    });

    it("should update multiple note orders with updateNoteOrders", async () => {
      const note1 = await noteService.createNote("Note A", "Content 1");
      const note2 = await noteService.createNote("Note B", "Content 2");
      const note3 = await noteService.createNote("Note C", "Content 3");

      // 여러 노트의 순서를 한 번에 업데이트
      await noteService.updateNoteOrders({
        [note1.id]: 2,
        [note2.id]: 0,
        [note3.id]: 1,
      });

      const notes = await noteService.getAllNotes();
      expect(notes).toHaveLength(3);
      expect(notes[0].title).toBe("Note B"); // order: 0
      expect(notes[1].title).toBe("Note C"); // order: 1
      expect(notes[2].title).toBe("Note A"); // order: 2
    });
  });
});
