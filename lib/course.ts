import NestedArray from "./nestedArray"

 
export function CreateCourse(course : CourseWithStringPrereqs) : Course {
    
    traverse(course.prerequisites);
    
    return course as Course;
}  

function traverse(prereqs : CoursePrequisitesWithString) {
    for (var i = 0; i < prereqs.length; i++) {
        var prereq = prereqs[i];
        if (typeof prereq == "string") {
            prereqs[i] = prereq.indexOf("(H)") >= 0 ? 
            { type : "or", operands : [
                { type : "course", course : prereq.replace("(H)", "") },
                { type : "course", course : prereq.replace("(H)", "H") }
            ]} : 
            { type : "course", course : prereq };
            continue;
        }
        switch (prereq.type) {
            case "or":
                traverse(prereq.operands);
                break;
            case "and":
                traverse(prereq.operands);
                break;
        }
    }
}


export function PrequisitesToString(prerequisites : CoursePrequisites, depth : number = 0) : NestedArray<string> {

    return prerequisites.map(prereq => {
        switch (prereq.type) {
            case "course":
                return (prereq.isConcurrent ? "Concurrent with " : "") + "[" + prereq.course + "]";
            case "exam":
                return prereq.grade ? "Score ≥ " + prereq.grade + " on " + prereq.course! : prereq.course!;
            case "highschool":
                return prereq.course  + " in High School";
            case "or":
                return depth == 0 ? PrequisitesToString(prereq.operands, depth + 1).join(" or ") : "(" + PrequisitesToString(prereq.operands, depth + 1).join(" or ") + ")";
            case "and":
                return depth == 0 ? PrequisitesToString(prereq.operands, depth + 1).join(" and ") : "(" + PrequisitesToString(prereq.operands, depth + 1).join(" and ") + ")";
            default:
                return prereq as string;
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
  unlockIds : string[],
  id : string,
  grading : "Letter" | "P/NP" | "Both"
}
export type CourseWithStringPrereqs = {
  name : string,
  description : string,
  shortDesc? : string,
  code : string,
  units : number,
  instructorIds : string[],
  prerequisites : CoursePrequisitesWithString,
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
    type : "course" | "exam" | "highschool",
    course : string,
    grade? : string,
    isRecommendation? : boolean,
    isConcurrent? : boolean,
}

export type CoursePrequisitesWithString = (CoursePrerequiste | CoursePrerequsiteOrWithString | CoursePrerequsiteAndWithString | string)[] 

export type CoursePrerequsiteOrWithString = {
    type : "or",
    operands : (CoursePrerequiste | CoursePrerequsiteAnd | string)[]
}
export type CoursePrerequsiteAndWithString = {
    type : "and",
    operands : (CoursePrerequiste | CoursePrerequsiteOrWithString | string)[]
}