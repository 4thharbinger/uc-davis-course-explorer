"use client";

import { CourseLibrary } from "@/lib/course";
import { useScheduleStore } from "@/store/useScheduleStore";
import { CourseInspector } from "./CourseInspector";
import { Section } from "@prisma/client";
import { useEffect, useState } from "react";
import getCourseSections from "@/lib/getCourseSections";

export default function CourseSectionList({ courseLibrary, courseId, addTarget, showUnlocks = false } : { courseLibrary : CourseLibrary, courseId? : string, addTarget : "graph" | "schedule", showUnlocks : boolean }) {
    
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
        return <CourseInspector courseLibrary={courseLibrary}  courseId={courseId} addTarget={addTarget} showUnlocks={showUnlocks}/>;
    }
    
    return <div className="w-1/4 min-w-[300px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Course Section List</h2>

            <div>
                {sections.map((section) => (
                    <div key={section.crn} className="border-b border-gray-200 py-2">
                        <h3 className="font-bold">{activeScheduling} {section.sectionNum}</h3>
                        <p>{JSON.stringify(section.meetings)}</p>
                    </div>
                ))}
            </div>
        </div>;
}