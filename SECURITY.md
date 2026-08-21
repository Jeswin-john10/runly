# Security Policy

## 🛡️ Security Overview

**Runly** executes developer-configured workflow automation tasks, which may include background child processes and shell commands on your local machine. Because workflows can be imported and shared across repositories, security is a core priority of Runly.

---

## 🔒 Security Principles in Runly

1. **Local-First & Zero Cloud Telemetry**:
   Runly executes 100% locally on your machine. It does not transmit workflow contents, commands, code, or execution logs to any external third-party server.

2. **Untrusted Workflow Protection**:
   Imported `.runly.json` files or workflows from untrusted sources trigger a **Security Review Warning Modal** before execution. Users can inspect every executable command and must explicitly approve execution.

3. **Workspace Trust Aware**:
   Runly respects VS Code Workspace Trust settings. In Restricted Mode, automated executable actions are constrained.

4. **Process Tracking & Safe Termination**:
   All child processes spawned during workflow runs are tracked and immediately killed upon user cancellation or extension deactivation to prevent orphaned processes.

5. **No Arbitrary `eval()`**:
   Workflow expressions, conditions, and variable replacements are evaluated using safe AST / token lookup and regex resolution without executing raw unsafe JavaScript strings.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or sensitive bug in Runly, please **do not open a public GitHub issue**.

Instead, report it directly via private email to:

📧 **[support.runly@gmail.com](mailto:support.runly@gmail.com)**

Please include:
- A clear description of the vulnerability
- Reproduction steps or proof of concept
- Affected versions of Runly and VS Code
- Any potential mitigation suggestions

We will review the report promptly and coordinate a patch release.
