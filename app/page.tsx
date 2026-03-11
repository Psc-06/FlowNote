"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Editor from "@/components/Editor";
import FlowchartCanvas from "@/components/FlowchartCanvas";
import Sidebar from "@/components/Sidebar";
import { FlowchartData } from "@/types/flowchart";
import { Note } from "@/types/note";
import { createNote, deleteNote, loadNotes, updateNote } from "@/lib/noteStorage";

const DEFAULT_CONTENT =
  "<h2>Project Planning Notes</h2><p>If user has account login else register then go to dashboard.</p><p>Add your own notes and highlight text to visualize flow.</p>";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ready, setReady] = useState(false);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [activeNoteId, notes]
  );

  const persistActiveNote = useCallback(() => {
    if (!activeNoteId) return;

    const updated = updateNote(activeNoteId, {
      title: title.trim() || "Untitled Note",
      content,
      flowchart,
    });

    if (!updated) return;

    setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
  }, [activeNoteId, content, flowchart, title]);

  useEffect(() => {
    const stored = loadNotes();
    const initialNotes = stored.length > 0 ? stored : [createNote({ title: "Untitled Note", content: DEFAULT_CONTENT })];
    const first = initialNotes[0];

    setNotes(initialNotes);
    setActiveNoteId(first.id);
    setTitle(first.title);
    setContent(first.content);
    setFlowchart(first.flowchart ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const interval = window.setInterval(() => {
      persistActiveNote();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [persistActiveNote, ready]);

  const handleGenerate = async (selectedText: string) => {
    if (!activeNoteId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/parse-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: selectedText }),
      });

      const payload = (await response.json()) as FlowchartData & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to detect process steps in the selected text.");
      }

      const nextFlowchart = { nodes: payload.nodes, edges: payload.edges };
      setFlowchart(nextFlowchart);
      const updated = updateNote(activeNoteId, { flowchart: nextFlowchart });
      if (updated) {
        setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
      }
    } catch {
      setFlowchart(null);
      setError("Unable to detect process steps in the selected text.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectNote = (id: string) => {
    persistActiveNote();

    const next = notes.find((note) => note.id === id);
    if (!next) return;

    setActiveNoteId(next.id);
    setTitle(next.title);
    setContent(next.content);
    setFlowchart(next.flowchart ?? null);
    setError(null);
  };

  const handleCreateNote = () => {
    persistActiveNote();

    const next = createNote({ title: "Untitled Note", content: "" });
    setNotes((prev) => [next, ...prev]);
    setActiveNoteId(next.id);
    setTitle(next.title);
    setContent(next.content);
    setFlowchart(null);
    setError(null);
  };

  const handleDeleteNote = (id: string) => {
    const wasActive = activeNoteId === id;
    deleteNote(id);

    const nextNotes = notes.filter((note) => note.id !== id);
    if (nextNotes.length === 0) {
      const replacement = createNote({ title: "Untitled Note", content: "" });
      setNotes([replacement]);
      setActiveNoteId(replacement.id);
      setTitle(replacement.title);
      setContent(replacement.content);
      setFlowchart(replacement.flowchart ?? null);
      return;
    }

    setNotes(nextNotes);

    if (wasActive) {
      const replacement = nextNotes[0];
      setActiveNoteId(replacement.id);
      setTitle(replacement.title);
      setContent(replacement.content);
      setFlowchart(replacement.flowchart ?? null);
      setError(null);
    }
  };

  if (!ready || !activeNote) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#e0f2fe_0,#f8fafc_35%,#f8fafc_100%)]">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">FlowNote</h1>
          <p className="text-sm text-slate-500">AI-powered notes to flowcharts</p>
        </div>
      </nav>

      <section className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:gap-6">
          <div className="h-1/2 md:h-full md:w-1/2">
            <Editor
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          <div className="relative h-1/2 md:h-full md:w-1/2">
            <FlowchartCanvas flowchart={flowchart} />
            {error && (
              <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
