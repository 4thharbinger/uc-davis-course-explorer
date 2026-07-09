"use client";

import { CourseLibrary } from "@/lib/course";
import { useGraphStore } from "@/store/useGraphStore";
import { useScheduleStore } from "@/store/useScheduleStore";

export function CourseSchedule({ courseLibrary } : { courseLibrary : CourseLibrary }) {
  const courses = useScheduleStore((state) => state.schedule);
  const unscheduledCourses = Object.keys(courses).filter(courseCode => !courses[courseCode]);
  const removeCourse = useScheduleStore((state) => state.removeCourseFromSchedule);
  console.log(courses);
  return <div className="flex flex-col w-full h-full">
    <div className="h-full overflow-auto">
    <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
                <th className="w-[60px]">Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
            </tr>
        </thead>
        <tbody>
            {
                [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => 
                    <tr key={hour} className="h-12 border-b border-gray-200">
                        <td className="text-center max-w-[60px] border-r border-gray-200">{hour % 12 + 1}:00{hour < 11 ? "a" : "p"}</td>
                        <td className="border-r border-gray-200"></td>
                        <td className="border-r border-gray-200"></td>
                        <td className="border-r border-gray-200"></td>
                        <td className="border-r border-gray-200"></td>
                        <td className="border-r border-gray-200"></td>
                    </tr>
                )
            }
        </tbody>
    </table></div>
    {unscheduledCourses.length > 0 && <div>
        <h1>Unscheduled Courses</h1>
        <ul className="flex flex-row gap-2">
            {unscheduledCourses.map((courseCode) => (
                <li key={String(courseCode)}>
                    <div className="flex flex-col relative items-center gap-2 bg-gray-200 px-2 py-1 pr-5 rounded">
                        {courseLibrary[courseCode]?.code}
                        <button onClick={() => removeCourse(courseCode)} title="Remove" className="right-[8px] absolute ml-2 rounded hover:text-red-800 transition-colors">
                            x
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    </div>}
  </div>
}