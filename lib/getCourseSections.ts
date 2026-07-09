"use server"

import { Course, PrismaClient, Section } from '@prisma/client';

const prismaClient = new PrismaClient();

export default async function getCourseSections(courseCode: string) : Promise<Section[] | undefined> {

    if (typeof (courseCode) != "string") throw new Error("courseCode must be a string");
    return (await prismaClient.section.findMany({ where: { courseCode } })) ?? undefined;
}