import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function askOllama(text: string) {
  // 1. The Strict System Prompt
  const astSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        type: { 
          type: "string", 
          enum: ["and", "or", "course", "exam", "highschool"] 
        },
        operands: { 
          type: "array",
          description: "Used only if type is 'and' or 'or'."
        },
        course: { 
          type: "string",
          description: "The uppercase course slug (e.g., 'MAT021A')."
        },
        grade: { type: "string" },
        isRecommendation: { type: "boolean" },
        isConcurrent: { type: "boolean" },
      },
      required: ["type"],
      additionalProperties: false
    }
  };
  const prompt = `
  You are an expert university data parser. Convert the prerequisite text into a strict JSON Abstract Syntax Tree (AST).
  
  RULES:
  - Output an array of prerequisite objects.
  - Course codes MUST be uppercase slugs without spaces (e.g., "MAT021A").
  - If there are no prerequisites, output an empty array: []5. CRITICAL: The root array itself represents an implicit "AND". NEVER wrap the entire output in a {"type": "and", "operands": [...]} object. If multiple separate requirements exist, just list them as separate objects in the root array.
  - Ignore descriptive text, software requirements, or syllabus notes. (eg. methods of programming). Only extract actionable courses, exams, or high school requirements.
  - There are 5 valid placement exams: "Computer Science Placement Requirement" (slug: "ECS"), "Foreign Language Placement Requirement" (slug: "LANG"), Mathematics Placement Requirement" (slug: "MATH"), "Entry-Level Writing Requirement" (slug: "ELWR"), and "Chemistry Placement Requirement". (slug: "CHEM"). Do not put any other value in the course field of exam type prerequisites.

  EXAMPLE 1:
  Text: "PHY 001A or PHY 009A"
  Output: [{"type": "or", "operands": [{"type": "course", "course": "PHY001A"}, {"type": "course", "course": "PHY009A"}]}]

  EXAMPLE 2:
  Text: "MAT 021A with a grade of C- or better; and PHY 009A (may be taken concurrently)"
  Output: [{"type": "course", "course": "MAT021A", "grade": "C-" }, {"type": "course", "course": "PHY009A", "isConcurrent": true}]

  EXAMPLE 3:
  Text: "High school physics or chemistry recommended."
  Output: [{"type": "or", "operands": [{"type": "highschool", "course": "Physics", "isRecommendation": true}, {"type": "highschool", "course": "Chemistry", "isRecommendation": true}]}]
  
  EXAMPLE 4 (COMPLEX NESTING & NOISE):
  Text: "(ECS 032A or ECS 032AV or ENG 006); (MAT 022A or MAT 027A or MAT 067 or BIS 027A); methods of programming in languages such as MATLAB or Python for numerical analysis will be used. or PHY 204A (can be concurrent); (PHY 104B or PHY 105B or PHY 110C or equivalent or PHY 204A concurrently)"
  Output: [{"type":"or","operands":[{"type":"course","course":"ECS032A"},{"type":"course","course":"ECS032AV"},{"type":"course","course":"ENG006"}]},{"type":"or","operands":[{"type":"course","course":"MAT022A"},{"type":"course","course":"MAT027A"},{"type":"course","course":"MAT067"},{"type":"course","course":"BIS027A"}]},{"type":"or","operands":[{"type":"course","course":"PHY204A","isConcurrent":true},{"type":"course","course":"PHY104B"},{"type":"course","course":"PHY105B"},{"type":"course","course":"PHY110C"}]}]
  
  EXAMPLE 5 (EXAMS AND VAGUE CONDITIONS):
  Text: "A Precalculus Diagnostic Examination score significantly higher than the minimum for MAT 021A is required."
  Output: [{"type": "exam", "course": "MATH", "grade": "Significantly higher than MAT021A minimum"}]

  Now, parse this input:
  Text: "${text}"
  Output: 
  `;

  try {
    // 2. Fetch from your local Ollama server
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1', // Must match the model you downloaded
        prompt: prompt,
        format: astSchema,    // This is the magic flag!
        stream: false,
        options: {
          temperature: 0.1, // Keep the temperature low so it doesn't get "creative" with your schema
          num_ctx: 1024
        }
      })
    });

    const data = await response.json();
    
    // 3. Parse the AI's response into a real JavaScript object
    const json = JSON.parse(data.response);

    console.log(JSON.stringify(json));
    return json.type == "and" ? json.operands : json;
    
  } catch (error) {
    console.error(`[AI Error] Failed to parse: "${text}"`);
    return []; // Fallback to empty if the AI hallucinates
  }
}

async function main() {
  console.log("Fetching courses from the database...");
  
  const courses = await prisma.course.findMany({
    where: { rawPrerequisitesText: { not: null }, prerequisiteRules: { equals: [] } },
  });

  console.log(`Found ${courses.length} courses to parse. Firing up LLaMA 3.1...`);

  let successCount = 0;// 1. Define your batch size. 
  // Start with 4. If your GPU handles it easily, bump it to 8 or 16.
  const BATCH_SIZE = 4; 

  for (let i = 0; i < courses.length; i += BATCH_SIZE) {
    const batch = courses.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(courses.length / BATCH_SIZE)}...`);

    // 2. Fire off all LLM requests in this batch AT THE EXACT SAME TIME
    const results = await Promise.all(batch.map(async (course) => {
      const ast = await askOllama(course.rawPrerequisitesText!);
      return { id: course.id, code: course.code, ast };
    }));

    // 3. Save to SQLite sequentially to prevent "Database is locked" errors
    for (const res of results) {
      // Use length > 0 for arrays (since we updated your schema)
      if (res.ast && res.ast.length > 0) {
        await prisma.course.update({
          where: { id: res.id },
          data: { prerequisiteRules: res.ast }
        });
        successCount++;
      }
    }
  }

  console.log(`\nDone! Successfully AI-parsed ${successCount} prerequisites.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());