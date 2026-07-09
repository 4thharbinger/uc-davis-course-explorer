import styles from "./CourseSchedule.module.css";


export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export const weekdays : Weekday[] = 
    ["monday", "tuesday", "wednesday", "thursday", "friday"];

export default function CourseScheduleBlock({ course, activity, start, end, days, color, onClick } : { course: string, activity: string, start: number, end: number, days: MeetingDays, color: number, onClick?: () => void }) {
    const timeString = `${formatTime(start)} - ${formatTime(end)}`;
    return weekdays.filter(day => days[day as keyof MeetingDays]).map(day => 
    <div key={day} className={styles.sectionBlock} style={{ 
        gridRow: `${Math.floor(start / 100) - 5}`, 
        gridColumn: weekdays.indexOf(day) + 1, 
        transform: `translateY(${calculateOffset(start)})`, 
        height: `${calculateHeight(start, end)}`,
        backgroundColor: colorToHex(luminosity(colors[color < 0 ? -color % colors.length : color % colors.length], 0.6))
    }} 
        onClick={onClick}>
                    <h2 className="font-bold">{course}</h2>
                    <p style={{ fontSize: '14px' }}>{activity}: {timeString}</p>
    </div>);
}

const colors = [[245,101,101],[255,142,90],[255,225,136],[130,228,130],[107,178,231],[89,191,255],[135,157,255],[197,133,222],[242,159,126]]

export function formatTime(time: number): string {
    const hour = Math.floor(time / 100);
    const minute = time % 100;
    const period = hour >= 12 ? 'p' : 'a';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute.toString().padStart(2, '0')}${period}`;
}

export function colorToHex(color : number[]) {
    return '#' + color.map(x => x.toString(16).padStart(2, '0')).join('');
}

export function luminosity(color : number[], lum : number) {
    const newColor = [...color];
    newColor[0] = Math.round(255 - (255 - newColor[0]) * lum);
    newColor[1] = Math.round(255 - (255 - newColor[1]) * lum);
    newColor[2] = Math.round(255 - (255 - newColor[2]) * lum);
    return newColor;
}

function calculateHeight(start: number, end: number): string {
    const startHour = Math.floor(start / 100);
    const startMinute = start % 100;
    const endHour = Math.floor(end / 100);
    const endMinute = end % 100;
    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (50 / 60); // 50px per hour
    return `${height}px`;
}

function calculateOffset(start: number): string {
    const offset = start % 100;
    return `${offset * 50 / 60}px`;
}

type MeetingDays = {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
}