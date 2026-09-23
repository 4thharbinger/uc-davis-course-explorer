"use client";
import getExams, { getExamCredits } from "@/lib/getExams";
import useDegreeStore, { StudentCourse } from "@/store/useDegreeStore";
import { useGraphStore } from "@/store/useGraphStore";
import { Course, Degree, Exam, ExamCredit, School } from "@prisma/client";
import { JSX, ReactNode, useEffect, useState } from "react";
import CourseSearch from "./CourseSearch";
import { Dropdown } from "./Dropdown";
import { NumberField } from "./NumberField";
import { getDegreesInfo } from "@/lib/getDegreeInfo";
import { DegreeCourseRequirement, DegreeRequirement, DegreeRequirementSubcategory, getCourses } from "./DegreeInspector";
import { getCoursesInfo } from "@/lib/getCourseInfo";
import { currentTerm } from "@/lib/termInfo";
import useScheduleStore from "@/store/useScheduleStore";

export default function DegreePlanner({ school }: { school: School }) {
    const [examType, setExamType] = useState("None");
    const [examSubject, setExamSubject] = useState("None");
    const [examLevel, setExamLevel] = useState("None");
    const [examScore, setExamScore] = useState(0);
    const [exams, setExams] = useState<Exam[]>([]);
    const [examCredits, setExamCredits] = useState<(ExamCredit & { creditCourses: Course[] })[]>([]);
    const setInspectedCourse = useGraphStore((state) => state.setInspectedCourse);

    const [degreeRequirements, setDegreeRequirements] = useState<Record<string, Degree>>();

    const userExams = useDegreeStore((state) => state.exams);
    const addExam = useDegreeStore((state) => state.addExam);
    const removeExam = useDegreeStore((state) => state.removeExam);
    const updateExams = useDegreeStore((state) => state.updateExams);
    const hideDiplomaWarning = useDegreeStore((state) => state.hideDiplomaWarning);
    const setHideDiplomaWarning = useDegreeStore((state) => state.setHideDiplomaWarning);
    const tabState = useDegreeStore((state) => state.tabState);
    const setTabState = useDegreeStore((state) => state.setTabState);
    const setAwardedCredit = useDegreeStore((state) => state.setAwardedCredit);
    const courses = useDegreeStore((state) => state.courses);
    const degrees = useDegreeStore((state) => state.degreePrograms);
    const [degreeCourses, setCourses] = useState<Record<string, Course>>();
    const schedules = useScheduleStore((state) => state.schedules);

    const studentCourses = {} as Record<string, StudentCourse>;
    for (const course of courses)
        studentCourses[course.slug] = course;
    for (const examCredit of examCredits)
        for (const credit of examCredit.creditCourses)
            studentCourses[credit.slug] = { ...credit, status: "complete", section: examCredit.examSubject, term: "000000", grade: { letter: "P" } };

    for (const termCode in schedules) {
        const schedule = schedules[termCode];
        for (const courseCode in schedule) {
            if (studentCourses[courseCode] == undefined) {
                studentCourses[courseCode] = {
                    name: courseCode,
                    id: "",
                    code: courseCode,
                    rawPrerequisitesText: null,
                    schoolName: school.name,
                    description: "", 
                    shortDesc: "",
                    grading: "",
                    units: "",
                    learningActivities: [],
                    generalEducation: [],
                    prerequisiteRules: [],
                    slug: courseCode,
                    term: termCode,
                    status: termCode == currentTerm ? "in progress" : +termCode < +currentTerm ? "complete" : "incomplete"
                };
            }
        }
    }

    console.log(studentCourses);
    console.log(currentTerm);

    useEffect(() => {
        getExams(examType == "None" ? undefined : examType).then(exams => setExams(exams));
    }, [examType, examSubject]);

    useEffect(() => {
        getDegreesInfo(school.name, degrees).then(degrees => {
            setDegreeRequirements(degrees);

            const requirements = Object.values(degrees).flatMap(degree => degree.requirements) as DegreeRequirement[];

            if (requirements == undefined) return console.log("no requirements found for degrees", degrees);
            const courses = requirements.flatMap(requirement => requirement.subcategories.flatMap(subcategory => subcategory.courses.flatMap(course => getCourses(course))));
            getCoursesInfo(school.name, courses).then((courses) => {
                setCourses(courses);
            });
        });
    }, [degrees]);

    useEffect(() => {
        getExamCredits(userExams.some(exam => exam.type == "ib") ? [...userExams, { type: "ib", subject: "diploma", level: "", score: 45 } as StudentExam] : userExams, school.name)
            .then(exams => {
                const filteredExams = exams.filter(exam => {
                    const score = userExams.find(ex => ex.type == exam.examType && ex.subject == exam.examSubject && ex.level == exam.examLevel)?.score ?? 0;
                    return score >= exam.minScore && score <= exam.maxScore;
                });
                setExamCredits(filteredExams);
                setAwardedCredit(filteredExams.flatMap(exam => exam.creditCourses));
            });
    }, [userExams]);

    const validSubjects: Record<string, string> = {};
    const validLevels: Record<string, string> = {};
    exams.forEach(exam => validSubjects[exam.subject] = exam.name);
    exams.forEach(exam => { if ((exam.subject == examSubject || examSubject == "None") && exam.level != "") validLevels[exam.level] = exam.level.toUpperCase() });

    const totalCredits = userExams.reduce((a, b) => a + (examCredits.find(ex => ex.examType == b.type && ex.examLevel == b.level && ex.examSubject == b.subject &&
        (b.score == undefined || b.score >= ex.minScore && b.score <= ex.maxScore))?.creditUnits ?? 0), 0);


    return <div className="grow h-full border-r border-gray-200 bg-white p-4">
        <div className="flex w-full">
            <fieldset className="tabGroup">
                <label className="tab"><input type="radio" name="activeTab" value="exams" defaultChecked={tabState == "exams"} onChange={() => setTabState("exams")} /> Exams </label>
                <label className="tab"><input type="radio" name="activeTab" value="credit" defaultChecked={tabState == "credit"} onChange={() => setTabState("credit")} /> Credit </label>
                <label className="tab"><input type="radio" name="activeTab" value="progress" defaultChecked={tabState == "progress"} onChange={() => setTabState("progress")} /> Progress </label>
                <label className="tab"><input type="radio" name="activeTab" value="plan" defaultChecked={tabState == "plan"} onChange={() => setTabState("plan")} /> My Plan </label>
            </fieldset>
        </div>
        {tabState == "exams" && <div className="m-auto max-w-[1000]">
            <h1 className="mt-4 text-xl font-bold"> Add Exam </h1>
            <div className="grid grid-cols-3 gap-2">
                <Dropdown
                    title="Exam Type"
                    defaultValue={examType}
                    onChange={setExamType}
                    options={{ "ib": "International Baccalaureate", "ap": "Advanced Placement" }} />
                <Dropdown
                    title="Exam Subject"
                    defaultValue={examSubject}
                    onChange={setExamSubject}
                    disabled={examType == "None"}
                    options={validSubjects} />
                <Dropdown
                    title="Exam Level"
                    defaultValue={examLevel}
                    onChange={setExamLevel}
                    disabled={examSubject == "None"}
                    options={validLevels} />
            </div>
            <NumberField
                min={0}
                max={getExamMaxScore(examSubject, examType)}
                title="Exam Score" defaultValue={examScore}
                disabled={examSubject == "None"}
                onChange={setExamScore} />
            <button onClick={() => {

                const rawExam = exams.find(exam => exam.subject == examSubject && (Object.values(validLevels).length == 0 || exam.level == examLevel));

                if (rawExam != undefined) {
                    const exam = { ...rawExam, score: examScore }
                    addExam(exam);
                } else {
                    alert("Exam not found: " + examSubject + " " + examLevel);
                }
            }}
                disabled={(examLevel == "None") && (Object.values(validLevels).length > 0)} className="button blue ml-1">
                Add Exam
            </button>
            <h1 className="mt-4 text-xl font-bold"> Your Exams </h1>
            <div className="w-full border-1 border-gray-500 rounded p-4">
                {userExams.length == 0 ? <span className="text-gray-500 italic"> No exams. Add some? </span> : renderExamTable(userExams, exam => updateExams(), removeExam, examCredits)}
                {userExams.length > 0 && <div className="mt-4">Total Credits: <span>{totalCredits}</span> </div>}
                {(!hideDiplomaWarning) && userExams.filter(exam => exam.type == "ib").length >= 6 && !userExams.some(exam => exam.type == "ib" && exam.subject == "diploma") && examCredits.some(exam => exam.examSubject == "diploma" && exam.examType == "ib") && <div className="bg-gray-200 p-4 rounded">
                    Did you complete an IB Diploma? {school.shortName} gives credit for completed diplomas. <br />
                    <span className="button red pill mt-2" onClick={() => setHideDiplomaWarning(true)}> Hide</span>
                    <span className="button blue pill ml-2" onClick={() => addExam({ type: "ib", subject: "diploma", level: "", name: "IB Diploma", score: userExams.reduce((a, b) => b.type == "ib" ? a + (b.score ?? 0) : a, 0) } as StudentExam)}>Add IB Diploma</span>
                </div>}
                {userExams.length > 0 && <div>
                    Standing: {getStanding(totalCredits)}
                </div>}
            </div>
        </div>}
        {tabState == "credit" && <div className="m-auto gap-4 flex flex-row" style={{ height: "calc(100% - 20px)" }}>
            <CourseSearch school={school} />
            <div></div>
            <div className="flex flex-col">
                <h1 className="mt-4 text-xl font-bold"> Exam Credits </h1>
                <div>{examCredits.length > 0 ?
                    <div className="w-full border-1 border-gray-500 rounded p-4">{renderCreditsTable(examCredits, userExams, setInspectedCourse, true)}</div> :
                    <span className="text-gray-500 italic"> No exam course credits awarded. </span>}
                </div>
                <h1 className="mt-4 text-xl font-bold"> Other Credits </h1>
                {school.transferURL && <span>To find which community college courses are eligible for credit, go to <a href={school.transferURL}>{school.transferURL}</a></span>}
                <div>{examCredits.length > 0 ?
                    <div className="w-full border-1 border-gray-500 rounded p-4">{renderCoursesTable(courses, setInspectedCourse)}</div> :
                    <span className="text-gray-500 italic"> No exam course credits awarded. </span>}
                </div>
            </div>
        </div>}
        {tabState == "progress" && <div className="m-auto max-w-[1000] h-full overflow-y-auto">
            {/* <h1 className="mt-4 text-xl font-bold"> Progress </h1> */}
            <p className="mt-4 max-w-[800] text-center"><i>Note: Degree requirements data is currently incomplete and probably has lots of errors and inconsistencies.
                If you want to help, feel free to contact me on <a href="https://github.com/4thharbinger/uc-davis-course-explorer">GitHub</a> or <a href="https://discord.com/users/277911182571077633">Discord</a></i></p>
            {degreeRequirements == undefined || degreeCourses == undefined ? <p>Loading...</p> : renderDegreeProgress(degreeRequirements, degreeCourses, studentCourses)}
        </div>}
        {tabState == "plan" && <div className="m-auto max-w-[1000] h-full overflow-y-auto">
            <h1 className="mt-4 text-xl font-bold"> My Plan </h1>
            Coming soon...
        </div>}
    </div>
}

