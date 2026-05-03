import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function askOllama(text: string) {
  // 1. The Strict System Prompt
  const prompt = `
  You are a university data parser. Convert the following prerequisite text into a strictly formatted JSON Abstract Syntax Tree (AST).
  
  Rules:
  1. The output MUST be strictly valid JSON.
  2. Convert all course codes to uppercase slugs without spaces (e.g., "MAT 021A" -> "MAT021A").
  3. Use "AND" for requirements that must all be met.
  4. Use "OR" for choices between courses.
  5. If there is no prerequisite, return an empty array: [].

  Schema:
  1. Basic course prerequsites can be entered directly as a string
  2. AND and OR operands {"type": "and" | "or", operands: []}
  3. Top level array is implicit AND. Only use AND operands when necessary inside of OR operands.
  4. Exam prerequsites must be entered like: {"type": "exam", "course": "[Exam name]", "grade?": "[Grade Required]"} (the grade is only required when it is explicitly specified)
  5. Highschool prerequsites must be entered like: {"type": "highschool", "course": "[Subject]"}
  
  Examples:
  Input: "PHY 001A or PHY 009A", Output: [{"type": "or", "operands": ["PHY001A", "PHY009A"]}]
  Input: "PHY 001A or PHY 001AH", Output: [ "PHY001AH" ]
  
  Input Text: "${text}"
  `;

  try {
    // 2. Fetch from your local Ollama server
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1', // Must match the model you downloaded
        prompt: prompt,
        format: 'json',    // This is the magic flag!
        stream: false      // Wait for the whole response, don't stream words
      })
    });

    const data = await response.json();
    
    // 3. Parse the AI's response into a real JavaScript object
    return JSON.parse(data.response);
    
  } catch (error) {
    console.error(`[AI Error] Failed to parse: "${text}"`);
    return {}; // Fallback to empty if the AI hallucinates
  }
}

async function main() {
  console.log("Fetching courses from the database...");
  
  const courses = await prisma.course.findMany({
    where: { rawPrerequisitesText: { not: null } }
  });

  console.log(`Found ${courses.length} courses to parse. Firing up LLaMA 3.1...`);

  let successCount = 0;

  // We use a classic for-loop so we don't bombard the local GPU with 100 requests at once
  for (const course of courses) {
    if (!course.rawPrerequisitesText) continue;

    console.log(`Parsing: ${course.code} - "${course.rawPrerequisitesText}"`);
    
    const ast = await askOllama(course.rawPrerequisitesText);
    
    if (Object.keys(ast).length > 0) {
      await prisma.course.update({
        where: { id: course.id },
        data: { prerequisiteRules: ast }
      });
      successCount++;
    }
  }

  console.log(`\nDone! Successfully AI-parsed ${successCount} prerequisites.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());