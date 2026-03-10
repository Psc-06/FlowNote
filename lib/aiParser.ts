import OpenAI from "openai";
import { FlowchartData, FlowEdge, FlowNode } from "@/types/flowchart";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const parseJsonResponse = (raw: string): FlowchartData => {
  const sanitized = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(sanitized) as Partial<FlowchartData>;

  if (!parsed.nodes || !parsed.edges || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Invalid AI response shape.");
  }

  const nodes = parsed.nodes
    .filter((node): node is FlowNode => Boolean(node?.id) && Boolean(node?.label))
    .map((node) => ({
      id: String(node.id),
      label: String(node.label),
      kind: node.kind,
    }));

  const edges = parsed.edges
    .filter((edge): edge is FlowEdge => Boolean(edge?.source) && Boolean(edge?.target))
    .map((edge) => ({
      source: String(edge.source),
      target: String(edge.target),
      label: edge.label ? String(edge.label) : undefined,
    }));

  if (nodes.length < 2 || edges.length < 1) {
    throw new Error("Unable to detect process steps in the selected text.");
  }

  return { nodes, edges };
};

const fallbackParser = (text: string): FlowchartData => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const hasConditional = /\bif\b/i.test(cleaned) && /\belse\b/i.test(cleaned);

  if (hasConditional) {
    const match = cleaned.match(/if\s+(.+?)\s+(?:then\s+)?(.+?)\s+else\s+(.+?)(?:\s+then\s+(.+))?$/i);
    if (match) {
      const [, condition, yesAction, noAction, nextStep] = match;
      const nodes: FlowNode[] = [
        { id: "1", label: "Start", kind: "start" },
        { id: "2", label: condition.replace(/[.?!]$/, "") + "?", kind: "decision" },
        { id: "3", label: yesAction.replace(/[.?!]$/, ""), kind: "process" },
        { id: "4", label: noAction.replace(/[.?!]$/, ""), kind: "process" },
      ];

      const edges: FlowEdge[] = [
        { source: "1", target: "2" },
        { source: "2", target: "3", label: "Yes" },
        { source: "2", target: "4", label: "No" },
      ];

      if (nextStep) {
        nodes.push({ id: "5", label: nextStep.replace(/[.?!]$/, ""), kind: "end" });
        edges.push({ source: "3", target: "5" }, { source: "4", target: "5" });
      }

      return { nodes, edges };
    }
  }

  const steps = cleaned
    .split(/\bthen\b|\.|->|,/i)
    .map((step) => step.trim())
    .filter(Boolean);

  if (steps.length < 2) {
    throw new Error("Unable to detect process steps in the selected text.");
  }

  const nodes: FlowNode[] = [{ id: "1", label: "Start", kind: "start" }];
  const edges: FlowEdge[] = [];

  steps.forEach((step, index) => {
    const id = String(index + 2);
    nodes.push({ id, label: step, kind: index === steps.length - 1 ? "end" : "process" });
    edges.push({ source: String(index + 1), target: id });
  });

  return { nodes, edges };
};

export async function parseTextToFlowchart(text: string): Promise<FlowchartData> {
  if (!text.trim()) {
    throw new Error("Unable to detect process steps in the selected text.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackParser(text);
  }

  const client = new OpenAI({ apiKey });

  const prompt = `Convert the following text into a flowchart JSON object with this exact shape:
{
  "nodes": [{"id":"1", "label":"...", "kind":"start|process|decision|end"}],
  "edges": [{"source":"1", "target":"2", "label":"optional"}]
}
Rules:
- Output JSON only. No markdown or prose.
- Keep ids as strings.
- Include a start node and preserve branching when conditional logic appears.
- Keep labels concise.

Text:
${text}`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You transform natural-language process descriptions into flowchart JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Unable to detect process steps in the selected text.");
  }

  return parseJsonResponse(content);
}
