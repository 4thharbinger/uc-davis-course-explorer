import CourseGraph from "@/components/CourseGraph";
import { CourseInspector } from "@/components/CourseInspector";
import CourseSearch from "@/components/CourseSearch";
import { redirect } from "next/navigation";
import { Footer } from "../../../../components/Footer";
import getSchoolCourses from "@/lib/getSchoolCourses";
import getSchoolInfo from "@/lib/getSchoolInfo";
import { CourseSchedule } from "@/components/CourseSchedule";
import { useScheduleStore } from "@/store/useScheduleStore";
import CourseSectionList from "@/components/CourseSectionList";
import Header from "@/components/Header";

interface SchoolProps {
  params: Promise<{ school: string[] }>;
}


export default async function CourseScheduler({ params } : SchoolProps ) {
  var args = await params;
  
  if (args.school == undefined ||args.school.length == 0) return "Please select a school";

  const schoolInfo = getSchoolInfo( (args).school[0] );

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden text-gray-900 bg-white">
      <Header> Course Explorer —  <span className="ml-2 text-gray-500">{schoolInfo.name}</span> </Header> 
      <main className="flex-1 flex overflow-hidden min-h-0">
          <CourseSearch/>

          <div className="flex-1 relative bg-gray-100 p-4">
            <CourseSchedule/>
          </div>
          <CourseSectionList addTarget="schedule" schoolInfo={schoolInfo}/>
      </main>
      <Footer/>
    </div>
  );
}


