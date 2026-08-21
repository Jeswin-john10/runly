import { ExecutionContext } from './ExecutionContext';
import { ActionExecutor } from './ActionExecutor';
import { ConditionEngine } from './ConditionEngine';
import { WorkflowNode } from '../models/Node';
import { WorkflowEdge } from '../models/Edge';
import { NodeExecutionState } from '../models/Execution';

export class WorkflowRunner {
  private context: ExecutionContext;
  private onProgress: (context: ExecutionContext) => void;

  constructor(context: ExecutionContext, onProgress: (context: ExecutionContext) => void) {
    this.context = context;
    this.onProgress = onProgress;
  }

  public async run(): Promise<ExecutionContext> {
    this.context.status = 'RUNNING';
    this.context.addLog(`[Workflow] Started executing "${this.context.workflow.name}"`);
    this.notifyProgress();

    const { nodes, edges } = this.context.workflow;

    if (!nodes || nodes.length === 0) {
      this.context.status = 'SUCCESS';
      this.context.addLog('[Workflow] Workflow has no nodes to execute.');
      this.context.endTime = new Date().toISOString();
      this.notifyProgress();
      return this.context;
    }

    // Identify start nodes (start node or nodes with no incoming edges)
    const incomingEdgeCountMap = new Map<string, number>();
    for (const node of nodes) {
      incomingEdgeCountMap.set(node.id, 0);
    }
    for (const edge of edges) {
      incomingEdgeCountMap.set(edge.target, (incomingEdgeCountMap.get(edge.target) || 0) + 1);
    }

    let startNodes = nodes.filter((n) => n.type === 'start');
    if (startNodes.length === 0) {
      startNodes = nodes.filter((n) => incomingEdgeCountMap.get(n.id) === 0);
    }
    if (startNodes.length === 0 && nodes.length > 0) {
      startNodes = [nodes[0]];
    }

    // Traverse DAG using BFS / topological order queue
    const queue: string[] = startNodes.map((n) => n.id);
    const executedNodeIds = new Set<string>();

    while (queue.length > 0) {
      if (this.context.isCancelled) {
        this.context.status = 'CANCELLED';
        break;
      }

      const nodeId = queue.shift()!;
      if (executedNodeIds.has(nodeId)) {
        continue;
      }

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        continue;
      }

      executedNodeIds.add(nodeId);

      if (node.disabled) {
        this.context.setNodeStatus(nodeId, 'SKIPPED', {
          output: 'Node disabled by user'
        });
        this.context.addLog(`[Node: ${node.label || node.id}] Status: SKIPPED (disabled)`);
        this.notifyProgress();

        // Queue next connected nodes
        const outEdges = edges.filter((e) => e.source === nodeId);
        for (const edge of outEdges) {
          queue.push(edge.target);
        }
        continue;
      }

      const nodeStartTime = Date.now();
      this.context.setNodeStatus(nodeId, 'RUNNING', { startTime: nodeStartTime });
      this.context.addLog(`[Node: ${node.label || node.id}] Status: RUNNING`);
      this.notifyProgress();

      let nodeSuccess = true;
      let outputResult: any;
      let errorMessage = '';

      try {
        if (node.type === 'condition') {
          const incomingEdges = edges.filter((e) => e.target === nodeId);
          const prevNodeId = incomingEdges.length > 0 ? incomingEdges[0].source : undefined;
          const prevNodeState = prevNodeId ? this.context.nodeStates[prevNodeId] : undefined;

          const condType = node.config?.conditionType || 'previousSuccess';
          const targetVal = node.config?.targetValue;
          const isConditionMet = ConditionEngine.evaluate(
            condType,
            targetVal,
            prevNodeState,
            this.context.parameters,
            this.context.workflow.variables
          );

          this.context.addLog(
            `[Condition Node: ${node.label || node.id}] Evaluated "${condType}" => ${isConditionMet ? 'TRUE' : 'FALSE'}`
          );

          outputResult = { conditionResult: isConditionMet };
          nodeSuccess = true;

          // Branching edge selection based on handles
          const outEdges = edges.filter((e) => e.source === nodeId);
          for (const edge of outEdges) {
            const handle = edge.sourceHandle?.toLowerCase() || '';
            if (isConditionMet) {
              if (handle === 'true' || handle === 'success' || handle === 'default' || !handle) {
                queue.push(edge.target);
              }
            } else {
              if (handle === 'false' || handle === 'fail') {
                queue.push(edge.target);
              }
            }
          }
        } else {
          outputResult = await ActionExecutor.executeNode(
            node,
            this.context.parameters,
            this.context.workflow.variables || {},
            (logMsg) => {
              this.context.addLog(`[${node.label || node.id}] ${logMsg}`);
              this.notifyProgress();
            },
            {
              isCancelled: this.context.isCancelled,
              onCancel: (cb) => this.context.onCancel(cb)
            },
            this.context.activeProcesses
          );

          // Queue next connected nodes
          const outEdges = edges.filter((e) => e.source === nodeId);
          for (const edge of outEdges) {
            queue.push(edge.target);
          }
        }
      } catch (err: any) {
        nodeSuccess = false;
        errorMessage = err.message || String(err);
        this.context.addLog(`[Node Failure: ${node.label || node.id}] ${errorMessage}`);
      }

      const nodeEndTime = Date.now();
      const durationMs = nodeEndTime - nodeStartTime;

      if (nodeSuccess) {
        this.context.setNodeStatus(nodeId, 'SUCCESS', {
          endTime: nodeEndTime,
          durationMs,
          output: typeof outputResult === 'string' ? outputResult : JSON.stringify(outputResult)
        });
      } else {
        this.context.setNodeStatus(nodeId, 'FAILED', {
          endTime: nodeEndTime,
          durationMs,
          error: errorMessage
        });

        // Error handling strategy
        const shouldContinue = node.continueOnError || node.config?.onError === 'continue';
        if (shouldContinue) {
          this.context.addLog(`[Workflow] Continuing execution despite failure at node "${node.label || node.id}" (continueOnError: true).`);
        } else {
          this.context.status = 'FAILED';
          this.context.addLog(`[Workflow] Stopped execution due to failure at node "${node.label || node.id}".`);

          // Mark remaining queued nodes as SKIPPED
          for (const qId of queue) {
            this.context.setNodeStatus(qId, 'SKIPPED');
          }
          break;
        }
      }

      this.notifyProgress();
    }

    if (this.context.status === 'RUNNING') {
      const anyFailed = Object.values(this.context.nodeStates).some((s) => s.status === 'FAILED');
      this.context.status = anyFailed ? 'FAILED' : 'SUCCESS';
    }

    this.context.endTime = new Date().toISOString();
    const startMs = new Date(this.context.startTime).getTime();
    const endMs = new Date(this.context.endTime).getTime();
    this.context.durationMs = endMs - startMs;

    this.context.addLog(`[Workflow] Execution finished with status: ${this.context.status} (Elapsed: ${(this.context.durationMs / 1000).toFixed(1)}s)`);
    this.notifyProgress();

    return this.context;
  }

  private notifyProgress(): void {
    if (this.onProgress) {
      this.onProgress(this.context);
    }
  }
}
