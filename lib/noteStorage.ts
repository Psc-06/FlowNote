import { Note } from "@/types/note";
import { FlowchartData } from "@/types/flowchart";

const STORAGE_KEY = "flownote.notes.v1";

const nowIso = () => new Date().toISOString();

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const isBrowser = () => typeof window !== "undefined";

const saveNotes = (notes: Note[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export function loadNotes(): Note[] {
  if (!isBrowser()) return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((note) => ({
      id: note.id,
      title: note.title ?? "Untitled Note",
      content: note.content ?? "",
      createdAt: note.createdAt ?? nowIso(),
      updatedAt: note.updatedAt ?? nowIso(),
      flowchart: note.flowchart ?? null,
    }));
  } catch {
    return [];
  }
}

export function createNote(input?: { title?: string; content?: string }): Note {
  const notes = loadNotes();
  const timestamp = nowIso();

  const nextNote: Note = {
    id: generateId(),
    title: input?.title?.trim() || "Untitled Note",
    content: input?.content ?? "",
    createdAt: timestamp,
    updatedAt: timestamp,
    flowchart: null,
  };

  const nextNotes = [nextNote, ...notes];
  saveNotes(nextNotes);

  return nextNote;
}

export function updateNote(
  id: string,
  updates: Partial<Pick<Note, "title" | "content" | "flowchart">>
): Note | null {
  const notes = loadNotes();
  const noteIndex = notes.findIndex((note) => note.id === id);

  if (noteIndex === -1) return null;

  const current = notes[noteIndex];
  const next: Note = {
    ...current,
    title: updates.title !== undefined ? updates.title : current.title,
    content: updates.content !== undefined ? updates.content : current.content,
    flowchart: updates.flowchart !== undefined ? (updates.flowchart as FlowchartData | null) : current.flowchart,
    updatedAt: nowIso(),
  };

  notes[noteIndex] = next;
  saveNotes(notes);

  return next;
}

export function deleteNote(id: string): void {
  const notes = loadNotes();
  const next = notes.filter((note) => note.id !== id);
  saveNotes(next);
}
