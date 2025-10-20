import { describe, expect, it, beforeEach } from "vitest";

import {
  clearNotes,
  createNote,
  deleteNote,
  getNote,
  listNotes,
  NoteNotFoundError,
  updateNote,
} from "./notes";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("notes data layer", () => {
  beforeEach(async () => {
    await clearNotes();
  });

  it("creates and retrieves a note", async () => {
    const created = await createNote({ title: "First", content: "Hello world" });
    const retrieved = await getNote(created.id);

    expect(retrieved).toMatchObject({
      id: created.id,
      title: "First",
      content: "Hello world",
      editorType: "simplemde",
    });
    expect(new Date(retrieved.createdAt).getTime()).toBeTruthy();
    expect(new Date(retrieved.updatedAt).getTime()).toBeTruthy();
  });

  it("updates a note and bumps updatedAt", async () => {
    const created = await createNote({ title: "Draft", content: "Initial" });
    await sleep(5);

    const updated = await updateNote(created.id, {
      title: "Shipped",
      content: "Updated content",
      editorType: "monaco",
    });

    expect(updated.title).toBe("Shipped");
    expect(updated.content).toBe("Updated content");
    expect(updated.editorType).toBe("monaco");
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
      new Date(created.updatedAt).getTime(),
    );
  });

  it("creates notes with provided editor type", async () => {
    const created = await createNote({ editorType: "monaco" });
    const retrieved = await getNote(created.id);

    expect(created.editorType).toBe("monaco");
    expect(retrieved.editorType).toBe("monaco");
  });

  it("lists notes ordered by updatedAt desc", async () => {
    const alpha = await createNote({ title: "Alpha" });
    await sleep(5);
    const beta = await createNote({ title: "Beta" });
    await sleep(5);
    await updateNote(alpha.id, { content: "Alpha updated" });

    const notes = await listNotes();
    expect(notes.map((n) => n.id)).toEqual([alpha.id, beta.id]);
  });

  it("deletes a note", async () => {
    const created = await createNote({ title: "Temp" });
    await deleteNote(created.id);

    await expect(listNotes()).resolves.toHaveLength(0);
    await expect(getNote(created.id)).rejects.toBeInstanceOf(NoteNotFoundError);
  });

  it("throws when updating unknown note", async () => {
    await expect(updateNote("missing", { title: "noop" })).rejects.toBeInstanceOf(
      NoteNotFoundError,
    );
  });
});
