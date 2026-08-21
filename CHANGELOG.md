# Changelog

All notable changes to the "runly" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-21

### Added
- **Visual Workflow Builder**: Drag-and-drop node graph canvas powered by React Flow with custom nodes, handles, zoom/pan controls, and auto-layout.
- **Activity Bar & Sidebar Tree View**: Native VS Code Activity Bar icon and tree view with Favorites, Recent, Workspace Workflows, and Preset Templates.
- **11 Built-in Action Nodes**:
  - `start`: Workflow DAG entry point.
  - `command`: Background process execution with process tracking, timeout, and custom env vars.
  - `terminal`: Interactive terminal sessions with command execution and terminal reuse.
  - `file`: Create, open, reveal, and save files.
  - `url`: Real browser navigation with variable substitution.
  - `task`: VS Code workspace task execution.
  - `vscodeCommand`: Native VS Code command dispatch.
  - `delay`: Asynchronous pauses with cancellation support.
  - `notification`: VS Code toast alerts (info, success, warning, error).
  - `condition`: Branching DAG evaluation on previous step status, exit codes, file existence, OS, and environment variables.
  - `script`: Safe custom JavaScript snippet execution.
- **Git-Friendly Storage**: Automatic local storage in `.runly/workflows/<id>.runly.json`.
- **JSON Schema Validation**: Complete `schemas/workflow.schema.json` for validation and auto-complete in VS Code.
- **Security Review Modal**: Automatic inspection prompt for imported workflows with untrusted executable commands.
- **Live Terminal Log Monitor**: Real-time progress badges and streaming process stdout/stderr logs.
- **Project Detection**: Smart detection of React, Vite, Next.js, Node.js, Python, Rust, Go, and Docker with 1-click template instantiation.
- **Unit Test Suite**: Automated engine tests for variable resolution, condition branching, and cancellation.
