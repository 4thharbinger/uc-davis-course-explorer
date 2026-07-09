"use client";

import { CourseLibrary } from "@/lib/course";
import { useGraphStore } from "@/store/useGraphStore";
import { useScheduleStore } from "@/store/useScheduleStore";
import { useState } from "react";
import styles from "./CourseSchedule.module.css";
import CourseScheduleBlock from "./CourseScheduleBlock";
import getCourseSections from "@/lib/getCourseSections";

export function CourseSchedule({ courseLibrary } : { courseLibrary : CourseLibrary }) {
  const courses = useScheduleStore((state) => state.schedule);
  const unscheduledCourses = Object.keys(courses).filter(courseCode => !courses[courseCode]);
  const removeCourse = useScheduleStore((state) => state.removeCourseFromSchedule);
  const setActiveScheduling = useScheduleStore((state) => state.setActiveScheduling);

  return <div className="flex flex-col w-full h-full">
    <div className="h-full overflow-auto relative">
        <div className={styles.calendarHeader}>
            <div className={styles.calendarHeaderDay}>Time</div>
            <div className={styles.calendarHeaderDay}>Monday</div>
            <div className={styles.calendarHeaderDay}>Tuesday</div>
            <div className={styles.calendarHeaderDay}>Wednesday</div>
            <div className={styles.calendarHeaderDay}>Thursday</div>
            <div className={styles.calendarHeaderDay}>Friday</div>
        </div>
        <div className={styles.calendarBody}>   
            <div className={styles.timeColumn}>
                {
                    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => 
                        <div key={hour} className={styles.timeLabel}>
                            {hour % 12 + 1}:00{hour < 11 ? "a" : "p"}
                        </div>
                    )
                }
            </div>
            <div className={styles.sectionGrid}>
                <CourseScheduleBlock course="MAT 021A A01" activity="Lecture" start={1330} end={1470} />
            </div>
        </div>
        {/* <table className="w-full border-collapse table-fixed">
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
            </tbody>
        </table> */}
    </div>
    {unscheduledCourses.length > 0 && <div>
        <h1 className="text-xl font-bold">Unscheduled Courses</h1>
        <ul className="flex flex-row gap-2">
            {unscheduledCourses.map((courseCode) => (
                <li key={String(courseCode)}>
                    <div className="flex flex-col relative items-center gap-2 bg-gray-200 px-2 py-1 pr-5 rounded">
                        <button onClick={() => setActiveScheduling(courseCode)} title="Schedule" className="cursor-pointer hover:text-blue-600">
                            {courseLibrary[courseCode]?.code}
                        </button>
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