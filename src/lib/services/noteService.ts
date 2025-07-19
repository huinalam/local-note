import type { Note } from "../database/types";
import type { NoteDatabase } from "../database/NoteDatabase";

export interface NoteUpdateData {
  title?: string;
  content?: string;
  tags?: string[];
  order?: number;
}

export class NoteService {
  constructor(private db: NoteDatabase) {}

  async createNote(
    title: string,
    content: string,
    tags: string[] = []
  ): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.notes.add(note);
    return note;
  }

  async getNote(id: string): Promise<Note | undefined> {
    return await this.db.notes.get(id);
  }

  async updateNote(
    id: string,
    updateData: NoteUpdateData
  ): Promise<Note | undefined> {
    const existingNote = await this.db.notes.get(id);
    if (!existingNote) {
      return undefined;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...updateData,
      updatedAt: new Date(),
    };

    await this.db.notes.put(updatedNote);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<boolean> {
    const existingNote = await this.db.notes.get(id);
    if (!existingNote) {
      return false;
    }

    await this.db.notes.delete(id);
    return true;
  }

  async getAllNotes(): Promise<Note[]> {
    // order 필드가 있는 노트는 order 기준으로, 없는 노트는 createdAt 기준으로 정렬
    const notes = await this.db.notes.toArray();

    return notes.sort((a, b) => {
      // order가 둘 다 있는 경우
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }

      // order가 하나만 있는 경우 (order가 있는 것이 우선)
      if (a.order !== undefined && b.order === undefined) {
        return -1;
      }
      if (a.order === undefined && b.order !== undefined) {
        return 1;
      }

      // order가 둘 다 없는 경우 createdAt 역순 (최신이 위)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async searchNotes(query: string): Promise<Note[]> {
    return await this.db.notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      )
      .toArray();
  }

  /**
   * 노트들의 순서를 업데이트합니다.
   * @param noteOrders 노트 ID와 새로운 순서 매핑
   */
  async updateNoteOrders(noteOrders: {
    [noteId: string]: number;
  }): Promise<void> {
    const promises = Object.entries(noteOrders).map(([noteId, order]) =>
      this.updateNote(noteId, { order })
    );

    await Promise.all(promises);
  }

  /**
   * 드래그앤 드롭으로 노트 순서를 변경합니다.
   * @param noteId 이동할 노트 ID
   * @param newIndex 새로운 인덱스 (0-based)
   */
  async reorderNote(noteId: string, newIndex: number): Promise<void> {
    const allNotes = await this.getAllNotes();
    const currentIndex = allNotes.findIndex((note) => note.id === noteId);

    if (currentIndex === -1 || currentIndex === newIndex) {
      return; // 노트를 찾을 수 없거나 같은 위치로 이동
    }

    // 새로운 순서 배열 생성
    const reorderedNotes = [...allNotes];
    const [movedNote] = reorderedNotes.splice(currentIndex, 1);
    reorderedNotes.splice(newIndex, 0, movedNote);

    // 각 노트에 새로운 order 값 할당
    const updatePromises = reorderedNotes.map((note, index) =>
      this.updateNote(note.id, { order: index })
    );

    await Promise.all(updatePromises);
  }
}
