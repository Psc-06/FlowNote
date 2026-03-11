"use client";

import { useState } from "react";
import { Note } from "@/types/note";

type SidebarProps = {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
};

export default function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}: SidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-gray-100 bg-gray-50/80 md:w-[250px]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
          F
        </div>
        <span className="text-sm font-semibold text-gray-800">FlowNote</span>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1111 5a6 6 0 016 6z" />
          </svg>
          <input
            type="text"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onCreateNote}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      {/* Section label */}
      <p className="px-4 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Notes
      </p>

      {/* Notes list */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">No notes found</p>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => onSelectNote(note.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
                    activeNoteId === note.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <svg className="h-3.5 w-3.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="flex-1 truncate">{note.title}</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="cursor-pointer rounded p-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                    aria-label={`Delete ${note.title}`}
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12m-9 0v10m6-10v10M9 7l1-2h4l1 2m-8 0h10a1 1 0 011 1v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a1 1 0 011-1z" />
                    </svg>
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-[10px] text-gray-400">FlowNote · v1.1</p>
      </div>
    </aside>
  );
}
