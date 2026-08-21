import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface DetectedProject {
  framework: string;
  label: string;
  description: string;
  recommendedTemplates: string[];
}

export class ProjectDetector {
  public static async detect(): Promise<DetectedProject> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return {
        framework: 'generic',
        label: 'Generic Project',
        description: 'No workspace folder open',
        recommendedTemplates: ['generic-start', 'generic-test', 'generic-build']
      };
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    // Check package.json
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const raw = fs.readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(raw);
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

        if (deps['next']) {
          return {
            framework: 'next',
            label: 'Next.js',
            description: 'Detected Next.js framework',
            recommendedTemplates: ['next-dev', 'next-build', 'next-start']
          };
        }

        if (deps['vite']) {
          return {
            framework: 'vite',
            label: 'Vite',
            description: 'Detected Vite build tool',
            recommendedTemplates: ['vite-dev', 'vite-build', 'vite-preview']
          };
        }

        if (deps['react'] || deps['react-dom']) {
          return {
            framework: 'react',
            label: 'React',
            description: 'Detected React library',
            recommendedTemplates: ['react-dev', 'react-test', 'react-build']
          };
        }

        return {
          framework: 'node',
          label: 'Node.js',
          description: 'Detected Node.js project',
          recommendedTemplates: ['node-dev', 'node-test', 'node-build']
        };
      } catch (err) {
        console.error('Error reading package.json:', err);
      }
    }

    // Check Python
    if (
      fs.existsSync(path.join(rootPath, 'requirements.txt')) ||
      fs.existsSync(path.join(rootPath, 'pyproject.toml')) ||
      fs.existsSync(path.join(rootPath, 'Pipfile'))
    ) {
      return {
        framework: 'python',
        label: 'Python',
        description: 'Detected Python environment',
        recommendedTemplates: ['python-run', 'python-test', 'python-venv']
      };
    }

    // Check Docker
    if (
      fs.existsSync(path.join(rootPath, 'Dockerfile')) ||
      fs.existsSync(path.join(rootPath, 'docker-compose.yml')) ||
      fs.existsSync(path.join(rootPath, 'docker-compose.yaml'))
    ) {
      return {
        framework: 'docker',
        label: 'Docker',
        description: 'Detected Docker container setup',
        recommendedTemplates: ['docker-build', 'docker-up', 'docker-down']
      };
    }

    // Check Rust
    if (fs.existsSync(path.join(rootPath, 'Cargo.toml'))) {
      return {
        framework: 'rust',
        label: 'Rust',
        description: 'Detected Rust Cargo project',
        recommendedTemplates: ['rust-run', 'rust-test', 'rust-build']
      };
    }

    // Check Go
    if (fs.existsSync(path.join(rootPath, 'go.mod'))) {
      return {
        framework: 'go',
        label: 'Go',
        description: 'Detected Go module',
        recommendedTemplates: ['go-run', 'go-test', 'go-build']
      };
    }

    // Default Generic
    return {
      framework: 'generic',
      label: 'Generic Project',
      description: 'Standard development environment',
      recommendedTemplates: ['generic-start', 'generic-test', 'generic-build']
    };
  }
}
