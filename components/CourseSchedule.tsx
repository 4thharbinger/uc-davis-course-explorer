"use client";

import { CourseLibrary, Meeting } from "@/lib/course";
import { useGraphStore } from "@/store/useGraphStore";
import { useScheduleStore } from "@/store/useScheduleStore";
import { useEffect, useState } from "react";
import styles from "./CourseSchedule.module.css";
import CourseScheduleBlock, { weekdays } from "./CourseScheduleBlock";
import { getCoursesSections, getSections } from "@/lib/getCourseSections";
import { Section } from "@prisma/client";

export function CourseSchedule() {
  const courses = useScheduleStore((state) => state.schedule);
  const setSchedule = useScheduleStore((state) => state.setSchedule);
  const unscheduledCourses = Object.keys(courses).filter(courseCode => !courses[courseCode]);
  const removeCourse = useScheduleStore((state) => state.removeCourseFromSchedule);
  const setActiveScheduling = useScheduleStore((state) => state.setActiveScheduling);
  const [sections, setSections] = useState<{ [courseCode: string]: Section }>({});
  const [availableSections, setAvailableSections] = useState<{ [courseCode: string]: Section[] }>({});
  const setInspectedCourse = useGraphStore((state) => state.setInspectedCourse);
  const [autoSchedulerOpen, setAutoSchedulerOpen] = useState(false);
  const [numSchedules, setNumSchedules] = useState(-1);

  useEffect(() => {
    if (Object.keys(courses).length > 0) {
      getSections(Object.values(courses)).then((sections) => {
        const newSections : Record<string, Section> = {};
        if (sections != undefined)
            Object.keys(courses).forEach(courseCode => newSections[courseCode] = sections[courses[courseCode]])
            setSections(newSections);
      });
      getCoursesSections(Object.keys(courses)).then((sections) => {
    console.log(Object.keys(courses), sections);
        setAvailableSections(sections ?? {});
      });
    console.log(courses);
    }
  }, [courses]);

  const courseBlocks = sections == undefined ? null : Object.keys(courses)
  .flatMap(course => (
    sections[course]?.meetings as Meeting[])
        ?.map(meeting => <CourseScheduleBlock 
            key={course + meeting.type + meeting.startTime + meeting.room} 
            course={(course) + " " + sections[course].sectionNum} 
            activity={meeting.type} 
            start={+meeting.startTime} 
            end={+meeting.endTime}
            days={meeting}
            color={hashCode(course)}
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
                            {courseCode}
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
        <div className="flex flex-row gap-2">
            <button onClick={() => { setNumSchedules(scheduleAll(courses, availableSections)); setSchedule({ ...courses}); }} className="rounded bg-gray-200 px-2 py-1 cursor-pointer hover:text-blue-600">
                Schedule All
            </button>
            <button onClick={() => { Object.keys(courses).forEach((key) => courses[key] = 0); setSchedule({ ...courses}); }} className="rounded bg-gray-200 px-2 py-1 cursor-pointer hover:text-blue-600">
                Unschedule All
            </button>
            <span title="How many combinations of sections can be taken with these classes.">
                Estimated combinations: {availableSections == undefined ? "0" : Object.values(availableSections).reduce((cur, acc) => cur * acc.length, 1)}
            </span>
            <span title="How many valid, non-overlapping schedules there are.">
                Valid schedules: {numSchedules < 0 ? "N/A" : numSchedules}
            </span>
        </div>
    </div>}
  </div>
}

function scheduleAll(courses : Record<string, number>, sections : Record<string, Section[]>) {
    console.log("Scheduling " + Object.values(courses).length + " courses...", courses, sections);
    const bitmasks : Record<number, bigint> = {};
    var currentBitmask = BigInt(0);
    for (const course of Object.keys(sections)) {
        if (course == undefined) {
            console.warn("Potentially incomplete sections data.", sections);
            return 0;
        }
        for (const section of sections[course]) {
            bitmasks[+section.crn] = sectionToBitmask(section);
        }
        if (courses[course] != 0) {
            currentBitmask |= bitmasks[+courses[course]];
        }
    }
    const bestSchedule : Record<string, number> = { score: 0 };
    const validSchedules : Record<string, number>[] = [];
    schedule(courses, bestSchedule, sections, bitmasks, currentBitmask, validSchedules);
    console.log(validSchedules);
    delete bestSchedule.score;
    Object.keys(bestSchedule).forEach(course => courses[course] = bestSchedule[course]);
    return validSchedules.length;
}

function evalSchedule(schedule : Record<string, number>, sections : Record<string, Section[]>) : number {
    // maximizing total schedule CRN
    return Math.random();
}

function schedule(
    currentSchedule : Record<string, number>,
    bestSchedule : Record<string, number>,
    sections : Record<string, Section[]>,
    bitmasks : Record<number, bigint>,
    currentBitmask : bigint,
    validSchedules : Record<string, number>[]
) {
    const nextCourse = (Object.entries(currentSchedule).find(x => x[1] == 0) ?? [])[0];
    if (nextCourse == undefined) {
        // valid schedule complete, check if it's better than current best.
        const score = evalSchedule(currentSchedule, sections);
        console.log("Completed schedule with score " + score);
        validSchedules.push({...currentSchedule});
        if (score > bestSchedule.score) {
            bestSchedule.score = score;
            Object.keys(currentSchedule).forEach(course => bestSchedule[course] = currentSchedule[course]);
        }
    } else {
        // at least one unscheduled course
        // console.log(course + " not currently scheduled.");
        for (const section of sections[nextCourse]) {
            const newSectionBitmask = bitmasks[+section.crn];
            // console.log("Section " + section.crn + " bitmask: \n" + bitmaskToString(newSectionBitmask), "\nCurrent bitmask: \n" + bitmaskToString(currentBitmask));
            if ((newSectionBitmask & currentBitmask) != BigInt(0)) {
                // skip overlapping sections
                // console.log("Section " + section.crn + " overlaps with current schedule.");
                continue;
            }
            // set course for now and start looking deeper.
            currentSchedule[nextCourse] = +section.crn;
            schedule(currentSchedule, bestSchedule, sections, bitmasks, currentBitmask | newSectionBitmask, validSchedules);
            currentSchedule[nextCourse] = 0;
        }
    }
}
/*
function schedule(courses : Record<string, number>, sections : Record<string, Section[]>, bitmasks : Record<number, bigint>, currentBitmask : bigint, bestSchedule : Record<string, number>) {
    // mutates the courses array to schedule all courses with no CRN
    for (const course in courses) {
        if (courses[course] == 0) {
            // course not scheduled
            console.log("Scheduling course " + course);
            if (sections[course] == undefined || sections[course].length == 0) {
                // no sections found.
                console.log("No sections found for course " + course + ".")
                continue;
            }
            for (const section of sections[course]) {
                const newSectionBitmask = bitmasks[+section.crn];
                // console.log("Section " + section.crn + " bitmask: \n" + bitmaskToString(newSectionBitmask), "\nCurrent bitmask: \n" + bitmaskToString(currentBitmask));
                if ((newSectionBitmask & currentBitmask) != BigInt(0)) {
                    // sections overlap, move on to next.
                    console.log("Section " + section.crn + " overlaps with current schedule.");
                    continue;
                }
                // set course for now and start looking deeper.
                courses[course] = +section.crn;
                const done = Object.values(courses).every(x => x > 0);
                if (done) {
                    // all courses scheduled, evaluate score and compare
                    const score = evalSchedule(courses, sections);
                    console.log("Created valid schedule with eval " + score);
                    if (score > bestSchedule.score) {
                        bestSchedule.score = score;
                        Object.keys(course).forEach(course => bestSchedule[course] = courses[course]);
                    }
                } else {
                    // not all done, keep going
                    schedule(courses, sections, bitmasks, currentBitmask | newSectionBitmask, bestSchedule);
                }
                courses[course] = 0;
            }
            break;
        } else {
            console.log(course + " already scheduled.");
            // course already scheduled
        }
    }
    // no courses to schedule or all courses are already scheduled.
}*/

function bitmaskToString(bitmask : bigint) {
    return bitmask.toString(2).padStart(24 * weekdays.length, "0").match(/.{24}/g)?.map((x, i) => `${weekdays[i][0]}: ${x}`).join("\n");
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
            bitmask |= BigInt(meetingDayToBitmask(Math.round(+meeting.startTime / 100), Math.round(+meeting.endTime / 100)));
    }
    return bitmask;
}

function meetingDayToBitmask(startHour : number, endHour : number) {
    return bitspan(endHour - startHour, startHour);
}

function bitspan(x : number, offset : number) : number {
    return ((1 << x) - 1) << offset;
}

function hashCode(x : string) : number {
    var hash = 0;
    for (var i = 0; i < x.length; i++) {
        hash = x.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}