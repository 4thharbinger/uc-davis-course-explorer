"use server"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function searchCourses(query: string) {
  if (!query || query.length < 2) return [];

  const results = await prisma.course.findMany({
    where: {
      OR: [
        { slug: { contains: query.replace(/\s/g, '').toUpperCase() } },
        { name: { contains: query } },
      ]
    },
    take: 10,
    select: {
      id: true,
      slug: true,
      code: true,
      name: true,
      shortDesc: true,
    }
  });

  return results;
}