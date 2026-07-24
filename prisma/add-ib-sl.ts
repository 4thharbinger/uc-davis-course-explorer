
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// duplicates every hl exam and creates an sl version of it
async function duplicateExams() {
    for (const exam of await prisma.exam.findMany({where: { level: "hl" }})) {
        await prisma.exam.create({
            data: {
                type: exam.type,
                subject: exam.subject,
                level: "sl",
                name: exam.name
            }
        });
        console.log("Succesfully duplicated " + exam.name);
    }
}

duplicateExams();