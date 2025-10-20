"use client";

import "easymde/dist/easymde.min.css";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createNote,
  deleteNote,
  listNotes,
  seedWelcomeNote,
  updateNote,
  type NoteRecord,
} from "~/lib/db/notes";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-md border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
      Loading editor…
    </div>
  ),
});

const sortNotes = (notes: NoteRecord[]) =>
  [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

const formatTimestamp = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

type ToastMessage = {
  message: string;
  tone: "info" | "success" | "error";
};

type NotesAppProps = {
  activeNoteId?: string;
};

export function NotesApp({ activeNoteId }: NotesAppProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingSave, setHasPendingSave] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const activeIdRef = useRef<string | undefined>(activeNoteId);
  const notesRef = useRef<NoteRecord[]>([]);
  const draftRef = useRef({ title: "", content: "" });
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId),
    [notes, activeNoteId],
  );

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notes;
    }
    const term = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term),
    );
  }, [notes, searchTerm]);

  const showToast = useCallback(
    (message: string, tone: ToastMessage["tone"]) => {
      setToast({ message, tone });
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => setToast(null), 2500);
    },
    [],
  );

  const editorOptions = useMemo(
    () => ({
      spellChecker: false,
      autofocus: false,
      status: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "unordered-list",
        "ordered-list",
        "|",
        "quote",
        "code",
        "|",
        "link",
        "preview",
        "guide",
      ] as const,
    }),
    [],
  );

  const flushSave = useCallback(async () => {
    const noteId = activeIdRef.current;
    if (!noteId) {
      setHasPendingSave(false);
      return;
    }

    const existing = notesRef.current.find((note) => note.id === noteId);
    if (!existing) {
      setHasPendingSave(false);
      return;
    }

    const nextTitle = draftRef.current.title.trim() || "Untitled note";
    const nextContent = draftRef.current.content;

    const payload: { title?: string; content?: string } = {};
    if (nextTitle !== existing.title) {
      payload.title = nextTitle;
    }
    if (nextContent !== existing.content) {
      payload.content = nextContent;
    }

    if (Object.keys(payload).length === 0) {
      setHasPendingSave(false);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateNote(noteId, payload);
      setNotes((prev) =>
        sortNotes(
          prev.map((note) => (note.id === updated.id ? updated : note)),
        ),
      );
      setLastSavedAt(updated.updatedAt);
      setHasPendingSave(false);
    } catch (error) {
      showToast("Failed to save note. Changes may be lost.", "error");
      setHasPendingSave(true);
      if (process.env.NODE_ENV !== "production") {
        console.error(error as Error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setHasPendingSave(true);
    saveTimerRef.current = setTimeout(() => {
      void flushSave();
    }, 800);
  }, [flushSave]);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      let existing = await listNotes();
      if (existing.length === 0) {
        const seeded = await seedWelcomeNote();
        existing = [seeded];
      }
      existing = sortNotes(existing);
      setNotes(existing);
    } catch (error) {
      showToast("Unable to load notes. IndexedDB unavailable?", "error");
      if (process.env.NODE_ENV !== "production") {
        console.error(error as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    activeIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    if (!loading && notes.length > 0 && activeNoteId && !activeNote) {
      showToast("Note not found. Showing the latest note instead.", "info");
      router.replace(`/notes/${notes[0]!.id}`);
    }
  }, [activeNote, activeNoteId, loading, notes, router, showToast]);

  useEffect(() => {
    if (!loading && notes.length > 0 && !activeNoteId) {
      router.replace(`/notes/${notes[0]!.id}`);
    }
  }, [activeNoteId, loading, notes, router]);

  useEffect(() => {
    if (!activeNote) {
      return;
    }
    setDraftTitle(activeNote.title);
    setDraftContent(activeNote.content);
    draftRef.current = {
      title: activeNote.title,
      content: activeNote.content,
    };
    setLastSavedAt(activeNote.updatedAt);
  }, [activeNote]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      void flushSave();
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [flushSave]);

  const handleTitleChange = (value: string) => {
    setDraftTitle(value);
    draftRef.current = {
      ...draftRef.current,
      title: value,
    };
    scheduleSave();
  };

  const handleContentChange = (value: string) => {
    setDraftContent(value);
    draftRef.current = {
      ...draftRef.current,
      content: value,
    };
    scheduleSave();
  };

  const handleCreateNote = async () => {
    try {
      setIsCreating(true);
      const note = await createNote();
      setNotes((prev) => sortNotes([...prev, note]));
      router.push(`/notes/${note.id}`);
      showToast("New note created.", "success");
    } catch (error) {
      showToast("Failed to create note.", "error");
      if (process.env.NODE_ENV !== "production") {
        console.error(error as Error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectNote = async (noteId: string) => {
    if (noteId === activeNoteId) return;
    await flushSave();
    router.push(`/notes/${noteId}`);
  };

  const handleDeleteNote = async () => {
    if (!activeNote) return;
    const shouldDelete = window.confirm(
      "Delete this note? This action cannot be undone.",
    );
    if (!shouldDelete) return;
    try {
      await deleteNote(activeNote.id);
      const nextNotes = sortNotes(
        notes.filter((note) => note.id !== activeNote.id),
      );
      setNotes(nextNotes);
      showToast("Note deleted.", "info");
      if (nextNotes.length > 0) {
        router.replace(`/notes/${nextNotes[0]!.id}`);
      } else {
        setDraftTitle("");
        setDraftContent("");
        draftRef.current = { title: "", content: "" };
        setLastSavedAt(null);
      }
    } catch (error) {
      showToast("Failed to delete note.", "error");
      if (process.env.NODE_ENV !== "production") {
        console.error(error as Error);
      }
    }
  };

  const renderEditor = () => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center bg-slate-950 text-slate-300">
          Loading notes…
        </div>
      );
    }

    if (!activeNote) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-950 text-center text-slate-300">
          <h2 className="text-xl font-semibold">No note selected</h2>
          <p className="max-w-md text-slate-400">
            Create a new note to start writing. Notes are stored locally in
            IndexedDB and stay private to this device.
          </p>
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={isCreating}
            className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isCreating ? "Creating…" : "New note"}
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col gap-4 bg-slate-950 p-6">
        <div className="flex items-center gap-3">
          <input
            value={draftTitle}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="Note title"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-lg font-semibold text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
          />
          <button
            type="button"
            onClick={handleDeleteNote}
            className="rounded-md border border-red-500/60 px-3 py-2 text-sm font-medium text-red-200 transition hover:border-red-400 hover:text-red-100"
          >
            Delete
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            {isSaving
              ? "Saving…"
              : hasPendingSave
                ? "Pending changes"
                : lastSavedAt
                  ? `Saved ${formatTimestamp(lastSavedAt)}`
                  : ""}
          </span>
        </div>
        <div className="flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <SimpleMDE
            value={draftContent}
            onChange={handleContentChange}
            options={editorOptions}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-900/80 bg-slate-900/70 p-4 md:w-80 md:border-r md:border-b-0 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-wide text-slate-400 uppercase">
              local-note
            </p>
            <h1 className="text-lg font-semibold">My Notes</h1>
          </div>
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={isCreating}
            className="rounded-md bg-sky-500 px-3 py-2 text-xs font-medium text-white shadow transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isCreating ? "Creating…" : "New note"}
          </button>
        </div>
        <div className="mb-3">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
          />
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredNotes.length === 0 ? (
            <div className="rounded-md border border-slate-800/60 bg-slate-900/40 p-4 text-sm text-slate-400">
              {searchTerm ? (
                <p>No notes match “{searchTerm}”.</p>
              ) : (
                <p>No notes yet. Create your first note.</p>
              )}
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredNotes.map((note) => {
                const isActive = note.id === activeNote?.id;
                return (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectNote(note.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left transition ${
                        isActive
                          ? "border-sky-500 bg-slate-800/80 text-sky-100"
                          : "border-transparent bg-slate-900/30 text-slate-200 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <p className="truncate text-sm font-semibold">
                        {note.title || "Untitled note"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {note.content ? note.content : "No content yet."}
                      </p>
                      <p className="mt-2 text-[10px] tracking-wide text-slate-500 uppercase">
                        Updated {formatTimestamp(note.updatedAt)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
      <main className="flex flex-1 flex-col">{renderEditor()}</main>
      {toast ? (
        <div
          className={`pointer-events-none fixed right-4 bottom-4 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${
            toast.tone === "error"
              ? "bg-red-600/90 text-white"
              : toast.tone === "success"
                ? "bg-emerald-600/90 text-white"
                : "bg-slate-700/90 text-slate-100"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
