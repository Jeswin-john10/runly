import React, { useState } from 'react';
import { Workflow } from '../../models/Workflow';
import { Play, X } from 'lucide-react';

interface ParameterDialogProps {
  workflow: Workflow | null;
  onCancel: () => void;
  onSubmit: (parameters: Record<string, any>) => void;
}

export const ParameterDialog: React.FC<ParameterDialogProps> = ({
  workflow,
  onCancel,
  onSubmit
}) => {
  if (!workflow || !workflow.parameters || workflow.parameters.length === 0) return null;

  const [formState, setFormState] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const p of workflow.parameters || []) {
      initial[p.id] = p.default !== undefined ? p.default : '';
    }
    return initial;
  });

  const handleChange = (id: string, value: any) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <span>Run {workflow.name}</span>
            <button type="button" className="btn-icon" onClick={onCancel}>
              <X size={16} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 14 }}>
              Provide parameter values before executing this workflow.
            </p>

            {workflow.parameters.map((param) => (
              <div key={param.id} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 12 }}>
                  {param.name || param.id}
                </label>
                {param.type === 'select' ? (
                  <select
                    className="input-field"
                    value={formState[param.id] || ''}
                    onChange={(e) => handleChange(param.id, e.target.value)}
                  >
                    {(param.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    className="input-field"
                    value={formState[param.id] || ''}
                    onChange={(e) => handleChange(param.id, e.target.value)}
                    placeholder={param.description || ''}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Play size={14} /> Run Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
