import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NoteDatabase } from "../NoteDatabase";

describe("Database Schema", () => {
  let db: NoteDatabase;

  beforeEach(() => {
    db = new NoteDatabase();
  });

  afterEach(async () => {
    if (db.isOpen()) {
      await db.close();
    }
    await db.delete();
  });

  it("should define note database schema correctly", () => {
    expect(db.notes).toBeDefined();
    expect(db.settings).toBeDefined();
  });

  it("should have correct table structure for notes", async () => {
    await db.open();
    const noteSchema = db.notes.schema;

    expect(noteSchema.primKey.name).toBe("id");
    expect(noteSchema.indexes).toBeDefined();
  });

  it("should have correct table structure for settings", async () => {
    await db.open();
    const settingSchema = db.settings.schema;

    expect(settingSchema.primKey.name).toBe("key");
  });

  it("should open database successfully", async () => {
    await expect(db.open()).resolves.not.toThrow();
    expect(db.isOpen()).toBe(true);
  });
});
