import { Handle, Position } from '@xyflow/react';

export default function CourseNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-sm w-64 hover:shadow-md transition-shadow">
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={false}
        className="w-3 h-3 bg-blue-500 border-2 border-white" 
      />

      <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 flex justify-between items-center rounded-t-md">
        <span className="font-bold text-blue-900 tracking-tight">{data.label}</span>
        
        {data.prerequisiteRules && data.prerequisiteRules.length > 0 && (
          <span className="text-[10px] font-bold uppercase bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
            Has Prereqs
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1.5">
          {data.shortDesc}
        </h3>
        
        {data.description && (
          <p className="text-xs text-gray-500 h-14 line-clamp-3">
            {data.description}
          </p>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-blue-500 border-2 border-white" 
      />
    </div>
  );
}