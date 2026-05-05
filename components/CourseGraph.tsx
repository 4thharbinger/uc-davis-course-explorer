"use client"

import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '@/store/useGraphStore';
import { Course } from '@/lib/course';
import CourseNode from './CourseNode';
;
const nodeTypes = {
  course: CourseNode, 
};

export default function CourseGraph({courses} : {courses : Course[] } ) {
  // Subscribe to the Zustand store
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const setInspectedCourse = useGraphStore((state) => state.setInspectedCourse);
  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    // node.data contains all the course info (name, description, prereqs)
    setInspectedCourse(node.data); 
  };

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setInspectedCourse(null)}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}