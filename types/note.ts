import { FlowchartData } from "@/types/flowchart";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  flowchart: FlowchartData | null;
};
