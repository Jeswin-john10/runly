import React from 'react';
import { Workflow } from '../../models/Workflow';
import { AlertTriangle, X } from 'lucide-react';

interface SecurityWarningModalProps {
  workflow: Workflow | null;
  onCancel: () => void;
  onReview: () => void;
  onTrustAndRun: () => void;
}

export const SecurityWarningModal: React.FC<SecurityWarningModalProps> = ({
  workflow,
  onCancel,
  onReview,
  onTrustAndRun
}) => {
  if (!workflow) return null;

  const commandNodes = workflow.nodes.filter(
    (n) => n.type === 'command' || n.type === 'terminal' || n.type === 'script'
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d29922' }}>
            <AlertTriangle size={18} />
            <span>Security Warning: Executable Commands</span>
          </div>
          <button className="btn-icon" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: 12 }}>
            This imported workflow contains executable shell commands. Please inspect the commands
            before running them on your system.
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              fontSize: 12,
              fontFamily: 'monospace',
              marginBottom: 14
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--fg-muted)', marginBottom: 6 }}>
              FOUND COMMANDS ({commandNodes.length}):
            </div>
            {commandNodes.map((n) => (
              <div key={n.id} style={{ marginBottom: 4 }}>
                • <strong>{n.label}</strong>: {n.config?.command || 'Terminal / Script'}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-secondary" onClick={onReview}>
            Review Workflow
          </button>
          <button className="btn btn-primary" onClick={onTrustAndRun}>
            Trust & Run
          </button>
        </div>
      </div>
    </div>
  );
};
