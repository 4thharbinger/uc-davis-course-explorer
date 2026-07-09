"use client";

import { CourseLibrary, Meeting, meetingTypeToDescription } from "@/lib/course";
import { useScheduleStore } from "@/store/useScheduleStore";
import { CourseInspector } from "./CourseInspector";
import { Instructor, Section } from "@prisma/client";
import { useEffect, useState } from "react";
import { getCourseSectionsWithInstructors } from "@/lib/getCourseSections";
import { formatTime } from "./CourseScheduleBlock";
import { SchoolInfo } from "@/lib/getSchoolInfo";
import { useGraphStore } from "@/store/useGraphStore";

export default function CourseSectionList({ courseLibrary, courseId, addTarget, schoolInfo } : { courseLibrary : CourseLibrary, courseId? : string, addTarget : "graph" | "schedule", schoolInfo : SchoolInfo }) {
    
    const [sections, setSections] = useState<(Section & { instructors: Instructor[] })[]>([]);
    const [sectionsCourse, setSectionsCourse] = useState<string>("");

    const activeScheduling = useScheduleStore((state) => state.activeScheduling) ?? "";
    const setActiveScheduling = useScheduleStore((state) => state.setActiveScheduling);
    const rescheduleCourse = useScheduleStore((state) => state.rescheduleCourse);

    useEffect(() => {
        if (sectionsCourse != activeScheduling) {
            getCourseSectionsWithInstructors(activeScheduling).then((sections) => {
                if (sections) {
                    setSectionsCourse(activeScheduling);
                    setSections(sections);
                }
            });
        }
    }, [activeScheduling, sections, sectionsCourse]);

    if (!activeScheduling) {
        return <CourseInspector courseLibrary={courseLibrary}  courseId={courseId} addTarget={addTarget} showUnlocks={false}/>;
    }
    
    return <div className="w-1/4 min-w-[500px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Course Sections <button className="float-right cursor-pointer hover:text-red-600 transition-colors" title="Close" onClick={() => setActiveScheduling(null)}>X</button></h2>
            
            {sections.length > 0 && <table className="w-full table-fixed">
                <tbody>
                    <tr>
                        <th className="text-left">Desc</th>
                        <th className="text-left">Place</th>
                        <th className="text-left w-[75px]">Days</th>
                        <th className="text-left w-[125px]">Time</th>
                    </tr>
                </tbody>
            </table>}
            {
                sectionsCourse != activeScheduling ? <div className="text-gray-500 italic text-sm text-center pt-4">Loading...</div> :
            <div>
                {sections.map((section) => (
                    <div key={section.crn} className="border-y border-gray-200 py-2 px-3 hover:bg-gray-100 transition-colors rounded">
                        <h3 className="cursor-pointer hover:text-blue-600 transition-colors" title="Click to schedule" onClick={() => {
                        rescheduleCourse(activeScheduling, +section.crn);
                        setActiveScheduling(null);
                    }}><span className="font-bold">{activeScheduling} {section.sectionNum}</span> - <span>CRN {section.crn}</span></h3>
                        <table className="w-full table-fixed">
                            <tbody>
                                {section.meetings == null || !Array.isArray(section.meetings) || section.meetings.length == 0 ? "No meetings found" : 
                                (section.meetings as Meeting[]).map((meeting : Meeting) => {
                                    return <tr key={meeting.room + meeting.type}>
                                        <td>{meetingTypeToDescription[meeting.type]}</td>
                                        <td title={meeting.building + " " + meeting.room}><a 
                                            className = "cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={() => false} href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(meeting.building + " " + meeting.room + " " + schoolInfo.name)} target="_blank" rel="noopener noreferrer">
                                            {meeting.buildingCode}
                                        </a></td>
                                        <td className="w-[75px]">{getDateString(meeting)}</td>
                                        <td className="w-[125px]">{getTimeString(meeting)}</td>
                                    </tr>;
                                })}
                                <tr>
                                    <td>Instructor</td>
                                    <td colSpan={3}>{section.instructors.length == 0 ? "TBD" : section.instructors.map((instructor) => instructor.fullName).join(", ")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
                {sections.length == 0 && <div className="text-gray-500 italic text-sm text-center pt-4">No sections found</div>}
            </div>
}
        </div>;
}

function getDateString(meeting: { monday : boolean, tuesday : boolean, wednesday : boolean, thursday : boolean, friday : boolean, saturday : boolean, sunday : boolean }) {
    var days = "";
    if (meeting.monday) days += "M";
    if (meeting.tuesday) days += "T";
    if (meeting.wednesday) days += "W";
    if (meeting.thursday) days += "R";
    if (meeting.friday) days += "F";
    return days;
}

function getTimeString(meeting: { startTime : string, endTime : string }) {
    if (meeting.startTime == "" || meeting.endTime == "") return "TBD";
    const start = parseInt(meeting.startTime);
    const end = parseInt(meeting.endTime);
    return `${formatTime(start).padStart(6, "0")} - ${formatTime(end).padStart(6, "0")}`;
}