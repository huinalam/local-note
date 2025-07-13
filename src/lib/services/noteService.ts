import type { Note } from "../database/types";
import type { NoteDatabase } from "../database/NoteDatabase";

export interface NoteUpdateData {
  title?: string;
  content?: string;
  tags?: string[];
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
    return await this.db.notes.orderBy("updatedAt").reverse().toArray();
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
}
