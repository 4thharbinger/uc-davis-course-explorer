import { PrismaClient } from '@prisma/client';
import { askOllama } from './parse-prereqs';

const prisma = new PrismaClient();
async function cleanupHallucinations() {
  console.log("Scanning database for 'type: grade' hallucinations...");

  const allCourses = await prisma.course.findMany({
    where: { rawPrerequisitesText: { not: null } }
  });

  const corruptedCourses = allCourses.filter(course => {
    if (!course.prerequisiteRules) return false;
    
    // find errors through deep json using stringify
    const jsonString = JSON.stringify(course.prerequisiteRules);
    return jsonString.includes('"type":"grade"') || jsonString.includes('{"grade":"');
  });

  if (corruptedCourses.length === 0) {
    console.log("No corrupted entries found.");
    return;
  }

  console.log(`Found ${corruptedCourses.length} corrupted courses.`);

  for (const course of corruptedCourses) {
    console.log(`Fixing: ${course.code}`);
    
    const fixedAst = await askOllama(course.rawPrerequisitesText!, course.code + ": " + course.name);
    
    if (fixedAst && fixedAst.length > 0) {
      await prisma.course.update({
        where: { id: course.id },
        data: { prerequisiteRules: fixedAst }
      });
    }
  }

  console.log("Cleanup complete.");
}

cleanupHallucinations()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());