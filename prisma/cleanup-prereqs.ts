import { PrismaClient } from '@prisma/client';
import { askOllama } from './parse-prereqs';

const prisma = new PrismaClient();
async function cleanupHallucinations() {
  console.log("Scanning database for 'type: grade' hallucinations...");

  // 1. Fetch every course that has parsed rules
  const allCourses = await prisma.course.findMany({
    where: { rawPrerequisitesText: { not: null } }
  });

  // 2. The Stringify Hack: Instantly search deeply nested JSON
  const corruptedCourses = allCourses.filter(course => {
    if (!course.prerequisiteRules) return false;
    
    // When Node stringifies the JSON, it removes spaces, so we search for exactly this:
    const jsonString = JSON.stringify(course.prerequisiteRules);
    return jsonString.includes('"type":"grade"');
  });

  if (corruptedCourses.length === 0) {
    console.log("No corrupted entries found! Your database is clean.");
    return;
  }

  console.log(`Found ${corruptedCourses.length} corrupted courses. Firing up Ollama to fix them...`);

  // 3. Re-run ONLY the corrupted courses using your updated askOllama prompt
  for (const course of corruptedCourses) {
    console.log(`Fixing: ${course.code}`);
    
    const fixedAst = await askOllama(course.rawPrerequisitesText!);
    
    if (fixedAst && fixedAst.length > 0) {
      await prisma.course.update({
        where: { id: course.id },
        data: { prerequisiteRules: fixedAst }
      });
    }
  }

  console.log("Cleanup complete! All grade nodes have been eradicated.");
}

// Change your script execution at the bottom to run the cleanup instead of main:
cleanupHallucinations()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());