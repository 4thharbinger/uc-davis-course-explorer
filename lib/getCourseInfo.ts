"use server"

import { Course, PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export default async function getCourseInfo(courseCode: string) : Promise<Course | undefined> {

    if (typeof (courseCode) != "string") throw new Error("courseCode must be a string");
    return (await prismaClient.course.findUnique({ where: { slug: courseCode } })) ?? undefined;
}

export async function getCoursesInfo(courseCodes: string[]) : Promise<Record<string, Course>> {
    return (await prismaClient.course.findMany({ where: { slug: { in: courseCodes } } })).reduce((accumulator, course) => {
        accumulator[course.code] = course;
        return accumulator;
    }, {} as Record<string, Course>);
}