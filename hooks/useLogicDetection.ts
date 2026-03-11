"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";

const LOGIC_KEYWORDS = /\b(if|else|then|after|before|when|retry|loop|process|step)\b/i;
const MIN_LENGTH = 20;
const INTERVAL_MS = 1000;

type UseLogicDetectionReturn = {
  logicDetected: boolean;
  detectedText: string;
  dismiss: (text: string) => void;
};

export function useLogicDetection(editor: Editor | null): UseLogicDetectionReturn {
  const [logicDetected, setLogicDetected] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const dismissedRef = useRef<Set<string>>(new Set());

  const dismiss = (text: string) => {
    dismissedRef.current.add(text);
    setLogicDetected(false);
    setDetectedText("");
  };

  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      const text = editor.getText().trim();

      if (text.length > MIN_LENGTH && LOGIC_KEYWORDS.test(text)) {
        if (!dismissedRef.current.has(text)) {
          setLogicDetected(true);
          setDetectedText(text);
          return;
        }
      }

      setLogicDetected(false);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [editor]);

  return { logicDetected, detectedText, dismiss };
}
