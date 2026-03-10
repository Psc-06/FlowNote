"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import FlowchartCanvas from "@/components/FlowchartCanvas";
import { FlowchartData } from "@/types/flowchart";

export default function Home() {
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (selectedText: string) => {
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

      setFlowchart({ nodes: payload.nodes, edges: payload.edges });
    } catch {
      setFlowchart(null);
      setError("Unable to detect process steps in the selected text.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#e0f2fe_0,#f8fafc_35%,#f8fafc_100%)]">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">FlowNote</h1>
          <p className="text-sm text-slate-500">AI-powered notes to flowcharts</p>
        </div>
      </nav>

      <section className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
        <div className="h-1/2 md:h-full md:w-1/2">
          <Editor onGenerate={handleGenerate} isGenerating={isGenerating} />
        </div>

        <div className="relative h-1/2 md:h-full md:w-1/2">
          <FlowchartCanvas flowchart={flowchart} />
          {error && (
            <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
