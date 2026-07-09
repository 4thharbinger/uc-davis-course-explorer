"use client";

import { CourseLibrary, Meeting } from "@/lib/course";
import { useScheduleStore } from "@/store/useScheduleStore";
import { CourseInspector } from "./CourseInspector";
import { Section } from "@prisma/client";
import { useEffect, useState } from "react";
import getCourseSections from "@/lib/getCourseSections";
import { formatTime } from "./CourseScheduleBlock";
import { SchoolInfo } from "@/lib/getSchoolInfo";

export default function CourseSectionList({ courseLibrary, courseId, addTarget, schoolInfo } : { courseLibrary : CourseLibrary, courseId? : string, addTarget : "graph" | "schedule", schoolInfo : SchoolInfo }) {
    
    const [sections, setSections] = useState<Section[]>([]);
    const [sectionsCourse, setSectionsCourse] = useState<string>("");

    const activeScheduling = useScheduleStore((state) => state.activeScheduling) ?? "";

    useEffect(() => {
        if (sections.length == 0 && sectionsCourse != activeScheduling) {
            getCourseSections(activeScheduling).then((sections) => {
                console.log(activeScheduling, sections);
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
            <h2 className="text-xl font-bold mb-4">Course Sections</h2>
            
            <table className="w-full table-fixed">
                <tbody>
                    <tr>
                        <th className="text-left">Desc</th>
                        <th className="text-left">Place</th>
                        <th className="text-left w-[100px]">Days</th>
                        <th className="text-left w-[150px]">Time</th>
                    </tr>
                </tbody>
            </table>
            <div>
                {sections.map((section) => (
                    <div key={section.crn} className="border-b border-gray-200 py-2">
                        <h3 className="font-bold">{activeScheduling} {section.sectionNum}</h3>
                        <table className="w-full table-fixed">
                            <tbody>
                                {section.meetings == null || !Array.isArray(section.meetings) || section.meetings.length == 0 ? "No meetings found" : 
                                (section.meetings as Meeting[]).map((meeting : Meeting) => {
                                    console.log(meeting);
                                    return <tr key={meeting.room + meeting.type}>
                                        <td>{meeting.description}</td>
                                        <td title={meeting.building + " " + meeting.room}><a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(meeting.building + " " + meeting.room + " " + schoolInfo.name)} target="_blank" rel="noopener noreferrer">
                                            {meeting.buildingCode}
                                        </a></td>
                                        <td className="w-[100px]">{getDateString(meeting)}</td>
                                        <td className="w-[150px]">{getTimeString(meeting)}</td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
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
    const start = parseInt(meeting.startTime);
    const end = parseInt(meeting.endTime);
    return `${formatTime(start).padStart(6, "0")} - ${formatTime(end).padStart(6, "0")}`;
}