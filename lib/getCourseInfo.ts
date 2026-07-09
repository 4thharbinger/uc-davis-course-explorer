"use server"

import { Course, PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

export default async function getCourseInfo(courseCode: string) : Promise<Course | undefined> {

    if (typeof (courseCode) != "string") throw new Error("courseCode must be a string");
    return (await prisma.course.findUnique({ where: { slug: courseCode } })) ?? undefined;
}

export async function getCoursesInfo(courseCodes: string[]) : Promise<Record<string, Course>> {
    return (await prisma.course.findMany({ where: { slug: { in: courseCodes } } })).reduce((accumulator, course) => {
        accumulator[course.code] = course;
        return accumulator;
    }, {} as Record<string, Course>);
}