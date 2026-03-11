"use client";

type AISuggestionProps = {
  paragraphText: string;
  onGenerate: () => void;
  onDismiss: () => void;
  isGenerating: boolean;
};

export default function AISuggestion({
  paragraphText,
  onGenerate,
  onDismiss,
  isGenerating,
}: AISuggestionProps) {
  // Truncate the detected paragraph for display
  const preview =
    paragraphText.length > 60
      ? paragraphText.slice(0, 57) + "..."
      : paragraphText;

  return (
    <div className="ai-suggestion-popup absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-violet-100 bg-white/95 px-5 py-4 shadow-xl shadow-violet-100/60 backdrop-blur-sm w-[340px]">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-50">
            <span className="text-sm leading-none" aria-hidden="true">✨</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-violet-700 leading-tight">
              This looks like a process
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400 leading-snug truncate">
              &ldquo;{preview}&rdquo;
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">Generate flowchart?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-violet-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 active:scale-95"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
