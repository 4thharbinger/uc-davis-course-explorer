import { PrismaClient } from '@prisma/client';
import ibExams from '../raw/ibexams.json'; // adjust path as needed

const prisma = new PrismaClient();

async function ingestIBExams() {
  console.log("Starting IB Exam ingestion...");

  for (const examData of ibExams) {
    // 1. Clean the data
    const subject = examData.name.trim();
    const type = "ib";
    const level = "hl"; // Standardizing to HL for UC Davis IB credits
    const minScore = examData.minScore || 5; // Default to 5 if not specified

    // 2. Upsert the base Exam record
    await prisma.exam.upsert({
      where: {
        type_subject_level: { type, subject, level }
      },
      update: {},
      create: { type, subject, level, name: subject }
    });

    console.log()
    // 3. Upsert the Exam Credit rule for UC Davis
    await prisma.examCredit.upsert({
      where: {
        // Prisma combines the unique fields into this object name:
        school_examType_examSubject_examLevel_minScore: {
          school: "ucdavis",
          examType: type,
          examSubject: subject,
          examLevel: level,
          minScore: minScore
        }
      },
      update: {
        creditUnits: examData.units,
        // Connect any courses this exam unlocks
        creditCourses: {
          connect: examData.courses.map((courseCode) => ({ code: courseCode }))
        }
      },
      create: {
        school: "ucdavis",
        examType: type,
        examSubject: subject,
        examLevel: level,
        minScore: minScore,
        creditUnits: examData.units,
        creditCourses: {
          connect: examData.courses.map((courseCode) => ({ code: courseCode }))
        }
      }
    });

    console.log(`✅ Ingested: ${subject} (Min Score: ${minScore})`);
  }

  console.log("Finished ingesting all IB exams!");
}

ingestIBExams()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());