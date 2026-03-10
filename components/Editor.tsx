"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import GenerateButton from "@/components/GenerateButton";

type EditorProps = {
  onGenerate: (selectedText: string) => void;
  isGenerating: boolean;
};

type FloatingPosition = {
  x: number;
  y: number;
};

export default function Editor({ onGenerate, isGenerating }: EditorProps) {
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
    content:
      "<h2>Project Planning Notes</h2><p>If user has account login else register then go to dashboard.</p><p>Add your own notes and highlight text to visualize flow.</p>",
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

  const canGenerate = useMemo(() => Boolean(selectedText) && !isGenerating, [selectedText, isGenerating]);

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-100/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Editor</h2>
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
