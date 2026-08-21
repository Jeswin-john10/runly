# Contributing to Runly

Thank you for your interest in contributing to **Runly**! We welcome community contributions, bug fixes, action node additions, and improvements.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18.x or v20.x
- **npm**: v9.x or higher
- **Visual Studio Code**: v1.80.0 or higher

### Steps
1. Fork the repository on GitHub: [https://github.com/Jeswin-john10/runly](https://github.com/Jeswin-john10/runly)
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/runly.git
   cd runly
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the extension and webview bundle:
   ```bash
   npm run build
   ```
5. Run the extension in development mode:
   - Open the repository folder in VS Code (`code .`).
   - Press **`F5`** to launch the **Extension Development Host**.
   - Inside the new VS Code window, open a workspace and click the **Runly** icon on the Activity Bar or press **`Ctrl+Alt+R`**.

---

## 🧪 Testing & Validation

Before submitting changes, ensure all checks pass:

```bash
# Type check and linting
npm run lint

# Compile extension and webview
npm run build

# Run unit tests
npm test

# Package VSIX to ensure build completeness
npm run package
```

---

## 🌿 Branching & Commit Guidelines

- **Branch Naming**:
  - `feat/<feature-name>` (e.g. `feat/docker-compose-node`)
  - `fix/<bug-name>` (e.g. `fix/windows-path-delimiter`)
  - `docs/<doc-name>` (e.g. `docs/update-readme`)

- **Commit Messages**: Follow Conventional Commits:
  - `feat: add parallel execution branch node`
  - `fix: handle spaces in workspace file paths`
  - `docs: clarify template usage in README`
  - `test: add unit tests for condition evaluation`

---

## 📬 Submitting a Pull Request

1. Push your changes to your feature branch.
2. Open a Pull Request against the `main` branch of [https://github.com/Jeswin-john10/runly](https://github.com/Jeswin-john10/runly).
3. Fill out the pull request template with description, testing performed, and screenshots if UI changes were made.
4. Ensure CI tests pass.

---

## 💬 Support & Inquiries

For questions or developer support, contact:
- **Email**: [support.runly@gmail.com](mailto:support.runly@gmail.com)
- **GitHub Issues**: [https://github.com/Jeswin-john10/runly/issues](https://github.com/Jeswin-john10/runly/issues)
