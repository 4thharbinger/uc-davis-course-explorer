import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeSpacesFromSectionCourseCodes() {
  console.log("Scanning sections to remove spaces from course codes...");

  const allSections = await prisma.section.findMany();
  let updatedCount = 0;

  for (const section of allSections) {
    const originalCourseCode = section.courseCode;
    const newCourseCode = originalCourseCode.replace(/\s/g, '');

    if (originalCourseCode !== newCourseCode) {
      try {
        await prisma.section.update({
          where: { crn: section.crn }, // Assuming 'crn' is the unique identifier for Section
          data: { courseCode: newCourseCode }
        });
        console.log(`Updated section CRN ${section.crn}: '${originalCourseCode}' -> '${newCourseCode}'`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating section CRN ${section.crn}:`, error);
      }
    }
  }

  console.log(`\nFinished. Updated ${updatedCount} section course codes.`);
}

removeSpacesFromSectionCourseCodes()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });