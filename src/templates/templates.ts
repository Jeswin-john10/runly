import { Workflow } from '../models/Workflow';

export const BUILTIN_TEMPLATES: Workflow[] = [
  // React Development
  {
    version: 1,
    id: 'react-dev',
    name: '⚡ React Development',
    description: 'Start React dev server, wait for boot, and open browser.',
    category: 'Development',
    framework: 'react',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'install',
        type: 'command',
        label: 'npm install',
        position: { x: 100, y: 220 },
        config: {
          command: 'npm install',
          workingDirectory: '${workspaceFolder}',
          onError: 'stop'
        }
      },
      {
        id: 'dev',
        type: 'terminal',
        label: 'npm run dev',
        position: { x: 100, y: 340 },
        config: {
          name: 'React Dev Server',
          command: 'npm run dev',
          workingDirectory: '${workspaceFolder}'
        }
      },
      {
        id: 'delay',
        type: 'delay',
        label: 'Wait 3s',
        position: { x: 100, y: 460 },
        config: { durationMs: 3000 }
      },
      {
        id: 'browser',
        type: 'url',
        label: 'Open Browser',
        position: { x: 100, y: 580 },
        config: { url: 'http://localhost:5173' }
      },
      {
        id: 'notify',
        type: 'notification',
        label: 'Ready Notification',
        position: { x: 100, y: 700 },
        config: {
          type: 'success',
          message: 'React development server is running on http://localhost:5173'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'install' },
      { id: 'e2', source: 'install', target: 'dev' },
      { id: 'e3', source: 'dev', target: 'delay' },
      { id: 'e4', source: 'delay', target: 'browser' },
      { id: 'e5', source: 'browser', target: 'notify' }
    ]
  },

  // Vite Development
  {
    version: 1,
    id: 'vite-dev',
    name: '⚡ Vite Development',
    description: 'Launch Vite server & open application in browser.',
    category: 'Development',
    framework: 'vite',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'dev',
        type: 'terminal',
        label: 'npx vite',
        position: { x: 100, y: 220 },
        config: {
          name: 'Vite Server',
          command: 'npx vite',
          workingDirectory: '${workspaceFolder}'
        }
      },
      {
        id: 'delay',
        type: 'delay',
        label: 'Wait 2s',
        position: { x: 100, y: 340 },
        config: { durationMs: 2000 }
      },
      {
        id: 'browser',
        type: 'url',
        label: 'Open Browser',
        position: { x: 100, y: 460 },
        config: { url: 'http://localhost:5173' }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'dev' },
      { id: 'e2', source: 'dev', target: 'delay' },
      { id: 'e3', source: 'delay', target: 'browser' }
    ]
  },

  // Next.js Development
  {
    version: 1,
    id: 'next-dev',
    name: '⚡ Next.js Development',
    description: 'Run next dev server and launch localhost:3000.',
    category: 'Development',
    framework: 'next',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'dev',
        type: 'terminal',
        label: 'npm run dev',
        position: { x: 100, y: 220 },
        config: {
          name: 'Next.js Server',
          command: 'npm run dev',
          workingDirectory: '${workspaceFolder}'
        }
      },
      {
        id: 'delay',
        type: 'delay',
        label: 'Wait 4s',
        position: { x: 100, y: 340 },
        config: { durationMs: 4000 }
      },
      {
        id: 'browser',
        type: 'url',
        label: 'Open Browser',
        position: { x: 100, y: 460 },
        config: { url: 'http://localhost:3000' }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'dev' },
      { id: 'e2', source: 'dev', target: 'delay' },
      { id: 'e3', source: 'delay', target: 'browser' }
    ]
  },

  // Node Test & Build
  {
    version: 1,
    id: 'node-test-build',
    name: '🧪 Test & Build Node.js',
    description: 'Run automated unit tests, build project if tests pass.',
    category: 'CI/CD',
    framework: 'node',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'test',
        type: 'command',
        label: 'npm test',
        position: { x: 100, y: 220 },
        config: {
          command: 'npm test',
          workingDirectory: '${workspaceFolder}',
          onError: 'stop'
        }
      },
      {
        id: 'condition',
        type: 'condition',
        label: 'Tests Passed?',
        position: { x: 100, y: 340 },
        config: { conditionType: 'previousSuccess' }
      },
      {
        id: 'build',
        type: 'command',
        label: 'npm run build',
        position: { x: 100, y: 460 },
        config: {
          command: 'npm run build',
          workingDirectory: '${workspaceFolder}'
        }
      },
      {
        id: 'notify',
        type: 'notification',
        label: 'Success Notification',
        position: { x: 100, y: 580 },
        config: {
          type: 'success',
          message: 'Build completed successfully!'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'test' },
      { id: 'e2', source: 'test', target: 'condition' },
      { id: 'e3', source: 'condition', target: 'build', sourceHandle: 'true' },
      { id: 'e4', source: 'build', target: 'notify' }
    ]
  },

  // Python Run & Test
  {
    version: 1,
    id: 'python-run',
    name: '🐍 Run Python Script',
    description: 'Run main Python script or tests in virtualenv.',
    category: 'Development',
    framework: 'python',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'run',
        type: 'command',
        label: 'python main.py',
        position: { x: 100, y: 220 },
        config: {
          command: 'python main.py',
          workingDirectory: '${workspaceFolder}'
        }
      }
    ],
    edges: [{ id: 'e1', source: 'start', target: 'run' }]
  },

  // Docker Compose Up
  {
    version: 1,
    id: 'docker-up',
    name: '🐳 Docker Compose Up',
    description: 'Spin up local container services using Docker Compose.',
    category: 'DevOps',
    framework: 'docker',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'up',
        type: 'command',
        label: 'docker compose up -d',
        position: { x: 100, y: 220 },
        config: {
          command: 'docker compose up -d',
          workingDirectory: '${workspaceFolder}'
        }
      },
      {
        id: 'notify',
        type: 'notification',
        label: 'Notify Container Ready',
        position: { x: 100, y: 340 },
        config: {
          type: 'info',
          message: 'Docker Compose containers are up and running.'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'up' },
      { id: 'e2', source: 'up', target: 'notify' }
    ]
  },

  // Generic Workflow
  {
    version: 1,
    id: 'generic-start',
    name: '▶ Quick Developer Start',
    description: 'Standard multi-step workflow for developer setup.',
    category: 'General',
    framework: 'generic',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'START',
        position: { x: 100, y: 100 },
        config: {}
      },
      {
        id: 'cmd1',
        type: 'command',
        label: 'npm install',
        position: { x: 100, y: 220 },
        config: { command: 'npm install' }
      },
      {
        id: 'cmd2',
        type: 'terminal',
        label: 'Start Dev Server',
        position: { x: 100, y: 340 },
        config: { command: 'npm start' }
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'cmd1' },
      { id: 'e2', source: 'cmd1', target: 'cmd2' }
    ]
  }
];
