import React, { useState } from 'react';
import { Workflow } from '../../models/Workflow';
import { DetectedProject } from '../../detection/ProjectDetector';
import {
  Play,
  Edit3,
  Plus,
  Copy,
  Download,
  Trash2,
  Star,
  Search,
  Zap,
  Sparkles,
  Layers,
  Upload
} from 'lucide-react';

interface DashboardProps {
  workflows: Workflow[];
  templates: Workflow[];
  detectedProject: DetectedProject | null;
  onSelectWorkflow: (workflow: Workflow) => void;
  onRunWorkflow: (workflow: Workflow) => void;
  onNewWorkflow: () => void;
  onDuplicateWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
  onExportWorkflow: (id: string) => void;
  onImportWorkflow: () => void;
  onToggleFavorite: (workflow: Workflow) => void;
  onUseTemplate: (template: Workflow) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  workflows,
  templates,
  detectedProject,
  onSelectWorkflow,
  onRunWorkflow,
  onNewWorkflow,
  onDuplicateWorkflow,
  onDeleteWorkflow,
  onExportWorkflow,
  onImportWorkflow,
  onToggleFavorite,
  onUseTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory === 'favorites') return matchesSearch && w.isFavorite;
    return matchesSearch;
  });

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* Top Banner: Detected Project Recommendations */}
      {detectedProject && (
        <div
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 8,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {detectedProject.label} Project Detected
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                {detectedProject.description}. Recommended workflow templates ready to run.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {templates
              .filter(
                (t) =>
                  t.framework === detectedProject.framework ||
                  detectedProject.recommendedTemplates.includes(t.id)
              )
              .slice(0, 2)
              .map((t) => (
                <button
                  key={t.id}
                  className="btn btn-primary"
                  onClick={() => onUseTemplate(t)}
                >
                  <Sparkles size={14} /> Use {t.name.replace(/^[^\w\s]+/, '').trim()}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your Workflows</h2>
          <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
            Build, execute, and manage local project automation workflows
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onImportWorkflow}>
            <Upload size={14} /> Import Workflow
          </button>
          <button className="btn btn-primary" onClick={onNewWorkflow}>
            <Plus size={14} /> New Workflow
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fg-muted)'
            }}
          />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: 32 }}
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`nav-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Workflows ({workflows.length})
          </button>
          <button
            className={`nav-tab ${selectedCategory === 'favorites' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('favorites')}
          >
            ⭐ Favorites ({workflows.filter((w) => w.isFavorite).length})
          </button>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 8,
            border: '1px solid var(--border)'
          }}
        >
          <Layers size={40} style={{ color: 'var(--fg-muted)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>No workflows found</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4, marginBottom: 16 }}>
            Build your first developer workflow or select a template preset.
          </p>
          <button className="btn btn-primary" onClick={onNewWorkflow}>
            <Plus size={14} /> Create Workflow
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
            marginBottom: 40
          }}
        >
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, flex: 1, paddingRight: 8 }}>
                    {workflow.name}
                  </div>
                  <button
                    className="btn-icon"
                    onClick={() => onToggleFavorite(workflow)}
                    title="Toggle Favorite"
                  >
                    <Star
                      size={16}
                      style={{
                        color: workflow.isFavorite ? '#eab308' : 'var(--fg-muted)',
                        fill: workflow.isFavorite ? '#eab308' : 'transparent'
                      }}
                    />
                  </button>
                </div>

                {workflow.description && (
                  <p
                    className="line-clamp-2"
                    style={{
                      fontSize: 12,
                      color: 'var(--fg-muted)',
                      marginBottom: 12
                    }}
                  >
                    {workflow.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  <span className="badge badge-queued">{workflow.nodes.length} Steps</span>
                  {workflow.shortcut && (
                    <span className="badge badge-running">{workflow.shortcut}</span>
                  )}
                  {workflow.framework && (
                    <span className="badge badge-success">{workflow.framework}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 12,
                  marginTop: 8
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn-icon"
                    title="Edit Workflow"
                    onClick={() => onSelectWorkflow(workflow)}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn-icon"
                    title="Duplicate Workflow"
                    onClick={() => onDuplicateWorkflow(workflow.id)}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="btn-icon"
                    title="Export Workflow (.runly.json)"
                    onClick={() => onExportWorkflow(workflow.id)}
                  >
                    <Download size={14} />
                  </button>
                  <button
                    className="btn-icon"
                    title="Delete Workflow"
                    onClick={() => onDeleteWorkflow(workflow.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => onRunWorkflow(workflow)}
                >
                  <Play size={14} /> Run
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preset Templates Gallery Section */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Template Gallery</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12
          }}
        >
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{tpl.name}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                  {tpl.nodes.length} steps • {tpl.framework}
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: 11 }}
                onClick={() => onUseTemplate(tpl)}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
