import { getExamName } from "./graphUtils";
import NestedArray from "./nestedArray"

 
// export function CreateCourse(course : CourseWithStringPrereqs) : Course {
    
//     traverse(course.prerequisites);
    
//     return course as Course;
// }  

// function traverse(prereqs : CoursePrequisitesWithString) {
//     for (var i = 0; i < prereqs.length; i++) {
//         var prereq = prereqs[i];
//         if (typeof prereq == "string") {
//             prereqs[i] = prereq.indexOf("(H)") >= 0 ? 
//             { type : "or", operands : [
//                 { type : "course", course : prereq.replace("(H)", "") },
//                 { type : "course", course : prereq.replace("(H)", "H") }
//             ]} : 
//             { type : "course", course : prereq };
//             continue;
//         }
//         switch (prereq.type) {
//             case "or":
//                 traverse(prereq.operands);
//                 break;
//             case "and":
//                 traverse(prereq.operands);
//                 break;
//         }
//     }
// }


export function PrequisitesToString(prerequisites : CoursePrequisites, depth : number = 0) : NestedArray<string> {

    return prerequisites.map(prereq => {
        switch (prereq.type) {
            case "course":
                return (prereq.isConcurrent ? "Concurrent with " : "") + "[" + prereq.course + "]";
            case "exam":
                return getExamName(prereq);
            case "highschool":
                return prereq.course  + " in High School";
            case "or":
                return prereq.operands.length == 0 ? [PrequisitesToString(prereq.operands, depth + 1).join(" or ")] : [ "Any of ", PrequisitesToString(prereq.operands, depth + 1)];
            case "and":
                return prereq.operands.length == 0 ? [PrequisitesToString(prereq.operands, depth + 1).join(" and ")] : [ "All of ", PrequisitesToString(prereq.operands, depth + 1)];
            case "consent":
                return "Instructor consent";
            case "standing":
                return prereq.course + " standing";
            default:
                throw new TypeError("Invalid prerequisite of type " + (prereq as CoursePrerequiste).type);
        }
    });
}

export type CourseLibrary = Record<string, Course>;

export type Course = {
  name : string,
  description : string,
  shortDesc? : string,
  code : string,
  units : number,
  instructorIds : string[],
  prerequisites : CoursePrequisites,
  rawPrerequisites? : string,
  generalEducation? : CourseGeneralEducation,
  unlockIds : string[],
  id : string,
  grading : "Letter" | "P/NP" | "Both"
}

export type CoursePrequisites = (CoursePrerequiste | CoursePrerequsiteOr | CoursePrerequsiteAnd)[] 

export type CoursePrerequsiteOr = {
    type : "or",
    operands : (CoursePrerequiste | CoursePrerequsiteAnd)[]
}
export type CoursePrerequsiteAnd = {
    type : "and",
    operands : (CoursePrerequiste | CoursePrerequsiteOr)[]
}

export type CoursePrerequiste = {
    type : "course" | "exam" | "highschool" | "consent" | "standing",
    course : string,
    grade? : string,
    isRecommendation? : boolean,
    isConcurrent? : boolean,
}

// export type CourseWithStringPrereqs = {
//   name : string,
//   description : string,
//   shortDesc? : string,
//   code : string,
//   units : number,
//   instructorIds : string[],
//   prerequisites : CoursePrequisitesWithString,
//   rawPrerequisites? : string,
//   generalEducation? : CourseGeneralEducation,
//   unlockIds : string[],
//   id : string,
//   grading : "Letter" | "P/NP" | "Both"
// }
// export type CoursePrequisitesWithString = (CoursePrerequiste | CoursePrerequsiteOrWithString | CoursePrerequsiteAndWithString | string)[] 

// export type CoursePrerequsiteOrWithString = {
//     type : "or",
//     operands : (CoursePrerequiste | CoursePrerequsiteAnd | string)[]
// }
// export type CoursePrerequsiteAndWithString = {
//     type : "and",
//     operands : (CoursePrerequiste | CoursePrerequsiteOrWithString | string)[]
// }

export type CourseGeneralEducation = {
    topicalBreadth? : string[],
    coreLiteracies? : string[]
}

export type Meeting = {
    monday : boolean,
    tuesday : boolean,
    wednesday : boolean,
    thursday : boolean,
    friday : boolean,
    saturday : boolean,
    sunday : boolean,

    room : string,
    type : MeetingType,
    description : string,

    startDate : string,
    endDate : string,
    startTime : string,
    endTime : string,
    daysString : string,

    building : string,
    buildingCode : string,
    meetCode : string,
}

export type MeetingType = 
  'LEC' | 'DIS' | 'VAR' | 'LED' | 
  'D/L' | 'SEM' | 'LLA' | 'INT' | 
  'LAB' | 'FWK' | 'W-D' | 'STD' | 
  'WVL' | 'F-V' | 'COM' | 'WED' | 
  'PRJ' | 'CON' | 'IND' | 'L/D' | 
  'T-D' | 'PER' | 'LIS' | 'WRK' | 
  'REH' | 'PRA' | 'CLI' | 'TUT' | 
  'AUT'

export type MeetingDescription = 
  'Lecture' | 
  'Discussion' | 
  'Variable' | 
  'Lecture/Discussion' | 
  'Discussion Laboratory' | 
  'Seminar' | 
  'Lecture/Lab' | 
  'Internship' | 
  'Laboratory' | 
  'Fieldwork' | 
  'Extensive Writing/Discussion' | 
  'Studio' | 
  'World Wide Web Virtual Lecture' | 
  'Film Viewing' | 
  'Combined Scheduled' | 
  'World Wide Web Electronic Dis' | 
  'Term Project' | 
  'Conference' | 
  'Independent Study' | 
  'Laboratory/Discussion' | 
  'Term Paper/Discussion' | 
  'Performance Instruction' | 
  'Listening' | 
  'Workshop' | 
  'Rehearsal' | 
  'Practice' | 
  'Clinic' | 
  'Tutorial' | 
  'Auto Tutorial'

export const meetingTypeToDescription : Record<MeetingType, MeetingDescription> = {
  LEC: 'Lecture',
  DIS: 'Discussion',
  VAR: 'Variable',
  LED: 'Lecture/Discussion',
  'D/L': 'Discussion Laboratory',
  SEM: 'Seminar',
  LLA: 'Lecture/Lab',
  INT: 'Internship',
  LAB: 'Laboratory',
  FWK: 'Fieldwork',
  'W-D': 'Extensive Writing/Discussion',
  STD: 'Studio',
  WVL: 'World Wide Web Virtual Lecture',
  'F-V': 'Film Viewing',
  COM: 'Combined Scheduled',
  WED: 'World Wide Web Electronic Dis',
  PRJ: 'Term Project',
  CON: 'Conference',
  IND: 'Independent Study',
  'L/D': 'Laboratory/Discussion',
  'T-D': 'Term Paper/Discussion',
  PER: 'Performance Instruction',
  LIS: 'Listening',
  WRK: 'Workshop',
  REH: 'Rehearsal',
  PRA: 'Practice',
  CLI: 'Clinic',
  TUT: 'Tutorial',
  AUT: 'Auto Tutorial'
}