import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange, 
  applyNodeChanges, 
  applyEdgeChanges 
} from '@xyflow/react';
import getCourseInfo from '@/lib/getCourseInfo';
import { generateEdges, getLayoutedElements } from '@/lib/graphUtils';

type GraphState = {
  nodes: Node[];
  edges: Edge[];
  inspectedCourse : any | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addCourse: (course: any) => void;
  clearCourses: () => void;
  setInspectedCourse: (course: any | null) => void;
};

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  inspectedCourse: null,
  
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  clearCourses: () => {
    set({ nodes: [], edges: [] });
  },

  addCourse: async (courseCode : string) => {
    const { nodes } = get();
    const course = await getCourseInfo(courseCode);

    if (course == null) return console.log("Course not found " + courseCode);

    if (nodes.some(n => n.id === String(course.slug))) return console.log("Course already exists");
    const newNode: Node = {
      id: course.slug,
      type: 'course',
      position: { x: 0, y: 0 },
      data: { 
        label: course.code, 
        ...course
      },
    };

    const unlayoutedNodes = [...nodes, newNode];
    const generatedEdges = generateEdges(unlayoutedNodes);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      unlayoutedNodes,
      generatedEdges
    );

    set({ nodes: layoutedNodes, edges: layoutedEdges });
  },
  setInspectedCourse: (course) => set({ inspectedCourse: course }),

}));