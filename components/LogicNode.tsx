import { Handle, Position } from '@xyflow/react';

export default function LogicNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-full px-4 py-1.5 shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-500 tracking-widest uppercase">

      <Handle type="target" position={Position.Top} className="opacity-0" isConnectable={false} />
      
      {data.label}
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" isConnectable={false} />
    </div>
  );
}