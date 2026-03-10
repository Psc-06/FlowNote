export type FlowNode = {
  id: string;
  label: string;
  kind?: "start" | "process" | "decision" | "end";
};

export type FlowEdge = {
  source: string;
  target: string;
  label?: string;
};

export type FlowchartData = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};
