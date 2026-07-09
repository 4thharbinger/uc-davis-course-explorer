import { PrismaClient } from '@prisma/client';
import { askOllama } from './parse-prereqs';
import { JSONValue } from 'next/dist/server/config-shared';
import { JsonObject } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

console.log("Finding all meetings");
async function findMeetingTypes() {
  const sections = await prisma.section.findMany({});
  var meetingTypes : Record<string, string> = {};
  for (const section of sections) {
    if (!Array.isArray(section.meetings)) {
      continue;
    }
    for (const meeting of section.meetings) {
      if (meeting != null && (meeting as JsonObject).description != undefined && (meeting as JsonObject).type != undefined) {
        const description : string = (meeting as JsonObject).description as unknown as string;
        const type : string = (meeting as JsonObject).type as unknown as string;
        meetingTypes[type] = description;
      }
    }
  }
  console.log("Found meeting types:", meetingTypes);
}

findMeetingTypes();