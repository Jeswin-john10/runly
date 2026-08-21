import React from 'react';
import { WorkflowNode } from '../../models/Node';
import { Trash2, X } from 'lucide-react';

interface NodePropertiesPanelProps {
  node: WorkflowNode | null;
  onUpdateNode: (updatedNode: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onClose: () => void;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  node,
  onUpdateNode,
  onDeleteNode,
  onClose
}) => {
  if (!node) return null;

  const handleConfigChange = (key: string, value: any) => {
    onUpdateNode({
      ...node,
      config: {
        ...node.config,
        [key]: value
      }
    });
  };

  const handleLabelChange = (label: string) => {
    onUpdateNode({
      ...node,
      label
    });
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'start':
        return <p style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Workflow entry point node.</p>;

      case 'command':
        return (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Shell Command
              </label>
              <textarea
                className="input-field"
                rows={3}
                value={node.config.command || ''}
                onChange={(e) => handleConfigChange('command', e.target.value)}
                placeholder="npm run dev"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Working Directory
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.workingDirectory || ''}
                onChange={(e) => handleConfigChange('workingDirectory', e.target.value)}
                placeholder="${workspaceFolder}"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                On Error Strategy
              </label>
              <select
                className="input-field"
                value={node.config.onError || 'stop'}
                onChange={(e) => handleConfigChange('onError', e.target.value)}
              >
                <option value="stop">Stop Workflow</option>
                <option value="continue">Continue Execution</option>
              </select>
            </div>
          </>
        );

      case 'terminal':
        return (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Terminal Name
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.name || ''}
                onChange={(e) => handleConfigChange('name', e.target.value)}
                placeholder="React Dev Server"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Command to Send
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.command || ''}
                onChange={(e) => handleConfigChange('command', e.target.value)}
                placeholder="npm start"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Working Directory
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.workingDirectory || ''}
                onChange={(e) => handleConfigChange('workingDirectory', e.target.value)}
                placeholder="${workspaceFolder}"
              />
            </div>
          </>
        );

      case 'file':
        return (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Action
              </label>
              <select
                className="input-field"
                value={node.config.action || 'open'}
                onChange={(e) => handleConfigChange('action', e.target.value)}
              >
                <option value="open">Open File</option>
                <option value="reveal">Reveal in Explorer</option>
                <option value="create">Create File</option>
                <option value="save">Save File / Workspace</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                File Path
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.path || ''}
                onChange={(e) => handleConfigChange('path', e.target.value)}
                placeholder="src/App.tsx"
              />
            </div>
            {node.config.action === 'create' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                  File Content
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={node.config.content || ''}
                  onChange={(e) => handleConfigChange('content', e.target.value)}
                />
              </div>
            )}
          </>
        );

      case 'url':
        return (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
              Browser URL
            </label>
            <input
              type="text"
              className="input-field"
              value={node.config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="http://localhost:5173"
            />
          </div>
        );

      case 'delay':
        return (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
              Duration (milliseconds)
            </label>
            <input
              type="number"
              className="input-field"
              value={node.config.durationMs || 1000}
              onChange={(e) => handleConfigChange('durationMs', parseInt(e.target.value, 10) || 1000)}
            />
          </div>
        );

      case 'notification':
        return (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Notification Type
              </label>
              <select
                className="input-field"
                value={node.config.type || 'info'}
                onChange={(e) => handleConfigChange('type', e.target.value)}
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Message
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Development server ready"
              />
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Condition Type
              </label>
              <select
                className="input-field"
                value={node.config.conditionType || 'previousSuccess'}
                onChange={(e) => handleConfigChange('conditionType', e.target.value)}
              >
                <option value="previousSuccess">Previous Action Succeeded</option>
                <option value="previousFailed">Previous Action Failed</option>
                <option value="exitCode">Exit Code Equals</option>
                <option value="fileExists">File Exists</option>
                <option value="folderExists">Folder Exists</option>
                <option value="envExists">Environment Variable Exists</option>
                <option value="os">OS / Platform Equals</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
                Target Value / Path / Code
              </label>
              <input
                type="text"
                className="input-field"
                value={node.config.targetValue || ''}
                onChange={(e) => handleConfigChange('targetValue', e.target.value)}
                placeholder="Target value or path"
              />
            </div>
          </>
        );

      case 'task':
        return (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
              Task Name
            </label>
            <input
              type="text"
              className="input-field"
              value={node.config.taskName || ''}
              onChange={(e) => handleConfigChange('taskName', e.target.value)}
              placeholder="npm: test"
            />
          </div>
        );

      case 'vscodeCommand':
        return (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
              VS Code Command ID
            </label>
            <input
              type="text"
              className="input-field"
              value={node.config.commandId || ''}
              onChange={(e) => handleConfigChange('commandId', e.target.value)}
              placeholder="workbench.action.files.saveAll"
            />
          </div>
        );

      case 'script':
        return (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
              JavaScript Code
            </label>
            <textarea
              className="input-field"
              rows={6}
              value={node.config.code || ''}
              onChange={(e) => handleConfigChange('code', e.target.value)}
              placeholder="onLog('Custom script running');"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 320,
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13 }}>Node Properties</span>
        <button className="btn-icon" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 11 }}>
            Node Label
          </label>
          <input
            type="text"
            className="input-field"
            value={node.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>

        {renderConfigFields()}
      </div>

      {node.type !== 'start' && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-danger"
            style={{ width: '100%' }}
            onClick={() => onDeleteNode(node.id)}
          >
            <Trash2 size={14} /> Delete Node
          </button>
        </div>
      )}
    </div>
  );
};