function renderDegreeProgress(degreeRequirements: Record<string, Degree>, degreeCourses: Record<string, Course>, studentCourses: Record<string, StudentCourse>) {
    return Object.keys(degreeRequirements).map(degreeId => <div key={degreeId}>
        <h1 className="text-xl font-bold mt-4">{degreeRequirements[degreeId].name}</h1>
        {renderDegree(degreeRequirements[degreeId].requirements as DegreeRequirement[], degreeCourses, studentCourses)}
    </div>);
}

function renderDegree(requirements: DegreeRequirement[], courses: Record<string, Course>, studentCourses: Record<string, StudentCourse>) {
    requirements.map(requirement =>
        (requirement as any).units = requirement.subcategories.reduce((acc, subcategory) => {
            const units = subcategory.courses.reduce((acc, cur) => add(acc, countUnits(courses, cur)), [0, 0]);
            const completed = subcategory.courses.reduce((acc, cur) => add(acc, countUnits(courses, cur, studentCourses)), [0, 0]);
            (subcategory as any).units = units;
            (subcategory as any).completed = completed;
            return add(units, acc);
        }, [0, 0]));

    return <div className="grow">{requirements && requirements.map(requirement =>
        <div className="mt-4" key={requirement.category}>
            <span className="font-bold text-lg">{requirement.category}</span>
            <div>
                {requirement.subcategories.map(subcategory => {
                    if (subcategory.courses.length > 0 && courses) {
                        const units = (subcategory as any).units;
                        const completed = (subcategory as any).completed;
                        const subcategoryCompleted = checkSubcategoryCompletion(courses, subcategory, studentCourses);
                        const unitsStr = units[0] == units[1] ? units[0] : units[0] + "-" + units[1];
                        const completedStr = completed[0] == completed[1] ? completed[0] : completed[0] + "-" + completed[1];
                        const contentStr = completedStr + " / " + unitsStr;
                        return <div key={subcategory.header}>
                            <div className="ml-4">
                                <Pill
                                    title={units[0] == units[1] ? "Requires " + units[0] + " unit" + (units[0] == 1 ? "" : "s") + "." : "Requires " + units[0] + " to " + units[1] + " units."}
                                    content={contentStr}
                                    color={subcategoryCompleted == "incomplete" ? incompleteColor : subcategoryCompleted == "complete" ? completeColor : completed[0] >= units[0] ? inprogressColor : partialCompleteColor}
                                    width="80px"
                                />
                                <span className="font-bold ml-2">{subcategory.header}</span>
                                {subcategory.courses.map(course => renderDegreeCourse(course, studentCourses))}
                            </div>
                        </div>
                    }
                }
                )}
            </div>
        </div>)}
    </div>
}

