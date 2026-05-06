"use client";

import { useState } from "react";
import { CourseInspectorEditor } from "./CourseInspectorEditor";
import CourseSearch from "./CourseSearch";
import { CourseLibrary } from "@/lib/course";

export function CourseEditor({ courseLibrary, courseCode } : { courseLibrary : CourseLibrary, courseCode : string }) {
  
  const [selectedCourse, setSelectedCourse] = useState(courseCode);
  return (
      <main className="flex-1 flex overflow-hidden min-h-0">
          <CourseSearch setSelectedCourse={setSelectedCourse}/>

          <CourseInspectorEditor courseLibrary={courseLibrary} courseId={selectedCourse} setSelectedCourse={setSelectedCourse} />
      </main>);
}