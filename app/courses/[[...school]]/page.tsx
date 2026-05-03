import { Course, CourseLibrary, PrequisitesToString } from "@/lib/course";
import { courses, getSchoolCourses } from "@/lib/getSchoolCourses";
import { getSchoolInfo } from "@/lib/getSchoolInfo";
import { NestedArray } from "@/lib/nestedArray";
import { JSX } from "react";

interface SchoolProps {
  params: Promise<{ school: string[] }>;
}

export default async function CourseExplorer({ params } : SchoolProps ) {
  var args = await params;
  
  if (args.school == undefined ||args.school.length == 0) return "Please select a school";

  const schoolInfo = getSchoolInfo( (await params).school[0] );
  const courses = await getSchoolCourses(schoolInfo);

  console.log(courses);

  const selectedCourse = args.school.length == 1 ? undefined : args.school[1];

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black">
      <main className=" w-full">
        <div className="border-gray-200 border-b pt-4 pl-4 pb-2 text-2xl font-bold"> Course Explorer - <span className=" text-gray-500">{schoolInfo.name}</span> </div> 
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        
        {/* Column 1: Search Panel */}
        <div className="w-1/5 min-w-[250px] border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <input type="text" placeholder="Search classes..." className="w-full" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Scrollable list of search results goes here */}
          </div>
        </div>

        {/* Column 2: Course Details Panel */}
        <CoursePanel courseLibrary={courses} courseId={selectedCourse} />

        {/* Column 3: The Tech Tree Canvas */}
        <div className="flex-1 relative bg-gray-100 p-4">
          Tech tree goes here saoigdsadiofjasoid jasopidf jaoispdf joiapsdj foipasdjf opiasdj fopaisdf.
        </div>

      </div>
      </main>
    </div>
  );
}

function CoursePanel({ courseLibrary, courseId } : { courseLibrary : CourseLibrary, courseId? : string }) {
  var course = courseId == undefined ? undefined : courseLibrary[courseId.toUpperCase()];
  if (course == null) {
    return <div className="w-1/4 min-w-[300px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
      <h2 className="text-xl font-bold">{courseId == undefined ? "Select a course" : "Course not found: " + courseId}</h2>
    </div>;
  }
  return <div className="w-1/4 min-w-[300px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
    <h2 className="text-xl font-bold">{course.code}</h2>
    <p className="text-gray-500">{course.name}</p>
    <p className="italic mt-4">{course.description}</p>
    
    <p className="mt-4"> Units: {course.units}</p>
    {HierarchyList("Instructors", [])}
    {HierarchyList("Prerequisites", PrequisitesToString(course.prerequisites), "None", "brackets")}
    {HierarchyList("Unlocks", course.unlockIds, "None", "all")}
  </div>;
}


function linkBrackets(item : string, callback? : (item : string) => string) : JSX.Element {
  // find all text in [brackets] and convert to <a href="brackets">brackets</a>
  var regex = /(\[[^\]]+\])/g;

  var obj = <>{
    item.split(regex).map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        // Remove the brackets for the link text and URL
        const linkText = part.slice(1, -1);
        return (
          <a key={index} href={linkText} className={callback == undefined ? "" : callback(linkText)}>
            {linkText}
          </a>
        );
      }
      // Return normal text as-is
      return part;
    }) 
  }</>;
  return obj;
}

function HierarchyListContents(contents : NestedArray<string> | string, link : "none" | "brackets" | "all") : JSX.Element | string {
  if (typeof contents == "string" || contents == undefined) {
    return link == "all" ? <a href={contents}>{contents}</a> : link == "brackets" ? linkBrackets(contents, a => courses[a] == undefined ? "text-red-800" : "") : <>{contents}</>;
  }
  return <ul>
    {contents.map((item, index) => (
      <li key={index}>{HierarchyListContents(item, link)}</li>
    ))}
  </ul>;
}

function HierarchyList(title : string, content : NestedArray<string> | string[], empty : string = "None", link : "none" | "brackets" | "all" = "none" ) {
  var contents = <ul className="ml-4">
    {content.length > 0 ? content.map((item, index) => (
      <li key={index}>{HierarchyListContents(item, link)}</li>
    )) : <li className="text-gray-500 italic">{empty}</li>}
  </ul>;
  return <div>
    <h3 className="font-bold">
      {title}
    </h3>
    {contents}
  </div>;
}

