import React from "react";

export default function Collapsible({ title, children } : { title : React.ReactNode, children : React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
        <h1 onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            <span style={{ display: 'inline-block', marginRight: '5px', transition: 'transform 0.2s ease-in-out', transform: isOpen ? 'rotate(180deg)' : 'rotate(90deg)' }}>▲</span>{title}
        </h1>
        {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}