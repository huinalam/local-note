import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createDeleteActions } from "../deleteActions";
import type { Note } from "../../database/types";

// Mock services
const mockNoteService = {
  deleteNote: vi.fn(),
  getNote: vi.fn(),
} as any;

const mockConfirmDialog = {
  show: vi.fn(),
  hide: vi.fn(),
  isOpen: false,
};

// Mock current note state
let mockCurrentNote: Note | null = null;
const mockGetCurrentNote = vi.fn(() => mockCurrentNote);
const mockSetCurrentNote = vi.fn((note: Note | null) => {
  mockCurrentNote = note;
});

// Mock loadNotes and tabStore
const mockLoadNotes = vi.fn();
const mockTabStore = {
  removeTabByNoteId: vi.fn(),
};

describe("Delete Actions", () => {
  let deleteActions: ReturnType<typeof createDeleteActions>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentNote = null;

    deleteActions = createDeleteActions(
      mockNoteService,
      mockConfirmDialog,
      mockGetCurrentNote,
      mockSetCurrentNote,
      mockLoadNotes
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("deleteCurrentNote action", () => {
    it("should have correct metadata", () => {
      const action = deleteActions.deleteCurrentNote;
      expect(action.id).toBe("note.delete");
      expect(action.name).toBe("노트 삭제");
      expect(action.description).toBe("현재 노트를 삭제합니다");
    });

    it("should show confirm dialog when current note exists", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockConfirmDialog.show.mockImplementation((config) => {
        // 확인 다이얼로그가 표시된 후 onConfirm 호출
        config.onConfirm();
      });
      mockNoteService.deleteNote.mockResolvedValue(true);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteCurrentNote.handler(mockEvent);

      expect(mockConfirmDialog.show).toHaveBeenCalledWith({
        title: "노트 삭제",
        message:
          "정말로 이 노트를 삭제하시겠습니까?\n삭제된 노트는 복구할 수 없습니다.",
        confirmText: "삭제",
        cancelText: "취소",
        variant: "danger",
        onConfirm: expect.any(Function),
        onCancel: expect.any(Function),
      });
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith("note-1");
    });

    it("should not show confirm dialog when no current note", async () => {
      mockGetCurrentNote.mockReturnValue(null);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteCurrentNote.handler(mockEvent);

      expect(mockConfirmDialog.show).not.toHaveBeenCalled();
    });

    it("should clear current note after successful deletion", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockConfirmDialog.show.mockImplementation((config) => {
        config.onConfirm();
      });
      mockNoteService.deleteNote.mockResolvedValue(true);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteCurrentNote.handler(mockEvent);

      expect(mockSetCurrentNote).toHaveBeenCalledWith(null);
    });

    it("should handle deletion failure gracefully", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockConfirmDialog.show.mockImplementation((config) => {
        config.onConfirm();
      });
      mockNoteService.deleteNote.mockResolvedValue(false);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteCurrentNote.handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        "노트 삭제 실패: 노트를 찾을 수 없습니다"
      );
      consoleSpy.mockRestore();
    });

    it("should handle deletion error gracefully", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockConfirmDialog.show.mockImplementation((config) => {
        config.onConfirm();
      });
      mockNoteService.deleteNote.mockRejectedValue(new Error("Database error"));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteCurrentNote.handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        "노트 삭제 실패:",
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });

    it("should do nothing when user cancels deletion", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockConfirmDialog.show.mockImplementation((config) => {
        config.onCancel();
      });

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteCurrentNote.handler(mockEvent);

      expect(mockNoteService.deleteNote).not.toHaveBeenCalled();
      expect(mockSetCurrentNote).not.toHaveBeenCalled();
    });
  });

  describe("deleteSelectedNote action", () => {
    it("should have correct metadata", () => {
      const action = deleteActions.deleteSelectedNote;
      expect(action.id).toBe("note.deleteSelected");
      expect(action.name).toBe("선택된 노트 삭제");
      expect(action.description).toBe("목록에서 선택된 노트를 삭제합니다");
    });

    it("should delete note by id when provided", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockNoteService.getNote.mockResolvedValue(mockNote);
      mockConfirmDialog.show.mockImplementation((config) => {
        config.onConfirm();
      });
      mockNoteService.deleteNote.mockResolvedValue(true);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteSelectedNote.handler(mockEvent);

      expect(mockNoteService.getNote).toHaveBeenCalledWith("note-1");
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith("note-1");
    });

    it("should handle non-existing note gracefully", async () => {
      const mockNote: Note = {
        id: "non-existing-note",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockNoteService.getNote.mockResolvedValue(undefined);

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteSelectedNote.handler(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith(
        "노트 삭제 실패: 노트를 찾을 수 없습니다"
      );
      expect(mockConfirmDialog.show).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should do nothing when no note id provided", async () => {
      mockGetCurrentNote.mockReturnValue(null);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
      });

      await deleteActions.deleteSelectedNote.handler(mockEvent);

      expect(mockNoteService.getNote).not.toHaveBeenCalled();
      expect(mockConfirmDialog.show).not.toHaveBeenCalled();
    });
  });

  describe("deleteNoteWithoutConfirm action", () => {
    it("should have correct metadata", () => {
      const action = deleteActions.deleteNoteWithoutConfirm;
      expect(action.id).toBe("note.deleteImmediate");
      expect(action.name).toBe("즉시 노트 삭제");
      expect(action.description).toBe("확인 없이 즉시 노트를 삭제합니다");
    });

    it("should delete current note immediately without confirmation", async () => {
      const mockNote: Note = {
        id: "note-1",
        title: "Test Note",
        content: "Test Content",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockGetCurrentNote.mockReturnValue(mockNote);
      mockNoteService.deleteNote.mockResolvedValue(true);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
        shiftKey: true,
      });

      await deleteActions.deleteNoteWithoutConfirm.handler(mockEvent);

      expect(mockConfirmDialog.show).not.toHaveBeenCalled();
      expect(mockNoteService.deleteNote).toHaveBeenCalledWith("note-1");
      expect(mockSetCurrentNote).toHaveBeenCalledWith(null);
    });

    it("should do nothing when no current note", async () => {
      mockGetCurrentNote.mockReturnValue(null);

      const mockEvent = new KeyboardEvent("keydown", {
        key: "Delete",
        shiftKey: true,
      });

      await deleteActions.deleteNoteWithoutConfirm.handler(mockEvent);

      expect(mockNoteService.deleteNote).not.toHaveBeenCalled();
    });
  });
});
