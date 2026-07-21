import Header from "@/components/Header";

export default async function CourseExplorer() {

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white">
      <Header> Help —  <span className="ml-2 text-gray-500">Course Explorer</span> </Header> 
      <main className="flex-1 flex overflow-hidden min-h-0">
        <article className="p-4 text-justify w-full max-w-2xl mx-auto gap-4 flex flex-col items-center">
          <h1 className="text-xl text-center font-bold">Course Explorer</h1>
          <p>Search for courses by name, code, or description. Add to your schedule by clicking the "Add" button. See course prerequisites and unlock requirements in a graph fashion. No more worrying about course conflicts or messy catalog entries.</p>
          <p>Always make sure to check with your advisor before registering a course to your schedule.</p>
          <a href="/courses/ucdavis" className="font-bold text-gray-600 cursor-pointer hover:text-blue-600 border-1 w-fit p-2 px-6 border-blue-500 rounded bg-blue-200">Open Explorer</a>
          <h1 className="text-xl text-center font-bold">Course Scheduler</h1>
          <p>Search for courses and automatically generate schedules. Currently tested with most lower-division regular courses. <span title="This is because you don't schedule prerequisites for a course and the course itself at the same time.">Note: Courses are not synchronized between the two tools.</span> </p>
          <p>See your schedule in real time. Data is not persistent currently. Please make sure to screenshot to save your schedule.</p>
          <a href="/courses/ucdavis/scheduler" className="font-bold text-gray-600 cursor-pointer hover:text-blue-600 border-1 w-fit p-2 px-6 border-blue-500 rounded bg-blue-200">Open Scheduler</a>
          <p>Made by an incoming student at UC Davis</p>
          <a className="underline" href="https://github.com/solar138/uc-davis-course-explorer">GitHub</a>
        </article>
      </main>
      <footer className="flex-none h-8 border-t bg-gray-50 px-4 flex items-center border-gray-200 justify-between text-xs text-gray-500 z-10">
        <a className="cursor-pointer hover:text-blue-600" href="/help/course-explorer">Help</a>
      </footer>
    </div>  
  );
}

