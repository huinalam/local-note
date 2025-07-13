import type { NoteService, NoteUpdateData } from "./noteService";

interface PendingSave {
  noteId: string;
  updateData: NoteUpdateData;
  timeoutId: NodeJS.Timeout;
}

export class AutoSaveService {
  private pendingSaves = new Map<string, PendingSave>();
  private readonly autoSaveDelay: number;

  constructor(private noteService: NoteService, autoSaveDelay: number = 500) {
    this.autoSaveDelay = autoSaveDelay;

    // 브라우저 종료 시 모든 변경사항 저장
    if (typeof window !== "undefined") {
      window.addEventListener(
        "beforeunload",
        this.handleBeforeUnload.bind(this)
      );
    }
  }

  /**
   * 노트 자동 저장을 스케줄링합니다.
   * 기존 스케줄이 있다면 취소하고 새로 스케줄링합니다 (debounce).
   */
  scheduleAutoSave(noteId: string, updateData: NoteUpdateData): void {
    // 기존 스케줄된 저장 취소
    this.cancelAutoSave(noteId);

    // 새로운 자동 저장 스케줄링
    const timeoutId = setTimeout(async () => {
      try {
        await this.noteService.updateNote(noteId, updateData);
        this.pendingSaves.delete(noteId);
      } catch (error) {
        console.error(`Auto-save failed for note ${noteId}:`, error);
        this.pendingSaves.delete(noteId);
      }
    }, this.autoSaveDelay);

    this.pendingSaves.set(noteId, {
      noteId,
      updateData,
      timeoutId,
    });
  }

  /**
   * 노트를 즉시 저장하고 스케줄된 자동 저장을 취소합니다.
   */
  async saveImmediately(
    noteId: string,
    updateData: NoteUpdateData
  ): Promise<void> {
    this.cancelAutoSave(noteId);

    try {
      await this.noteService.updateNote(noteId, updateData);
    } catch (error) {
      console.error(`Immediate save failed for note ${noteId}:`, error);
      throw error;
    }
  }

  /**
   * 특정 노트의 자동 저장을 취소합니다.
   */
  cancelAutoSave(noteId: string): void {
    const pendingSave = this.pendingSaves.get(noteId);
    if (pendingSave) {
      clearTimeout(pendingSave.timeoutId);
      this.pendingSaves.delete(noteId);
    }
  }

  /**
   * 모든 대기 중인 노트를 즉시 저장합니다.
   */
  async saveAll(): Promise<void> {
    const savePromises: Promise<void>[] = [];

    for (const [noteId, pendingSave] of this.pendingSaves) {
      clearTimeout(pendingSave.timeoutId);

      const savePromise = this.noteService
        .updateNote(noteId, pendingSave.updateData)
        .then(() => {}) // Note 타입을 void로 변환
        .catch((error) => {
          console.error(`Save all failed for note ${noteId}:`, error);
        });

      savePromises.push(savePromise);
    }

    this.pendingSaves.clear();
    await Promise.all(savePromises);
  }

  /**
   * 대기 중인 저장 작업이 있는지 확인합니다.
   */
  hasPendingSaves(): boolean {
    return this.pendingSaves.size > 0;
  }

  /**
   * 특정 노트에 대기 중인 저장 작업이 있는지 확인합니다.
   */
  hasPendingSave(noteId: string): boolean {
    return this.pendingSaves.has(noteId);
  }

  /**
   * 대기 중인 모든 저장 작업을 취소하고 서비스를 정리합니다.
   */
  destroy(): void {
    for (const pendingSave of this.pendingSaves.values()) {
      clearTimeout(pendingSave.timeoutId);
    }
    this.pendingSaves.clear();

    if (typeof window !== "undefined") {
      window.removeEventListener(
        "beforeunload",
        this.handleBeforeUnload.bind(this)
      );
    }
  }

  /**
   * 브라우저 종료 시 모든 변경사항을 저장합니다.
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (this.hasPendingSaves()) {
      // 동기적으로 저장 시도 (브라우저 제한으로 인해 완전하지 않을 수 있음)
      this.saveAll();

      // 사용자에게 경고 표시
      event.preventDefault();
      event.returnValue =
        "저장되지 않은 변경사항이 있습니다. 정말 페이지를 떠나시겠습니까?";
    }
  };
}
