"use server"

import { Course, PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function setCourseShortDesc(courseCode : string, shortDesc: string) {

    if (courseCode == undefined) return;
    if (typeof (courseCode) != "string") throw new Error("courseId must be a string");

    console.log(courseCode, shortDesc)

    await prismaClient.course.update({ where: { slug: courseCode.replaceAll(" ", "") }, data: { shortDesc } });
}