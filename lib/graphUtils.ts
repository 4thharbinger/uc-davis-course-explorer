import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

function extractPrereqCodes(rules: any): string[] {
  if (!rules || !Array.isArray(rules)) return [];
  
  let codes: string[] = [];
  for (const rule of rules) {
    if (rule.type === 'course') codes.push(rule.course);
    if (rule.operands) codes.push(...extractPrereqCodes(rule.operands));
  }
  return codes;
}

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 260, height: 160 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 260 / 2,
        y: nodeWithPosition.y - 160 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function generateEdges(nodes: Node[]): Edge[] {
  const newEdges: Edge[] = [];

  nodes.forEach((targetNode) => {
    console.log(targetNode);
    const prereqCodes = extractPrereqCodes(targetNode.data.prerequisiteRules);

    prereqCodes.forEach((prereqCode) => {
      if (nodes.some(n => n.id === prereqCode)) {
        newEdges.push({
          id: `edge-${prereqCode}-${targetNode.id}`,
          source: prereqCode,
          target: targetNode.id,
          type: 'smoothstep',
          animated: true,     
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      }
    });
  });

  return newEdges;
}