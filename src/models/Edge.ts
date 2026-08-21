export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // 'true' | 'false' | 'success' | 'fail' | 'default'
  targetHandle?: string;
  condition?: string;
  label?: string;
  animated?: boolean;
}
