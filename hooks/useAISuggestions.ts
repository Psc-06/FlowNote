"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";

const MIN_LENGTH = 30;
const DEBOUNCE_MS = 2000;

type AISuggestionState = {
  text: string;
} | null;

type UseAISuggestionsReturn = {
  suggestion: AISuggestionState;
  isAnalyzing: boolean;
  dismiss: (text: string) => void;
};

export function useAISuggestions(editor: Editor | null): UseAISuggestionsReturn {
  const [suggestion, setSuggestion] = useState<AISuggestionState>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Cache of paragraph texts already suggested or dismissed — never re-surface them
  const cacheRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track latest in-flight request to ignore stale responses
  const requestIdRef = useRef(0);

  const dismiss = (text: string) => {
    cacheRef.current.add(text);
    setSuggestion(null);
  };

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Clear any pending debounce
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        // Get the paragraph the cursor is currently inside
        const { $anchor } = editor.state.selection;
        const paragraphText = $anchor.parent.textContent.trim();

        if (paragraphText.length < MIN_LENGTH) return;
        if (cacheRef.current.has(paragraphText)) return;

        // Increment request id to ignore stale responses from older text
        const thisRequestId = ++requestIdRef.current;

        setIsAnalyzing(true);
        try {
          const res = await fetch("/api/analyze-paragraph", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: paragraphText }),
          });

          if (!res.ok || requestIdRef.current !== thisRequestId) return;

          const data = (await res.json()) as { isProcess?: boolean };
          if (requestIdRef.current !== thisRequestId) return;

          if (data.isProcess && !cacheRef.current.has(paragraphText)) {
            setSuggestion({ text: paragraphText });
          }
        } catch {
          // Silently swallow — never crash the editor over a suggestion
        } finally {
          if (requestIdRef.current === thisRequestId) {
            setIsAnalyzing(false);
          }
        }
      }, DEBOUNCE_MS);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editor]);

  return { suggestion, isAnalyzing, dismiss };
}
