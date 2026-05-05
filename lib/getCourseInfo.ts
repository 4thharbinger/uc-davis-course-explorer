"use server"

import { Course, PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export default async function getCourseInfo(courseCode: string) : Promise<Course | undefined> {

    if (typeof (courseCode) != "string") throw new Error("courseId must be a string");
    return (await prismaClient.course.findUnique({ where: { slug: courseCode.replaceAll(" ", "") } })) ?? undefined;
}