export type CompletionState = "complete" | "incomplete" | "planned" | "in progress";

function checkSubcategoryCompletion(courses: Record<string, Course>, subcategory: DegreeRequirementSubcategory, studentCourses: Record<string, StudentCourse>): CompletionState {
    const results = subcategory.courses.map(req => checkCompletion(courses, req, studentCourses));

    if (results.every(result => result == "complete"))
        return "complete";
    else if (results.every(result => result == "incomplete"))
        return "incomplete";
    else if (results.some(result => result == "in progress"))
        return "in progress";
    return "planned";
}

function checkCompletion(courses: Record<string, Course>, requirement: DegreeCourseRequirement, studentCourses: Record<string, StudentCourse>): CompletionState {

    if (typeof requirement == "string") {
        if (studentCourses[requirement] == undefined)
            return "incomplete";
        const courseForCompletion = studentCourses[requirement];
        if (+courseForCompletion.term > +currentTerm)
            return "planned";
        if (courseForCompletion.status == "complete")
            return "complete"
        if (courseForCompletion.status == "in progress")
            return "in progress";

        return "incomplete";
    } else if (Array.isArray(requirement)) {
        if (requirement.some(req => checkCompletion(courses, req, studentCourses) == "complete"))
            return "complete";
        else if (requirement.every(req => checkCompletion(courses, req, studentCourses) == "incomplete"))
            return "incomplete";
        return "in progress";
    } else if (requirement.type == "choice") {
        if (requirement.units_required != undefined) {
            const completedUnits = countUnits(courses, requirement, studentCourses);
            if (completedUnits[0] >= requirement.units_required)
                return "complete";
            else if (completedUnits[1] > 0)
                return "in progress";
            else
                return "incomplete";
        }
        return checkCompletion(courses, requirement.options, studentCourses);
    } else if (requirement.type == "and") {
        if (requirement.courses.every(req => checkCompletion(courses, req, studentCourses) == "complete"))
            return "complete";
        else if (requirement.courses.every(req => checkCompletion(courses, req, studentCourses) == "incomplete"))
            return "incomplete";
        return "in progress";
    } else {
        return "incomplete";
    }
}

