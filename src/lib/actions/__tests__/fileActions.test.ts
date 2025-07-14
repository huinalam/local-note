import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFileActions } from "../fileActions";
import type { NoteService } from "../../services/noteService";
import type { AutoSaveService } from "../../services/autoSaveService";

describe("File Actions", () => {
  let mockNoteService: Partial<NoteService>;
  let mockAutoSaveService: Partial<AutoSaveService>;
  let fileActions: ReturnType<typeof createFileActions>;

  beforeEach(() => {
    mockNoteService = {
      createNote: vi.fn(),
      updateNote: vi.fn(),
      getAllNotes: vi.fn(),
    };

    mockAutoSaveService = {
      saveAll: vi.fn(),
      scheduleAutoSave: vi.fn(),
    };

    fileActions = createFileActions(
      mockNoteService as NoteService,
      mockAutoSaveService as AutoSaveService
    );
  });

  describe("createNewNote action", () => {
    it("should have correct metadata", () => {
      const action = fileActions.createNewNote;
      expect(action.id).toBe("file.new");
      expect(action.name).toBe("새 메모 생성");
      expect(action.description).toBe("새로운 메모를 생성합니다");
    });

    it("should create a new note", async () => {
      const mockNote = {
        id: "new-note-id",
        title: "",
        content: "",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockNoteService.createNote as any).mockResolvedValue(mockNote);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
      });
      await fileActions.createNewNote.handler(mockEvent);

      expect(mockNoteService.createNote).toHaveBeenCalledWith("", "", []);
    });

    it("should handle creation errors gracefully", async () => {
      (mockNoteService.createNote as any).mockRejectedValue(
        new Error("Creation failed")
      );

      const mockEvent = new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        fileActions.createNewNote.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });

  describe("saveNote action", () => {
    it("should have correct metadata", () => {
      const action = fileActions.saveNote;
      expect(action.id).toBe("file.save");
      expect(action.name).toBe("메모 저장");
      expect(action.description).toBe("현재 메모를 저장합니다");
    });

    it("should save all pending notes", async () => {
      const mockEvent = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
      });
      await fileActions.saveNote.handler(mockEvent);

      expect(mockAutoSaveService.saveAll).toHaveBeenCalled();
    });

    it("should handle save errors gracefully", async () => {
      (mockAutoSaveService.saveAll as any).mockRejectedValue(
        new Error("Save failed")
      );

      const mockEvent = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        fileActions.saveNote.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });

  describe("saveAllNotes action", () => {
    it("should have correct metadata", () => {
      const action = fileActions.saveAllNotes;
      expect(action.id).toBe("file.saveAll");
      expect(action.name).toBe("모든 메모 저장");
      expect(action.description).toBe("열린 모든 메모를 저장합니다");
    });

    it("should save all notes", async () => {
      const mockEvent = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        shiftKey: true,
      });
      await fileActions.saveAllNotes.handler(mockEvent);

      expect(mockAutoSaveService.saveAll).toHaveBeenCalled();
    });

    it("should handle save all errors gracefully", async () => {
      (mockAutoSaveService.saveAll as any).mockRejectedValue(
        new Error("Save all failed")
      );

      const mockEvent = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        shiftKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        fileActions.saveAllNotes.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });

  describe("openNoteList action", () => {
    it("should have correct metadata", () => {
      const action = fileActions.openNoteList;
      expect(action.id).toBe("file.openList");
      expect(action.name).toBe("메모 목록 열기");
      expect(action.description).toBe("메모 목록을 엽니다");
    });

    it("should get all notes", async () => {
      const mockNotes = [
        {
          id: "note1",
          title: "Note 1",
          content: "Content 1",
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockNoteService.getAllNotes as any).mockResolvedValue(mockNotes);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "o",
        ctrlKey: true,
      });
      await fileActions.openNoteList.handler(mockEvent);

      expect(mockNoteService.getAllNotes).toHaveBeenCalled();
    });

    it("should handle list loading errors gracefully", async () => {
      (mockNoteService.getAllNotes as any).mockRejectedValue(
        new Error("List loading failed")
      );

      const mockEvent = new KeyboardEvent("keydown", {
        key: "o",
        ctrlKey: true,
      });

      // 에러가 발생해도 예외가 던져지지 않아야 함
      await expect(
        fileActions.openNoteList.handler(mockEvent)
      ).resolves.not.toThrow();
    });
  });
});
