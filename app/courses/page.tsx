export default function CourseExplorer() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans dark:bg-black">
      <main>
        <h1> UC Davis Course Explorer </h1>
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        
        {/* Column 1: Search Panel */}
        <div className="w-1/5 min-w-[250px] border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b">
            <input type="text" placeholder="Search classes..." className="w-full" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Scrollable list of search results goes here */}
          </div>
        </div>

        {/* Column 2: Course Details Panel */}
        {CoursePanel(PHY009A)}

        {/* Column 3: The Tech Tree Canvas */}
        <div className="flex-1 relative bg-gray-100">
          Tech tree goes here saoigdsadiofjasoid jasopidf jaoispdf joiapsdj foipasdjf opiasdj fopaisdf.
        </div>

      </div>
      </main>
    </div>
  );
}

function CoursePanel(course : Course) {
  return <div className="w-1/4 min-w-[300px] border-r border-gray-200 bg-white p-6 overflow-y-auto">
    <h2 className="text-xl font-bold">{course.code}</h2>
    <p className="text-gray-500">{course.name}</p>
    
    <p className="mt-4"> Units: {course.units}</p>
    {HierarchyList("Instructors", course.instructorIds)}
    {HierarchyList("Prerequisites", [])}
    {HierarchyList("Unlocks", [])}
  </div>;
}

function HierarchyList(title : string, content : object[], empty : string = "None" ) {
  var contents = <ul className="ml-4">
    {content.length > 0 ? content.map((item, index) => (
      <li key={index}>{item.toString()}</li>
    )) : <li className="text-gray-500 italic">{empty}</li>}
  </ul>;
  return <div>
    <h3 className="font-bold">
      {title}
    </h3>
    {contents}
  </div>;
}
 
export type Course = {
  name : string,
  code : string,
  units : number,
  instructorIds : string[],
  prerequisiteIds : string[],
  unlockIds : string[],
  grading : "Letter" | "P/NP" | "Both"
}

const PHY009A : Course = {
  name : "Classical Physics 1",
  code : "PHY 009A",
  units : 5,
  instructorIds : [],
  prerequisiteIds : [],
  unlockIds : [],
  grading : "Letter"
}

const PHY009B : Course = {
  name : "Classical Physics 2",
  code : "PHY 009B",
  units : 5,
  instructorIds : [],
  prerequisiteIds : [ "PHY 009A" ],
  unlockIds : [],
  grading : "Letter"
}