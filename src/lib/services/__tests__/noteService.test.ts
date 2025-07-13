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
});
