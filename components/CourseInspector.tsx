"use client";

import { CourseGeneralEducation, CourseLibrary, PrequisitesToString } from "@/lib/course";
import { useGraphStore } from "@/store/useGraphStore";
import { JSX } from "react";
import NestedArray from "@/lib/nestedArray";


export function CourseInspector({ courseLibrary, courseId } : { courseLibrary : CourseLibrary, courseId? : string }) {
  
  const inspectedCourse = useGraphStore((state) => state.inspectedCourse);
  const addCourse = useGraphStore((state) => state.addCourse);


  if (inspectedCourse) {
    courseId = inspectedCourse.slug ?? inspectedCourse.label;
  }

  var course = courseId == undefined ? undefined : courseLibrary[courseId.toUpperCase()];
  if (course == null) {
    return <div className="border-r border-gray-200 bg-white overflow-y-auto transition ease-in duration-300 w-0 opacity-0">
      <h2 className="text-xl font-bold">{courseId == undefined ? "No course selected" : "Course not found: " + courseId}</h2>
    </div>;
  }
  return <div className="w-1/4 min-w-[300px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
    <h2 className="text-xl font-bold">{course.code} - {course.name}</h2>
    {RenderGeneralEducation(course.generalEducation ?? {})}
    <p className="text-gray-500">{course.shortDesc}</p>
    <p className="italic mt-4">{course.description}</p>
    
    <p className="mt-4"><span className="font-bold">Units:</span> {course.units}</p>
    {HierarchyList("Instructors", [])}
    {HierarchyList("Prerequisites", PrequisitesToString(course.prerequisites), "None", "brackets", a => addCourse(a))}
    <p className="ml-4 text-gray-500 text-s italic"> {course.rawPrerequisites} </p>
    {HierarchyList("Unlocks", course.unlockIds, "None", "all", a => addCourse(a))}
  </div>;
}

function linkBrackets(item : string, callback? : (courseId : string) => void) : JSX.Element {
  // find all text in [brackets] and convert to <a href="brackets">brackets</a>
  var regex = /(\[[^\]]+\])/g;

  var obj = <>{
    item.split(regex).map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Remove the brackets for the link text and URL
        const linkText = part.slice(1, -1);
        return (
          <button className="cursor-pointer hover:text-blue-600" key={index} onClick={() => callback ? callback(linkText) : undefined}>
            {linkText}
          </button>
        );
      }
      // Return normal text as-is
      return part;
    }) 
  }</>;
  return obj;
}

function HierarchyListContents(contents : NestedArray<string> | string, depth : number, link : "none" | "brackets" | "all", callback? : (courseId : string) => void) : JSX.Element | string {
  if (typeof contents == "string" || contents == undefined) {
    return link == "all" ? <button className="cursor-pointer hover:text-blue-600"  onClick={() => callback ? callback(contents) : null}>{contents}</button> : link == "brackets" ? linkBrackets(contents, callback) : <>{contents}</>;
  }
  console.log(contents);
  return <ul className="ml-4">
    {contents.map((item, index) => (
      <li key={index}>{HierarchyListContents(item, depth + 1, link)}</li>
    ))}
  </ul>;
}

export function HierarchyList(title : string, content : NestedArray<string> | string[], empty : string = "None", link : "none" | "brackets" | "all" = "none", callback? : (courseId : string) => void ) {
  var contents = <ul className="ml-4 mb-2">
    {content.length > 0 ? content.map((item, index) => (
      <li className="mt-1" key={index}>{HierarchyListContents(item, 0, link, callback)}</li>
    )) : <li className="text-gray-500 italic">{empty}</li>}
  </ul>;
  return <div>
    <h3 className="font-bold">
      {title}
    </h3>
    {contents}
  </div>;
}

export function RenderGeneralEducation(generalEducation : CourseGeneralEducation) {
  const list = [ ...generalEducation.topicalBreadth ?? [], ...generalEducation.coreLiteracies ?? [] ];
  return list.length > 0 ? list.map(x => 
  <img className="inline" width={20} height={20} title={"This course meets the " + GeneralEducationDisplay[x].name + " requirement."} src={"/ge-icons/svg/" + GeneralEducationDisplay[x]?.icon} key={x} alt={GeneralEducationDisplay[x]?.name} />) : 
  <img className="inline" width={20} height={20} title="This course meets no General Education requirements." src="/ge-icons/svg/none.svg" alt="None" />;
}

export const GeneralEducationDisplay : Record<string, { name : string, shortName : string, icon : string }> = {
  "SE": { name: "Science & Engineering", shortName: "Sci & Eng", icon: "se.svg" },
  "AH": { name: "Arts & Humanities", shortName: "Arts & Hum", icon: "ah.svg" },
  "SS": { name: "Social Sciences", shortName: "Soc Sci", icon: "ss.svg" },
  "ACGH": { name: "American Cultures, Governance, and History", shortName: "American CGH", icon: "acgh.svg" },
  "DD": { name: "Domestic Diversity", shortName: "Dom Div", icon: "dd.svg" },
  "OL": { name: "Oral Literacy", shortName: "Oral Lit", icon: "ol.svg" },
  "QL": { name: "Quantitative Literacy", shortName: "Quant Lit", icon: "ql.svg" },
  "SL": { name: "Scientific Literacy", shortName: "Sci Lit", icon: "sl.svg" },
  "VL": { name: "Visual Literacy", shortName: "Visual Lit", icon: "vl.svg" },
  "WC": { name: "World Cultures", shortName: "World Cultures", icon: "wc.svg" },
  "WE": { name: "Writing Experience", shortName: "Writing Exp", icon: "we.svg" }
}
