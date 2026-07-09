const rawStrings = Array.from(document.querySelectorAll("#requirementstextcontainer .codecol, #requirementstextcontainer .courselistcomment")).map(element => element.innerText);
const requirements = [];
let currentArray = requirements;
for (const string of rawStrings) {
    const courses = string.match(/[A-Z]{3}\s?\d{3}(?!\d)\w*/g);
    if (string.match(/choose one/i)) {
        if (currentArray != requirements)
            requirements.push(currentArray);
        currentArray = courses ?? [];
    } else if (string.startsWith("or")) {
        if (courses.length == 0) continue;
        if (currentArray != requirements) {
            currentArray.push(...courses);
        } else {
            const prev = requirements.pop();
            if (prev.push) {
                prev.push(...courses);
                requirements.push(prev);
            } else {
                requirements.push([prev, ...courses]);
            }
        }
    } else if (courses != null && courses.length > 0) {
        currentArray.push(...courses);
    } else {
        if (currentArray != requirements)
            requirements.push(currentArray);
        currentArray = requirements;
    }
}