function Pill({ title, content, color, width }: { title: string, content: string, color: string, width?: string }) {
    width ??= "40px";
    return <span style={{
        backgroundColor: color,
        display: "inline-block",
        color: "white",
        textAlign: "center",
        margin: "auto",
        fontFamily: "monospace",
        width
    }} className="rounded"
        title={title}>{content}</span>
}

function first<T>(obj: Record<string, T>, match: string[]) {
    return match.find(x => obj[x] != undefined);
}

const inprogressColor = "#8BDF76";
const completeColor = "#68db4b";
const incompleteColor = "#ff3d3d";
const notStartedColor = "#ccbbbb";
const partialCompleteColor = "#ff8d41";

function renderDegreeCourse(course: DegreeCourseRequirement, courses: Record<string, StudentCourse>): JSX.Element {
    if (typeof course == "string") {
        return <div className="ml-4" key={course}>
            {courses[course] == undefined ?
                <Pill title={"Requirement " + course + " incomplete."} content="INCOMPLETE" color={notStartedColor} width="100px" /> :
                courses[course].status == "complete" ?
                    <Pill title={"Requirement " + course + " completed."} content="COMPLETE" color={completeColor} width="100px" /> :
                    <Pill title={"Requirement " + course + " in progress."} content="IN-PROGRESS" color={inprogressColor} width="100px" />
            }
            <span className="ml-1"> {course}</span>
        </div>
    } else if (Array.isArray(course)) {
        const match = first(courses, course);
        return <div className="ml-4" key={course[0]}>
            {match == undefined ?
                <Pill title={"Requirement " + course + " incomplete."} content="INCOMPLETE" color={notStartedColor} width="100px" /> :
                courses[match].status == "complete" ?
                    <Pill title={"Requirement " + course + " completed."} content="COMPLETE" color={completeColor} width="100px" /> :
                    <Pill title={"Requirement " + course + " in progress."} content="IN-PROGRESS" color={inprogressColor} width="100px" />
            }
            <span className="ml-1">{match == undefined ? course.join(" or ") : <span>{courses[match].slug} <span className="line-through text-gray-400">or {course.filter(c => c != courses[match].slug).join(" or ")}</span></span>} </span>
        </div>
    } else if (course.type == "choice") {
        return <div className="ml-4" key={course.options[0]}>
            <span className="">{course.instruction}</span>
            <br />
            <span>{course.options.join(", ")}</span>
        </div>
    } else if (course.type == "and") {
        return <div className="ml-4" key={course.courses[0]}>
            {course.courses.join(" and ")}
        </div>
    } else {
        return <div className="ml-4" > Unknown requirement </div>
    }
}

