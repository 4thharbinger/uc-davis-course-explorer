import Login from "@/components/Login";

export default async function CourseExplorer() {

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white">
      <header className="flex-none h-14 border-b px-4 flex items-center bg-white z-10 border-gray-200 text-2xl font-bold"> Login —  <span className="ml-2 text-gray-500">Course Explorer</span> </header> 
      <main className="flex-1 flex overflow-hidden min-h-0">
        <Login register={false} />
      </main>
      <footer className="flex-none h-8 border-t bg-gray-50 px-4 flex items-center border-gray-200 justify-between text-xs text-gray-500 z-10">
        <a className="cursor-pointer hover:text-blue-600" href="/help/course-explorer">Help</a>
      </footer>
    </div>  
  );
}

