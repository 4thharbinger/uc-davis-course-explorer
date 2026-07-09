"use server"

import { Course, Instructor, PrismaClient, Section } from '@prisma/client';

const prismaClient = new PrismaClient();

export async function getCourseSections(courseCode: string) : Promise<Section[] | undefined> {

    if (typeof (courseCode) != "string") throw new Error("courseCode must be a string");
    return (await prismaClient.section.findMany({ where: { courseCode } })) ?? undefined;
}

export async function getCoursesSections(courseCode: string[]) : Promise<Record<string, Section[]> | undefined> {

    if (!Array.isArray(courseCode)) throw new Error("courseCode must be an array of strings");
    const sections = await prismaClient.section.findMany({ where: { courseCode: { in: courseCode } } });
    return sections.reduce((acc, section) => {
        acc[section.courseCode] = acc[section.courseCode] || [];
        acc[section.courseCode].push(section);
        return acc;
    }, {} as Record<string, Section[]>);
}

export async function getSections(sectionCrns: number[]) : Promise<Record<number, Section>> {

    if (!Array.isArray(sectionCrns)) throw new Error("sectionCrns must be an array of numbers");
    const sections : Record<number, Section> = {};
    (await prismaClient.section.findMany({ where: { crn: { in: sectionCrns.map(crn => "" + crn) } } })).forEach(section => {
        sections[+section.crn] = section;
    });
    return sections ?? undefined;
}


export async function getCourseSectionsWithInstructors(courseCode: string) : Promise<(Section & { instructors: Instructor[] })[] | undefined> {

    if (typeof (courseCode) != "string") throw new Error("courseCode must be a string");
    return (await prismaClient.section.findMany({ where: { courseCode }, include: { instructors: true } }));
}

export async function getCourseInstructors(courseCode: string) : Promise<Instructor[] | undefined> {
    if (typeof (courseCode) != "string") throw new Error("courseCode must be a string");
    const instructors = (await prismaClient.course.findUnique({ where: { slug: courseCode }, include: { sections: { include: { instructors: true } } } }))?.sections.flatMap(section => section.instructors);
    return [...new Map(instructors?.map(instructor => [instructor.fullName, instructor])).values()]
}