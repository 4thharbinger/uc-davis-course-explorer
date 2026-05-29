"use server"

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function searchCourses(query: Object, skip: number = 0) {
  if (!query) return { data: [], hasMore: false };

  const TAKE = 20;

  const results = await prisma.course.findMany({
    where: query,
    take: TAKE + 1,
    skip: skip,
    select: {
      id: true,
      slug: true,
      code: true,
      name: true,
      shortDesc: true
    }
  });

  const hasMore = results.length > TAKE;
  const data = hasMore ? results.slice(0, -1) : results;

  return { data, hasMore };
}