function countUnits(courses: Record<string, Course>, course: DegreeCourseRequirement, studentCourses?: Record<string, StudentCourse>): number[] {
    if (typeof course == "string") {
        const completion = studentCourses == null ? "complete" : checkCompletion(courses, course, studentCourses);
        if (completion == "incomplete")
            return [0, 0];

        const courseInfo = courses[course];
        if (courseInfo == undefined) return [0, 0];
        const units = courseInfo.units.replaceAll(/\s+units?/g, "").split("-");
        if (units.length == 1) return [+units, +units];
        if (units.length == 2) return [+units[0], +units[1]];
        return [0, 0]
    } else if (Array.isArray(course)) {
        var found : number[] | undefined = undefined;
        const units = course.map(x => {
            const completion = studentCourses == null ? "complete" : checkCompletion(courses, x, studentCourses);
            if (completion == "complete" && studentCourses != null) {
                const completedCourse = first(studentCourses, Object.keys(courses));

                if (completedCourse != undefined) {
                    const units = countUnits(courses, completedCourse, studentCourses);
                    found = units;
                    return units;
                }
            }
            return countUnits(courses, x, studentCourses);
        });
        if (found != undefined)
            return found;
        const min = Math.min(...units.map(x => x[0]));
        const max = Math.max(...units.map(x => x[1]));
        return [min, max];
    } else if (course.type == "choice") {
        if (course.units_required != undefined) return [course.units_required, course.units_required];
        return countUnits(courses, course.options, studentCourses);
    } else if (course.type == "and") {
        return course.courses.map(x => countUnits(courses, x, studentCourses)).reduce(add, [0, 0]);
    } else {
        return [0, 0];
    }
}

function add(a: number[], b: number[]) {
    return [a[0] + b[0], a[1] + b[1]];
}

