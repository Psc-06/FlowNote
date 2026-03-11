"use client";

type FlowSuggestionProps = {
  onGenerate: () => void;
  onDismiss: () => void;
  isGenerating: boolean;
};

export default function FlowSuggestion({
  onGenerate,
  onDismiss,
  isGenerating,
}: FlowSuggestionProps) {
  return (
    <div className="flow-suggestion-popup absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/95 px-5 py-3.5 shadow-xl shadow-indigo-100/60 backdrop-blur-sm">
        {/* Icon + text */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
            <span className="text-base leading-none" aria-hidden="true">⚡</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-700 leading-tight">Flow detected</p>
            <p className="text-[11px] text-gray-400 leading-tight mt-0.5">Generate flowchart?</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-100" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGenerating ? "Generating…" : "Generate"}
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
  );
}
