import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from '../nodes/CustomNode';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { Workflow, WorkflowNode } from '../../models/Workflow';
import { ActionType } from '../../models/Node';
import {
  Play,
  Save,
  Square,
  Terminal,
  SquareTerminal,
  FileText,
  Globe,
  CheckSquare,
  Clock,
  Bell,
  GitBranch,
  Code,
  LayoutGrid
} from 'lucide-react';

interface WorkflowCanvasProps {
  workflow: Workflow;
  onSave: (workflow: Workflow) => void;
  onRun: (workflow: Workflow) => void;
  onStop: () => void;
  isExecuting?: boolean;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  onSave,
  onRun,
  onStop,
  isExecuting
}) => {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const initialNodes: Node[] = useMemo(() => {
    return workflow.nodes.map((n) => ({
      id: n.id,
      type: 'custom',
      position: n.position,
      data: {
        type: n.type,
        label: n.label,
        config: n.config
      }
    }));
  }, [workflow]);

  const initialEdges: Edge[] = useMemo(() => {
    return workflow.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label,
      animated: e.animated
    }));
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState(workflow.name);

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const selectedWorkflowNode: WorkflowNode | null = useMemo(() => {
    if (!selectedNodeId) return null;
    const n = nodes.find((node) => node.id === selectedNodeId);
    if (!n) return null;
    return {
      id: n.id,
      type: n.data.type as ActionType,
      label: n.data.label as string,
      position: n.position,
      config: (n.data.config as Record<string, any>) || {}
    };
  }, [nodes, selectedNodeId]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const handleAddNode = (type: ActionType) => {
    const newId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'custom',
      position: {
        x: 150 + Math.random() * 80,
        y: 150 + Math.random() * 80
      },
      data: {
        type,
        label: `${type.toUpperCase()} Action`,
        config: type === 'delay' ? { durationMs: 1000 } : {}
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newId);
  };

  const handleUpdateNode = (updatedNode: WorkflowNode) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === updatedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: updatedNode.label,
              config: updatedNode.config
            }
          };
        }
        return n;
      })
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  };

  const handleSave = () => {
    const updatedWorkflow: Workflow = {
      ...workflow,
      name: workflowName,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type as ActionType,
        label: (n.data.label as string) || n.id,
        position: n.position,
        config: (n.data.config as Record<string, any>) || {}
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined
      }))
    };
    onSave(updatedWorkflow);
  };

  const handleAutoLayout = () => {
    setNodes((nds) => {
      return nds.map((node, idx) => ({
        ...node,
        position: {
          x: 200,
          y: 100 + idx * 130
        }
      }));
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Canvas Action Bar Header */}
      <div
        style={{
          height: 48,
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="text"
            className="input-field"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            style={{ fontWeight: 600, fontSize: 13, width: 220 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleAutoLayout} title="Auto Layout">
            <LayoutGrid size={14} /> Auto Layout
          </button>
          <button className="btn btn-secondary" onClick={handleSave}>
            <Save size={14} /> Save
          </button>
          {isExecuting ? (
            <button className="btn btn-danger" onClick={onStop}>
              <Square size={14} /> Stop
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onRun({ ...workflow, name: workflowName })}>
              <Play size={14} /> Run Workflow
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas + Floating Action Palette */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Action Palette Toolbar */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 5,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 8,
            display: 'flex',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <button className="btn-icon" title="Add Command Node" onClick={() => handleAddNode('command')}>
            <Terminal size={16} />
          </button>
          <button className="btn-icon" title="Add Terminal Node" onClick={() => handleAddNode('terminal')}>
            <SquareTerminal size={16} />
          </button>
          <button className="btn-icon" title="Add File Node" onClick={() => handleAddNode('file')}>
            <FileText size={16} />
          </button>
          <button className="btn-icon" title="Add URL Node" onClick={() => handleAddNode('url')}>
            <Globe size={16} />
          </button>
          <button className="btn-icon" title="Add Task Node" onClick={() => handleAddNode('task')}>
            <CheckSquare size={16} />
          </button>
          <button className="btn-icon" title="Add Delay Node" onClick={() => handleAddNode('delay')}>
            <Clock size={16} />
          </button>
          <button className="btn-icon" title="Add Condition Node" onClick={() => handleAddNode('condition')}>
            <GitBranch size={16} />
          </button>
          <button className="btn-icon" title="Add Notification Node" onClick={() => handleAddNode('notification')}>
            <Bell size={16} />
          </button>
          <button className="btn-icon" title="Add Script Node" onClick={() => handleAddNode('script')}>
            <Code size={16} />
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#404040" />
          <Controls />
        </ReactFlow>

        <NodePropertiesPanel
          node={selectedWorkflowNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
};
