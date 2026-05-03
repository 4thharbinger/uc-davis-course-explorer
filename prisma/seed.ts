import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });


async function main() {
  console.log('Reading JSON data...');
  
  const filePath = path.join(process.cwd(), 'prisma', 'data');
  const files = fs.readdirSync(filePath);
  
  const rawData = await Promise.all(files.map(file => readFile(path.join(process.cwd(), 'prisma', 'data', file), "utf8")));

  const data = rawData.map((raw) => JSON.parse(raw));
  const courses = data.flat();

  console.log(`Injecting ${courses.length} courses into the database...`);
  await prisma.course.deleteMany();
  await prisma.course.createMany({
    data: courses,
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });