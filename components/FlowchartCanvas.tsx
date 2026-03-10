"use client";

import { memo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeProps,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { FlowchartData } from "@/types/flowchart";
import { toReactFlowElements } from "@/utils/flowchartConverter";

type FlowchartCanvasProps = {
  flowchart: FlowchartData | null;
};

const DecisionNode = memo(({ data }: NodeProps<{ label: string }>) => {
  return (
    <div className="relative flex size-28 items-center justify-center rounded-md border border-blue-300 bg-blue-50 text-center text-xs font-semibold text-blue-900 shadow-sm rotate-45">
      <span className="block max-w-20 -rotate-45">{data.label}</span>
      <div className="absolute -top-2 left-1/2 h-0.5 w-0.5" />
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";

const nodeTypes = {
  decision: DecisionNode,
};

export default function FlowchartCanvas({ flowchart }: FlowchartCanvasProps) {
  const initial = flowchart ? toReactFlowElements(flowchart) : { nodes: [], edges: [] };
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    if (!flowchart) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const nextElements = toReactFlowElements(flowchart);
    setNodes(nextElements.nodes);
    setEdges(nextElements.edges);
  }, [flowchart, setEdges, setNodes]);

  if (!flowchart) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="max-w-xs text-sm text-slate-500">
          Your generated flowchart will appear here after selecting text from the editor.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap nodeStrokeWidth={2} />
        <Controls position="bottom-right" />
        <Background gap={20} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
