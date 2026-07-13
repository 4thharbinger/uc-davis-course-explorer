import CourseGraph from "@/components/CourseGraph";
import { CourseInspector } from "@/components/CourseInspector";
import CourseSearch from "@/components/CourseSearch";
import { redirect } from "next/navigation";
import { Footer } from "../../../components/Footer";
import getSchoolCourses from "@/lib/getSchoolCourses";
import getSchoolInfo from "@/lib/getSchoolInfo";

interface SchoolProps {
  params: Promise<{ school: string[] }>;
}


export default async function CourseExplorer({ params } : SchoolProps ) {
  var args = await params;
  
  if (args.school == undefined ||args.school.length == 0) return "Please select a school";

  const schoolInfo = getSchoolInfo( (args).school[0] );

  const selectedCourse = args.school.length == 1 ? undefined : decodeURIComponent(args.school[1]).toUpperCase();

  if (selectedCourse != undefined && selectedCourse.indexOf(" ") >= 0) {
    // redirect 
    redirect("/courses/" + args.school[0] + "/" + selectedCourse.replaceAll(" ", ""));
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden text-gray-900 bg-white">
      <header className="flex-none h-14 border-b px-4 flex items-center bg-white z-10 border-gray-200 text-2xl font-bold"> Course Explorer —  <span className="ml-2 text-gray-500">{schoolInfo.name}</span> </header> 
      <main className="flex-1 flex overflow-hidden min-h-0">
          <CourseSearch/>

          <div className="flex-1 relative bg-gray-100 p-4"><CourseGraph courses={[]} />
          </div>

          <CourseInspector courseId={selectedCourse} addTarget={"graph"} showUnlocks={true} />
      </main>
      <Footer/>
    </div>
  );
}

