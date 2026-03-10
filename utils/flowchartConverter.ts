import { Edge, MarkerType, Node, Position } from "reactflow";
import { FlowchartData } from "@/types/flowchart";

export const toReactFlowElements = (flowchart: FlowchartData): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = flowchart.nodes.map((node, index) => ({
    id: node.id,
    type: node.kind === "decision" ? "decision" : "default",
    data: { label: node.label },
    position: {
      x: 120 + (index % 2) * 280,
      y: 80 + index * 110,
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style:
      node.kind === "decision"
        ? undefined
        : {
            borderRadius: 12,
            border: "1px solid #dbe3ef",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            padding: 8,
            fontSize: 13,
            minWidth: 140,
            textAlign: "center",
          },
  }));

  const edges: Edge[] = flowchart.edges.map((edge, index) => ({
    id: `edge-${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#2563eb",
    },
    style: {
      stroke: "#2563eb",
      strokeWidth: 1.5,
    },
    labelStyle: {
      fontSize: 12,
      fill: "#1e3a8a",
      fontWeight: 600,
    },
  }));

  return { nodes, edges };
};
