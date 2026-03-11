"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import GenerateButton from "@/components/GenerateButton";

type EditorProps = {
  title: string;
  content: string;
  onTitleChange: (nextTitle: string) => void;
  onContentChange: (nextContent: string) => void;
  onGenerate: (selectedText: string) => void;
  isGenerating: boolean;
};

type FloatingPosition = {
  x: number;
  y: number;
};

export default function Editor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onGenerate,
  isGenerating,
}: EditorProps) {
  const [selectedText, setSelectedText] = useState("");
  const [floatingPosition, setFloatingPosition] = useState<FloatingPosition | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write notes here, select any process text, and generate a flowchart...",
      }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onContentChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[380px] focus:outline-none p-5 text-slate-800 leading-relaxed",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleSelectionChange = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setSelectedText("");
        setFloatingPosition(null);
        return;
      }

      const selected = editor.state.doc.textBetween(from, to, " ").trim();
      if (!selected) {
        setSelectedText("");
        setFloatingPosition(null);
        return;
      }

      const browserSelection = window.getSelection();
      if (!browserSelection || browserSelection.rangeCount === 0) {
        return;
      }

      const range = browserSelection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const top = rect.top + window.scrollY - 48;
      const left = rect.left + window.scrollX;

      setSelectedText(selected);
      setFloatingPosition({ x: left, y: top });
    };

    editor.on("selectionUpdate", handleSelectionChange);

    return () => {
      editor.off("selectionUpdate", handleSelectionChange);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
      setSelectedText("");
      setFloatingPosition(null);
    }
  }, [content, editor]);

  const canGenerate = useMemo(() => Boolean(selectedText) && !isGenerating, [selectedText, isGenerating]);

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-100/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="w-2/3 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700 outline-none ring-indigo-100 transition focus:ring"
          placeholder="Untitled Note"
        />
        <p className="text-xs text-slate-500">Select text to generate a flowchart</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <EditorContent editor={editor} />
      </div>

      {floatingPosition && (
        <div
          className="absolute z-30"
          style={{
            left: `${floatingPosition.x}px`,
            top: `${floatingPosition.y}px`,
          }}
        >
          <GenerateButton
            disabled={!canGenerate}
            onClick={() => {
              if (!selectedText) return;
              onGenerate(selectedText);
            }}
          />
        </div>
      )}
    </div>
  );
}