function renderSubcategoryProgress(subcategory: any) {
}

function getExamMaxScore(examSubject: string, examType: string): number {
    return examSubject == "diploma" ? 45 : examType == "ib" ? 7 : examType == "ap" ? 5 : 0;
}

function getStanding(credits: number) {
    if (credits < 45) return "Freshman";
    else if (credits < 90) return "Sophomore";
    else if (credits < 135) return "Junior";
    else return "Senior";
}

function renderCoursesTable(creditCourses: Course[], setInspectedCourse: (course: Course) => void) {
    return <table className="w-full">
        <thead>
            <tr className="text-left">
                <th>Code</th>
                <th>Name</th>
            </tr>
        </thead>
        <tbody>
            {creditCourses.map(course =>
                <tr
                    key={`${course.slug}`}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                        setInspectedCourse({
                            slug: course.slug
                        } as Course);
                    }}>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                </tr>)}
        </tbody>
    </table>
}

function renderCreditsTable(credits: (ExamCredit & { creditCourses: Course[] })[], exams: StudentExam[], setInspectedCourse: (course: Course) => void, source: boolean) {
    return <table className="w-full">
        <thead>
            <tr className="text-left">
                <th>Code</th>
                <th>Name</th>
                {source && <th>Source</th>}
            </tr>
        </thead>
        <tbody>
            {credits.flatMap(exam => exam.creditCourses.map(course =>
                <tr
                    key={`${course.slug}-${exam.id}`}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                        setInspectedCourse({
                            slug: course.slug
                        } as Course);
                    }}>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    {source && <td>
                        {exam.examType.toUpperCase()} {exams.find(ex => ex.type == exam.examType && ex.subject == exam.examSubject && ex.level == exam.examLevel)?.name}
                    </td>}
                </tr>))}
        </tbody>
    </table>
}

function renderExamTable(userExams: StudentExam[], onScoreChange: (exam: StudentExam) => void, removeExam: (exam: Exam) => void, examCredits: ({ id: string; school: string; examType: string; examSubject: string; examLevel: string; creditUnits: number; minScore: number; maxScore: number; duplicateCredit: boolean; } & { creditCourses: Course[]; })[]): ReactNode {
    return <table className="w-full">
        <thead>
            <tr className="text-left">
                <th></th>
                <th>Type</th>
                <th>Subject</th>
                <th>Level</th>
                <th>Score</th>
                <th>Units</th>
                <th>Courses</th>
            </tr>
        </thead>
        <tbody>
            {userExams.map(exam => <tr className="hover:bg-gray-100" key={`${exam.type}-${exam.subject}-${exam.level}`}>
                <td title="Click to remove" className="cursor-pointer text-gray-500 text-sm hover:text-red-700" onClick={() => removeExam(exam)}>X</td>
                <td>{exam.type.toUpperCase()}</td>
                <td>{exam.name}</td>
                <td>{exam.level == "" ? "N/A" : exam.level.toUpperCase()}</td>
                <td><input defaultValue={exam.score ?? "No score"} onChange={e => {
                    exam.score = +e.target.value;
                    onScoreChange(exam);
                }} type="number" min={0} max={getExamMaxScore(exam.subject, exam.type)} /></td>
                <td>{examCredits
                    .find(ex => ex.examType == exam.type && ex.examLevel == exam.level && ex.examSubject == exam.subject &&
                        (exam.score == undefined || exam.score >= ex.minScore && exam.score <= ex.maxScore))?.creditUnits ?? 0}</td>
                <td>{(function () {
                    const credits = examCredits
                        .filter(ex => ex.examType == exam.type && ex.examLevel == exam.level && ex.examSubject == exam.subject &&
                            (exam.score == undefined || exam.score >= ex.minScore && exam.score <= ex.maxScore));
                    return credits.map(credit => <span className="flex flex-row gap-4" key={credit.id}>
                        {credit.creditCourses.map(course => <span key={`${course.slug}-${credit.id}`}>{course.slug}</span>)}
                    </span>);
                })()}
                </td>
            </tr>)}
        </tbody>
    </table>;
}

export type StudentExam = Exam & { score?: number }