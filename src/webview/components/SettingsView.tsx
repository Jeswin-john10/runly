import React from 'react';
import { RunlySettings } from '../../storage/SettingsStorage';
import { Settings } from 'lucide-react';

interface SettingsViewProps {
  settings: RunlySettings;
  onUpdateSetting: (key: keyof RunlySettings, value: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSetting
}) => {
  return (
    <div style={{ padding: 24, height: '100%', overflowY: 'auto', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={20} /> Runly Settings
        </h2>
        <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
          Manage extension preferences, execution defaults, and security configurations.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4, fontSize: 13 }}>
            Default Shell
          </label>
          <input
            type="text"
            className="input-field"
            value={settings.defaultShell || ''}
            onChange={(e) => onUpdateSetting('defaultShell', e.target.value)}
            placeholder="e.g. powershell.exe, bash, zsh (leave blank for system default)"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Confirm Imported Workflows</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
              Show security review modal before running imported workflows with executable shell commands.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.confirmImportedWorkflows}
            onChange={(e) => onUpdateSetting('confirmImportedWorkflows', e.target.checked)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Desktop Notifications</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
              Display VS Code notification messages when a workflow completes or fails.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.showNotifications}
            onChange={(e) => onUpdateSetting('showNotifications', e.target.checked)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Store Workflows in Workspace</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
              Save workflows as `.runly/workflows/*.runly.json` inside the project folder for Git versioning.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.useWorkspaceWorkflows}
            onChange={(e) => onUpdateSetting('useWorkspaceWorkflows', e.target.checked)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Smart Framework Suggestions</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
              Auto-detect project dependencies and show recommended workflow templates on dashboard.
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.showTemplateSuggestions}
            onChange={(e) => onUpdateSetting('showTemplateSuggestions', e.target.checked)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 4, fontSize: 13 }}>
            Execution History Retain Limit
          </label>
          <input
            type="number"
            className="input-field"
            value={settings.executionHistoryLimit}
            onChange={(e) => onUpdateSetting('executionHistoryLimit', parseInt(e.target.value, 10) || 50)}
          />
        </div>
      </div>
    </div>
  );
};
