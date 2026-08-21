import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Play,
  Terminal,
  SquareTerminal,
  FileText,
  Globe,
  CheckSquare,
  Code2,
  Clock,
  Bell,
  GitBranch,
  Code,
  CheckCircle2,
  XCircle,
  Loader2,
  MinusCircle
} from 'lucide-react';
import { ActionType } from '../../models/Node';
import { ExecutionStatus } from '../../models/Execution';

const actionIconMap: Record<ActionType, React.ReactNode> = {
  start: <Play size={16} className="text-emerald-400" />,
  command: <Terminal size={16} className="text-sky-400" />,
  terminal: <SquareTerminal size={16} className="text-blue-400" />,
  file: <FileText size={16} className="text-amber-400" />,
  url: <Globe size={16} className="text-teal-400" />,
  task: <CheckSquare size={16} className="text-purple-400" />,
  vscodeCommand: <Code2 size={16} className="text-indigo-400" />,
  delay: <Clock size={16} className="text-yellow-400" />,
  notification: <Bell size={16} className="text-pink-400" />,
  condition: <GitBranch size={16} className="text-orange-400" />,
  script: <Code size={16} className="text-violet-400" />
};

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const type = (data.type as ActionType) || 'command';
  const label = (data.label as string) || type.toUpperCase();
  const config = (data.config as Record<string, any>) || {};
  const executionStatus = data.executionStatus as ExecutionStatus | undefined;

  const icon = actionIconMap[type] || <Terminal size={16} />;

  const renderStatus = () => {
    if (!executionStatus) return null;
    switch (executionStatus) {
      case 'RUNNING':
        return <Loader2 size={14} className="animate-spin text-sky-400" />;
      case 'SUCCESS':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'FAILED':
        return <XCircle size={14} className="text-rose-500" />;
      case 'SKIPPED':
        return <MinusCircle size={14} className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getSubtext = () => {
    if (type === 'command') return config.command || 'No command set';
    if (type === 'terminal') return config.command ? `> ${config.command}` : 'Open Terminal';
    if (type === 'url') return config.url || 'http://localhost';
    if (type === 'file') return `${config.action || 'open'}: ${config.path || ''}`;
    if (type === 'delay') return `${config.durationMs || 1000}ms`;
    if (type === 'condition') return `${config.conditionType || 'previousSuccess'}`;
    if (type === 'notification') return config.message || 'Notification';
    if (type === 'task') return config.taskName || 'Task';
    if (type === 'vscodeCommand') return config.commandId || 'Command';
    return '';
  };

  return (
    <div className={`react-flow__node-runly ${selected ? 'selected' : ''}`}>
      {type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#38bdf8', width: 8, height: 8 }}
        />
      )}

      <div className="node-header">
        {icon}
        <span>{label}</span>
        <div className="node-status-icon">{renderStatus()}</div>
      </div>

      <div className="node-type-label">{type}</div>

      {getSubtext() && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--fg-muted)',
            marginTop: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '180px'
          }}
        >
          {getSubtext()}
        </div>
      )}

      {type === 'condition' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '9px', color: '#3fb950', fontWeight: 600 }}>TRUE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              style={{ background: '#3fb950', left: 14, width: 8, height: 8 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '9px', color: '#f85149', fontWeight: 600 }}>FALSE</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              style={{ background: '#f85149', right: 14, width: 8, height: 8 }}
            />
          </div>
        </div>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          style={{ background: '#38bdf8', width: 8, height: 8 }}
        />
      )}
    </div>
  );
};
