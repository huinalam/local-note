import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AutoSaveService } from "../autoSaveService";
import type { NoteService } from "../noteService";

describe("Auto Save Service", () => {
  let autoSaveService: AutoSaveService;
  let mockNoteService: NoteService;
  let mockUpdateNote: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockUpdateNote = vi.fn().mockResolvedValue(undefined);
    mockNoteService = {
      updateNote: mockUpdateNote,
    } as any;

    autoSaveService = new AutoSaveService(mockNoteService, 100); // 100ms로 단축
  });

  afterEach(() => {
    vi.useRealTimers();
    autoSaveService.destroy();
  });

  it("should schedule auto-save", () => {
    const noteId = "test-note-id";
    const content = "Updated content";

    autoSaveService.scheduleAutoSave(noteId, { content });

    // 아직 저장되지 않아야 함
    expect(mockUpdateNote).not.toHaveBeenCalled();

    // hasPendingSave 확인
    expect(autoSaveService.hasPendingSave(noteId)).toBe(true);
  });

  it("should save immediately", async () => {
    const noteId = "test-note-id";
    const content = "Immediate content";

    await autoSaveService.saveImmediately(noteId, { content });

    expect(mockUpdateNote).toHaveBeenCalledWith(noteId, { content });
  });

  it("should cancel auto-save", () => {
    const noteId = "test-note-id";

    autoSaveService.scheduleAutoSave(noteId, { content: "Content" });
    expect(autoSaveService.hasPendingSave(noteId)).toBe(true);

    autoSaveService.cancelAutoSave(noteId);
    expect(autoSaveService.hasPendingSave(noteId)).toBe(false);
  });

  it("should check pending saves", () => {
    expect(autoSaveService.hasPendingSaves()).toBe(false);

    autoSaveService.scheduleAutoSave("note-1", { content: "Content 1" });
    expect(autoSaveService.hasPendingSaves()).toBe(true);

    autoSaveService.cancelAutoSave("note-1");
    expect(autoSaveService.hasPendingSaves()).toBe(false);
  });
});
