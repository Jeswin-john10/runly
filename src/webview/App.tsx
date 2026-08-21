import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { ExecutionMonitor } from './components/ExecutionMonitor';
import { HistoryViewer } from './components/HistoryViewer';
import { SettingsView } from './components/SettingsView';
import { SecurityWarningModal } from './components/SecurityWarningModal';
import { ParameterDialog } from './components/ParameterDialog';
import { Workflow } from '../models/Workflow';
import { ExecutionRecord } from '../models/Execution';
import { DetectedProject } from '../detection/ProjectDetector';
import { RunlySettings } from '../storage/SettingsStorage';
import { BUILTIN_TEMPLATES } from '../templates/templates';
import {
  PlayCircle,
  LayoutDashboard,
  Layers,
  Terminal,
  History,
  Settings,
  Plus
} from 'lucide-react';
import './styles/vscode.css';

// Declare VS Code Webview API
declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscodeApi = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'canvas' | 'monitor' | 'history' | 'settings'>('dashboard');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [settings, setSettings] = useState<RunlySettings>({
    defaultShell: '',
    confirmImportedWorkflows: true,
    showNotifications: true,
    executionHistoryLimit: 50,
    autoSaveWorkflows: true,
    useWorkspaceWorkflows: true,
    showTemplateSuggestions: true
  });
  const [detectedProject, setDetectedProject] = useState<DetectedProject | null>(null);

  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [activeExecution, setActiveExecution] = useState<ExecutionRecord | null>(null);

  const [securityModalWorkflow, setSecurityModalWorkflow] = useState<Workflow | null>(null);
  const [parameterDialogWorkflow, setParameterDialogWorkflow] = useState<Workflow | null>(null);

  // Initial data load via IPC
  useEffect(() => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'getWorkflows' });
      vscodeApi.postMessage({ command: 'getHistory' });
      vscodeApi.postMessage({ command: 'getSettings' });
      vscodeApi.postMessage({ command: 'getDetectedProject' });
    }

    const messageListener = (event: MessageEvent) => {
      const msg = event.data;
      switch (msg.command) {
        case 'workflowsLoaded':
          setWorkflows(msg.payload || []);
          break;
        case 'historyLoaded':
          setHistory(msg.payload || []);
          break;
        case 'settingsLoaded':
          setSettings(msg.payload);
          break;
        case 'projectDetected':
          setDetectedProject(msg.payload);
          break;
        case 'executionProgress':
          setActiveExecution(msg.payload);
          break;
        case 'executionFinished':
          setActiveExecution(msg.payload);
          // Refresh history
          if (vscodeApi) vscodeApi.postMessage({ command: 'getHistory' });
          break;
        case 'securityWarning':
          setSecurityModalWorkflow(msg.payload.workflow);
          break;
        case 'openWorkflow':
          setActiveWorkflow(msg.payload);
          setActiveTab('canvas');
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  }, []);

  const handleNewWorkflow = () => {
    const newWf: Workflow = {
      version: 1,
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: 'Custom development automation workflow',
      category: 'General',
      nodes: [
        {
          id: 'start',
          type: 'start',
          label: 'START',
          position: { x: 100, y: 100 },
          config: {}
        }
      ],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setActiveWorkflow(newWf);
    setActiveTab('canvas');
  };

  const handleSaveWorkflow = (wf: Workflow) => {
    setActiveWorkflow(wf);
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'saveWorkflow', payload: wf });
    }
    // Update local state
    setWorkflows((prev) => {
      const idx = prev.findIndex((w) => w.id === wf.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = wf;
        return copy;
      }
      return [...prev, wf];
    });
  };

  const handleToggleFavorite = (wf: Workflow) => {
    const updated = { ...wf, isFavorite: !wf.isFavorite };
    handleSaveWorkflow(updated);
  };

  const handleRunWorkflow = (wf: Workflow) => {
    // Check if parameter values are needed
    if (wf.parameters && wf.parameters.length > 0) {
      setParameterDialogWorkflow(wf);
      return;
    }
    executeWorkflowNow(wf, {});
  };

  const executeWorkflowNow = (wf: Workflow, parameters: Record<string, any>) => {
    setActiveExecution({
      id: `exec-${Date.now()}`,
      workflowId: wf.id,
      workflowName: wf.name,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      durationMs: 0,
      logs: [`[Workflow] Initiating run for ${wf.name}...`],
      nodeStates: {}
    });
    setActiveTab('monitor');

    if (vscodeApi) {
      vscodeApi.postMessage({
        command: 'runWorkflow',
        payload: { workflow: wf, parameters }
      });
    }
  };

  const handleStopWorkflow = () => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'stopWorkflow' });
    }
  };

  const handleDuplicateWorkflow = (id: string) => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'duplicateWorkflow', payload: { id } });
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'deleteWorkflow', payload: { id } });
    }
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  const handleExportWorkflow = (id: string) => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'exportWorkflow', payload: { id } });
    }
  };

  const handleImportWorkflow = () => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'importWorkflow' });
    }
  };

  const handleUseTemplate = (tpl: Workflow) => {
    const newWf: Workflow = {
      ...JSON.parse(JSON.stringify(tpl)),
      id: `workflow-${Date.now()}`,
      name: `${tpl.name.replace(/^[^\w\s]+/, '').trim()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    handleSaveWorkflow(newWf);
    setActiveWorkflow(newWf);
    setActiveTab('canvas');
  };

  const handleClearHistory = () => {
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'clearHistory' });
    }
    setHistory([]);
  };

  const handleUpdateSetting = (key: keyof RunlySettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    if (vscodeApi) {
      vscodeApi.postMessage({ command: 'saveSettings', payload: { key, value } });
    }
  };

  return (
    <div className="runly-app">
      {/* Top Navbar */}
      <div className="navbar">
        <div className="brand">
          <PlayCircle size={20} className="brand-logo" />
          <span>RUNLY</span>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'canvas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canvas')}
          >
            <Layers size={14} /> Builder Canvas
          </button>
          <button
            className={`nav-tab ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <Terminal size={14} /> Execution Monitor
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={14} /> History
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={14} /> Settings
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            workflows={workflows}
            templates={BUILTIN_TEMPLATES}
            detectedProject={detectedProject}
            onSelectWorkflow={(wf) => {
              setActiveWorkflow(wf);
              setActiveTab('canvas');
            }}
            onRunWorkflow={handleRunWorkflow}
            onNewWorkflow={handleNewWorkflow}
            onDuplicateWorkflow={handleDuplicateWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            onExportWorkflow={handleExportWorkflow}
            onImportWorkflow={handleImportWorkflow}
            onToggleFavorite={handleToggleFavorite}
            onUseTemplate={handleUseTemplate}
          />
        )}

        {activeTab === 'canvas' && (
          <WorkflowCanvas
            workflow={
              activeWorkflow || {
                version: 1,
                id: 'default',
                name: 'New Workflow',
                nodes: [
                  {
                    id: 'start',
                    type: 'start',
                    label: 'START',
                    position: { x: 100, y: 100 },
                    config: {}
                  }
                ],
                edges: []
              }
            }
            onSave={handleSaveWorkflow}
            onRun={handleRunWorkflow}
            onStop={handleStopWorkflow}
            isExecuting={activeExecution?.status === 'RUNNING'}
          />
        )}

        {activeTab === 'monitor' && (
          <ExecutionMonitor
            execution={activeExecution}
            onStop={handleStopWorkflow}
            onRetry={() => {
              if (activeWorkflow) handleRunWorkflow(activeWorkflow);
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryViewer
            history={history}
            onClearHistory={handleClearHistory}
            onSelectRecord={(rec) => {
              setActiveExecution(rec);
              setActiveTab('monitor');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView settings={settings} onUpdateSetting={handleUpdateSetting} />
        )}
      </div>

      {/* Security Warning Modal for untrusted command confirmation */}
      <SecurityWarningModal
        workflow={securityModalWorkflow}
        onCancel={() => setSecurityModalWorkflow(null)}
        onReview={() => {
          if (securityModalWorkflow) {
            setActiveWorkflow(securityModalWorkflow);
            setActiveTab('canvas');
          }
          setSecurityModalWorkflow(null);
        }}
        onTrustAndRun={() => {
          if (securityModalWorkflow) {
            executeWorkflowNow(securityModalWorkflow, {});
          }
          setSecurityModalWorkflow(null);
        }}
      />

      {/* Parameters Dialog prior to execution */}
      <ParameterDialog
        workflow={parameterDialogWorkflow}
        onCancel={() => setParameterDialogWorkflow(null)}
        onSubmit={(params) => {
          if (parameterDialogWorkflow) {
            executeWorkflowNow(parameterDialogWorkflow, params);
          }
          setParameterDialogWorkflow(null);
        }}
      />
    </div>
  );
};
