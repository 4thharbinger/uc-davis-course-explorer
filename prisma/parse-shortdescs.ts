import { Course, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function standardizeSequences() {
  console.log("Fetching all courses to find sequences...");
  const allCourses = await prisma.course.findMany();

  const sequences: Record<string, Course[]> = {};
  
  for (const course of allCourses) {
    const match = course.code.match(/^([A-Z]{3}\s\d{3})/);
    if (match) {
      const baseCode = match[0];
      if (!sequences[baseCode]) sequences[baseCode] = [];
      sequences[baseCode].push(course);
    }
  }

  const validSequences = Object.values(sequences).filter(seq => seq.length > 1);
  console.log(`Found ${validSequences.length} course sequences to standardize.`);

  for (const sequence of validSequences) {
    const baseCode = sequence[0].code.substring(0, 7);
    console.log(`Standardizing sequence: ${baseCode}...`);

    const sequenceData = sequence.map(c => ({
      code: c.code,
      currentName: c.name,
      description: c.description
    }));

    const prompt = `
    You are a strict, minimalist university catalog editor. 
    Below is a sequence of related courses. Standardize their names so they follow a perfectly consistent, ultra-concise naming convention.
    
    RULES:
    1. Use classic, minimalist academic names (e.g., "Differential Calculus" instead of "Calculus of Functions and Motion").
    2. Keep it as short as possible.
    3. If it is an Honors course, append "(Honors)".
    4. If it is a lab or workshop, append "(Workshop)" or "(Lab)".
    5. Output ONLY a strict JSON object mapping the course code to the new name. Do NOT output markdown formatting like \`\`\`json.
    
    EXAMPLE INPUT:
    [{"code": "PHY009A", "currentName": "Classical Physics", "description": "Introduction to general principles and analytical methods used in physics for physical science and engineering majors. Classical mechanics."},
     {"code": "PHY009B", "currentName": "Classical Physics", "description": "Continuation of PHY 009A. Fluid mechanics, thermodynamics, wave phenomena, optics."},
     {"code": "PHY009C", "currentName": "Classical Physics", "description": "Electricity and magnetism including circuits and Maxwell's equations."},
     {"code": "PHY009D", "currentName": "Modern Physics", "description": "Introduction to physics concepts developed since 1900. Special relativity, quantum mechanics, atoms, molecules, condensed matter, nuclear and particle physics."}]
    
    EXAMPLE OUTPUT:
    {"PHY009A": "Classical Mechanics", "PHY009B": "Fluids and Waves", "PHY009C": "Electromagnetism", "PHY009D": "Special Relativity and Quantum Mechanics"}

    INPUT SEQUENCE:
    ${JSON.stringify(sequenceData)}
    
    OUTPUT:
    `;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1',
        prompt: prompt,
        stream: false,
        format: "json",
        options: { temperature: 0.1, num_ctx: 2048 }
      })
    });

    const data = await response.json();
    
    try {
      const newNames = JSON.parse(data.response);
      
      for (const course of sequence) {
        if (newNames[course.code]) {
          await prisma.course.update({
            where: { id: course.id },
            data: { shortDesc: newNames[course.code] }
          });
        }
      }
    } catch (e) {
      console.log(`Failed to parse JSON for ${baseCode}. Skipping.`);
    }
  }
  
  console.log("Sequence standardization complete!");
}

standardizeSequences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());