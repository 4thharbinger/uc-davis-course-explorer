"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { usePathname } from 'next/navigation';
import { redirect } from "next/navigation";

export function Footer() {
  const clearCourses = useGraphStore((state) => state.clearCourses);
  const pathname = usePathname()

  return <footer className="flex-none h-8 border-t bg-gray-50 px-4 flex items-center border-gray-200 justify-between text-xs text-gray-500 z-10">
    <div className="flex gap-4">
      <span>Put some footer stuff here I guess.</span>
    </div>
    <div className="flex gap-4">
      <button className="cursor-pointer hover:text-blue-600" onClick={clearCourses}>Clear Canvas</button>
      <a className="cursor-pointer hover:text-blue-600" href="/help/course-explorer">Help</a>
      <a className="cursor-pointer hover:text-blue-600" onClick={() => redirect(location.href + "/scheduler")}>Scheduler</a>
    </div>
  </footer>;
}
