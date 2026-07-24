import { Footer } from "@/components/Footer";
import Header from "@/components/Header";

export default async function CourseExplorer() {

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-white">
      <Header> Changelog</Header> 
      <main className="flex-1 flex overflow-hidden min-h-0">
        <article className="p-4 text-justify w-full max-w-2xl mx-auto gap-4 flex flex-col">
          <ChangelogEntry date="July 20, 2026" changes={["User data now persists locally. Logins coming soon for storing your data on the cloud", "Reorganized header"]}/>
          <ChangelogEntry date="July 16, 2026" changes={["Sections now preview meetings when hovering over their list entries", "Some potential bandwidth and performance improvements", "Fixed: Duplicate scheduler error messages"]}/>
          <ChangelogEntry date="July 14, 2026" changes={["Added error messages when scheduling instead of silently failing", "Changed wording on course inspector", "Added unschedule button in section list", "Improved scheduler performance"]}/>
          <ChangelogEntry date="July 13, 2026" changes={["Added changelog", "Reduced bandwidth usage by not sending the entire course library", "Course unlocks temporarily hidden", "Fixed: SVG icons not loading in inspector", "Fixed: Courses showing internal IDs instead of the course code."]}/>
          <ChangelogEntry date="July 10, 2026" changes={["Initial release"]}/>
        </article>
      </main>
      <Footer/>
    </div>  
  );
}

function ChangelogEntry({changes, date, title} : {changes : string[], date : string, title? : string}) {
  return <div>
    <h1 className="text-l font-bold">{date}</h1>
    <ul className="ml-4">
      {changes.map((change, index) => (
        <li className="before:content-['-'] before:mr-2" key={index}>{change}</li>
      ))}
    </ul>
  </div>
}