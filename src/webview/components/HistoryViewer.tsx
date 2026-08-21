import React from 'react';
import { ExecutionRecord } from '../../models/Execution';
import { Trash2, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

interface HistoryViewerProps {
  history: ExecutionRecord[];
  onClearHistory: () => void;
  onSelectRecord: (record: ExecutionRecord) => void;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({
  history,
  onClearHistory,
  onSelectRecord
}) => {
  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto', maxWidth: 1000, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Execution History</h2>
          <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
            Local execution run history and step logs
          </p>
        </div>

        {history.length > 0 && (
          <button className="btn btn-secondary" onClick={onClearHistory}>
            <Trash2 size={14} /> Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 8,
            border: '1px solid var(--border)'
          }}
        >
          <Clock size={36} style={{ color: 'var(--fg-muted)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>No execution history</h3>
          <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
            Executed workflows will record local run status and output logs here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((record) => (
            <div
              key={record.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {record.status === 'SUCCESS' ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <XCircle size={18} className="text-rose-500" />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{record.workflowName}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {new Date(record.startTime).toLocaleString()} • Duration: {(record.durationMs / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className={`badge ${
                    record.status === 'SUCCESS' ? 'badge-success' : 'badge-failed'
                  }`}
                >
                  {record.status}
                </span>

                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: 11 }}
                  onClick={() => onSelectRecord(record)}
                >
                  <Eye size={12} /> View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
