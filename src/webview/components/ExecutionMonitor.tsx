import React, { useRef, useEffect } from 'react';
import { ExecutionContext } from '../../engine/ExecutionContext';
import { ExecutionRecord } from '../../models/Execution';
import {
  Square,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Terminal,
  MinusCircle
} from 'lucide-react';

interface ExecutionMonitorProps {
  execution: ExecutionRecord | ExecutionContext | null;
  onStop: () => void;
  onRetry: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  execution,
  onStop,
  onRetry
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [execution?.logs]);

  if (!execution) {
    return (
      <div
        className="flex-center-center"
        style={{
          height: '100%',
          color: 'var(--fg-muted)'
        }}
      >
        <Terminal size={36} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 600 }}>No workflow active or selected</div>
        <p style={{ fontSize: 12, marginTop: 4 }}>
          Run a workflow from the dashboard to monitor its live execution logs.
        </p>
      </div>
    );
  }

  const isRunning = execution.status === 'RUNNING';
  const nodeStates = execution.nodeStates || {};
  const logs = execution.logs || [];

  const renderBadge = (status: string) => {
    if (status === 'RUNNING') {
      return <span className="badge badge-running"><Loader2 size={10} className="animate-spin" style={{ marginRight: 4 }} /> Running</span>;
    }
    if (status === 'SUCCESS') {
      return <span className="badge badge-success"><CheckCircle2 size={10} style={{ marginRight: 4 }} /> Success</span>;
    }
    if (status === 'FAILED') {
      return <span className="badge badge-failed"><XCircle size={10} style={{ marginRight: 4 }} /> Failed</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="badge badge-failed">Cancelled</span>;
    }
    if (status === 'SKIPPED') {
      return <span className="badge badge-queued"><MinusCircle size={10} style={{ marginRight: 4 }} /> Skipped</span>;
    }
    return <span className="badge badge-queued">Queued</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Header Summary Bar */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {execution.workflowName || 'Workflow Execution'}
            </span>
            {renderBadge(execution.status)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
            Started: {new Date(execution.startTime).toLocaleTimeString()} • Duration:{' '}
            {((execution.durationMs || 0) / 1000).toFixed(1)}s
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isRunning ? (
            <button className="btn btn-danger" onClick={onStop}>
              <Square size={14} /> Stop Workflow
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={onRetry}>
              <RotateCcw size={14} /> Re-Run
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Step-by-Step Node Execution Tree */}
        <div
          style={{
            width: 280,
            borderRight: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            padding: 12,
            overflowY: 'auto'
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 10, color: 'var(--fg-muted)' }}>
            WORKFLOW STEPS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(nodeStates).map(([nodeId, state]) => (
              <div
                key={nodeId}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 12 }}>{nodeId}</div>
                  {state.durationMs !== undefined && (
                    <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />
                      {(state.durationMs / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>
                <div>{renderBadge(state.status)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Output Logs Terminal Console */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f0f10' }}>
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Terminal size={14} /> OUTPUT LOGS
          </div>

          <div
            ref={logContainerRef}
            style={{
              flex: 1,
              padding: '12px 16px',
              overflowY: 'auto',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 12,
              lineHeight: 1.6,
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: 'var(--fg-muted)' }}>Waiting for execution logs...</span>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} style={{ color: line.includes('[STDERR]') ? '#f85149' : 'inherit' }}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
