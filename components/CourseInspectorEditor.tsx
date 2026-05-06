"use client";

import { CourseLibrary, PrequisitesToString } from "@/lib/course";
import { useGraphStore } from "@/store/useGraphStore";
import { setCourseShortDesc } from "@/lib/setCourseInfo";
import { HierarchyList } from "./CourseInspector";
import { DebouncedInput } from "./DebouncedInput";
import { Dispatch, useState } from "react";


export function CourseInspectorEditor({ courseLibrary, courseId, setSelectedCourse } : { courseLibrary : CourseLibrary, courseId? : string, setSelectedCourse : Dispatch<any> }) {
  
  const addCourse = useGraphStore((state) => state.addCourse);
  
  const course = courseId == undefined ? undefined : courseLibrary[courseId.toUpperCase()];
  const [text, setText] = useState(course?.shortDesc);
  if (course == null) {
    return <div className="border-r border-gray-200 bg-white overflow-y-auto transition ease-in duration-300 w-0 opacity-0">
      <h2 className="text-xl font-bold">{courseId == undefined ? "No course selected" : "Course not found: " + courseId}</h2>
    </div>;
  }
  return <div className="w-1/4 min-w-[300px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
    <h2 className="text-xl font-bold">{course.code} - {course.name}</h2>
    <p className="text-gray-500">
      <DebouncedInput className="w-full" text={text} setText={setText} onChange={e => { setCourseShortDesc(course.code, e); }}/>

      </p>
    <p className="italic mt-4">{course.description}</p>
    
    <p className="mt-4"> Units: {course.units}</p>
    {HierarchyList("Instructors", [])}
    {HierarchyList("Prerequisites", PrequisitesToString(course.prerequisites), "None", "brackets", a => console.log(a))}
    <p className="ml-4 text-gray-500 text-s italic"> {course.rawPrerequisites} </p>
    {HierarchyList("Unlocks", course.unlockIds, "None", "all", a => console.log(a))}
  </div>;
}
