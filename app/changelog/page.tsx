import { Footer } from "@/components/Footer";
import Header from "@/components/Header";

export default async function CourseExplorer() {

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      <Header> Changelog</Header>
      <main className="flex-1 flex min-h-0 overflow-y-scroll">
        <article className="p-4 text-justify w-full max-w-2xl h-fit mx-auto gap-4 flex flex-col">
          <p>For more detailed changes, feel free to visit the <a href="https://www.github.com/4thharbinger/uc-davis-course-explorer/commits">GitHub commits</a></p>
          <ChangelogEntry date="Sept 23, 2026" changes={["Course section text order flipped so that the location always shows first and is less likely to be clipped off on small screens", "Added Google maps links to locations in schedule"]} />
          <ChangelogEntry date="Sept 22, 2026" changes={["Mobile usability improvements: course catalog can be hidden and header can be collapsed"]} />
          <ChangelogEntry date="Sept 16, 2026" changes={["Added room numbers to schedule view"]} />
          <ChangelogEntry date="Sept 14, 2026" changes={["Implemented basic degree progress visualization: see completed, in-progress, and incomplete degree requirements and add minors to see how you fit"]} />
          <ChangelogEntry date="Sept 5, 2026" changes={["Added current term selector", "You can now create schedules for multiple terms", "Imported Winter 2027 quarter sections"]} />
          <ChangelogEntry date="Aug 2, 2026" changes={["Fix course section display issues", "Fixed some typos in the changelog"]} />
          <ChangelogEntry date="July 28, 2026" changes={["Add transfer credit tab to degree planner"]} />
          <ChangelogEntry date="July 27, 2026" changes={["Add navigation tabs to header"]} />
          <ChangelogEntry date="July 25, 2026" changes={["Reorganized URLs to [school]/[app]. Old URLs will redirect for now.", "Renamed some things", "Should use less bandwidth now"]} />
          <ChangelogEntry date="July 24, 2026" changes={["NEW: Degree planner, currently supports degree program selection and entering exam credits", "Course requirements planning coming soon"]} />
          <ChangelogEntry date="July 23, 2026" changes={["Clicking on a scheduler block now shows it's sections", "Section list for a scheduled course highlights the current section", "Course name now shown on top of section list"]} />
          <ChangelogEntry date="July 20, 2026" changes={["User data now persists locally. Logins coming soon for storing your data on the cloud", "Reorganized header"]} />
          <ChangelogEntry date="July 16, 2026" changes={["Sections now preview meetings when hovering over their list entries", "Some potential bandwidth and performance improvements", "Fixed: Duplicate scheduler error messages"]} />
          <ChangelogEntry date="July 14, 2026" changes={["Added error messages when scheduling instead of silently failing", "Changed wording on course inspector", "Added unschedule button in section list", "Improved scheduler performance"]} />
          <ChangelogEntry date="July 13, 2026" changes={["Added changelog", "Reduced bandwidth usage by not sending the entire course library", "Course unlocks temporarily hidden", "Fixed: SVG icons not loading in inspector", "Fixed: Courses showing internal IDs instead of the course code."]} />
          <ChangelogEntry date="July 10, 2026" changes={["Initial release"]} />
        </article>
      </main>
      <Footer />
    </div>
  );
}

function ChangelogEntry({ changes, date, title }: { changes: string[], date: string, title?: string }) {
  return <div>
    <h1 className="text-l font-bold">{date}</h1>
    <ul className="ml-4">
      {changes.map((change, index) => (
        <li className="before:content-['-'] before:mr-2" key={index}>{change}</li>
      ))}
    </ul>
  </div>
}