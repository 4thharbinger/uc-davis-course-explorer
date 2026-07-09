"use client";

import { CourseLibrary, Meeting } from "@/lib/course";
import { useGraphStore } from "@/store/useGraphStore";
import { useScheduleStore } from "@/store/useScheduleStore";
import { useEffect, useState } from "react";
import styles from "./CourseSchedule.module.css";
import CourseScheduleBlock, { weekdays } from "./CourseScheduleBlock";
import { getCoursesSections, getSections } from "@/lib/getCourseSections";
import { Section } from "@prisma/client";

export function CourseSchedule({ courseLibrary } : { courseLibrary : CourseLibrary }) {
  const courses = useScheduleStore((state) => state.schedule);
  const setSchedule = useScheduleStore((state) => state.setSchedule);
  const unscheduledCourses = Object.keys(courses).filter(courseCode => !courses[courseCode]);
  const removeCourse = useScheduleStore((state) => state.removeCourseFromSchedule);
  const setActiveScheduling = useScheduleStore((state) => state.setActiveScheduling);
  const [sections, setSections] = useState<{ [courseCode: string]: Section }>({});
  const [availableSections, setAvailableSections] = useState<{ [courseCode: string]: Section[] }>({});
  const setInspectedCourse = useGraphStore((state) => state.setInspectedCourse);
  const [autoSchedulerOpen, setAutoSchedulerOpen] = useState(false);

  useEffect(() => {
    if (Object.keys(courses).length > 0) {
      getSections(Object.values(courses)).then((sections) => {
        const newSections : Record<string, Section> = {};
        if (sections != undefined)
            Object.keys(courses).forEach(courseCode => newSections[courseCode] = sections[courses[courseCode]])
            setSections(newSections);
      });
      getCoursesSections(Object.keys(courses)).then((sections) => {
        setAvailableSections(sections ?? {});
      });
    }
  }, [courses]);

  const courseBlocks = sections == undefined ? null : Object.keys(courses)
  .flatMap(course => (
    sections[course]?.meetings as Meeting[])
        ?.map(meeting => <CourseScheduleBlock 
            key={course + meeting.type + meeting.startTime} 
            course={courseLibrary[course]?.code ?? course} 
            activity={meeting.type} 
            start={+meeting.startTime} 
            end={+meeting.endTime}
            days={meeting}
            onClick={() => setInspectedCourse({slug: course})}/>
  ) ?? []);

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
                {courseBlocks}
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
            <li className="ml-auto">
                <button className={"flex flex-col relative items-center gap-2 bg-gray-200 px-2 py-1 float-right rounded cursor-pointer w-40 hover:text-blue-600 " + (autoSchedulerOpen ? "text-blue-600" : "")} onClick={() => setAutoSchedulerOpen(!autoSchedulerOpen)} >
                    {autoSchedulerOpen ? "Close" : "Auto Scheduler"}
                </button>
            </li>
        </ul>
    </div>}
    {autoSchedulerOpen && <div className="mt-4">
        <h1 className="text-xl font-bold">Course Scheduler</h1>
        <div>
            <button onClick={() => { scheduleAll(courses, availableSections); setSchedule({ ...courses}); }} className="rounded bg-gray-200 px-2 py-1 cursor-pointer hover:text-blue-600">
                Schedule All
            </button>
        </div>
    </div>}
  </div>
}


function scheduleAll(courses : Record<string, number>, sections : Record<string, Section[]>, currentBitmask? : bigint | undefined) : boolean {
    // mutates the courses array to schedule all courses with no CRN
    console.log("Scheduling " + Object.values(courses).length + " courses...", courses, sections);
    const bitmasks : Record<number, bigint> = {};
    for (const course of Object.values(sections)) {
        if (course == undefined) {
            console.warn("Potentially incomplete sections data.", sections);
            return false;
        }
        for (const section of course) {
            bitmasks[+section.crn] = sectionToBitmask(section);
        }
    }
    currentBitmask = currentBitmask ?? BigInt(0);
    for (const course in courses) {
        if (courses[course] == 0) {
            // course not scheduled
            for (const section of sections[course]) {
                const newSectionBitmask = bitmasks[+section.crn];
                if ((newSectionBitmask & currentBitmask) != BigInt(0)) {
                    // sections overlap, move on to next.
                    continue;
                }
                // set course for now and start looking deeper.
                courses[course] = +section.crn;
                if (scheduleAll(courses, sections, currentBitmask | newSectionBitmask)) {
                    // all courses have been scheduled.
                    return true;
                }
                // some courses could not be scheduled, backtrack and try another section.
            }
            // return whether all courses were scheduled successfully.
            return Object.values(courses).every(x => x > 0);
        } else {
            // course already scheduled
        }
    }
    // no courses to schedule or all courses are already scheduled.
    return true;
}

function sectionToBitmask(section : Section) {
    var bitmask = BigInt(0);
    for (var meeting of (section.meetings as Meeting[])) {
        bitmask |= meetingTimeToBitmask(meeting);
    }
    return bitmask;
}

function meetingTimeToBitmask(meeting : Meeting) {
    var bitmask = BigInt(0); // bitmask by hours
    for (const weekday of weekdays) {
        bitmask = bitmask << BigInt(24);
        if (meeting[weekday])
            bitmask |= BigInt(meetingDayToBitmask(Math.floor(+meeting.startTime / 100), Math.floor(+meeting.endTime / 100)));
    }
    return bitmask;
}

function meetingDayToBitmask(startHour : number, endHour : number) {
    return bitspan(endHour - startHour, startHour);
}

function bitspan(x : number, offset : number) : number {
    return ((1 << x) - 1) << offset;
}