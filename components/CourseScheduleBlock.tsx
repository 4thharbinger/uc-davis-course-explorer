import styles from "./CourseSchedule.module.css";


export const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function CourseScheduleBlock({ course, activity, start, end, days, onClick } : { course: string, activity: string, start: number, end: number, days: MeetingDays, onClick?: () => void }) {
    const timeString = `${formatTime(start)} - ${formatTime(end)}`;
    return weekdays.filter(day => days[day as keyof MeetingDays]).map(day => 
    <div key={day} className={styles.sectionBlock} style={{ 
        gridRow: `${Math.floor(start / 100) - 5}`, 
        gridColumn: weekdays.indexOf(day) + 1, 
        transform: `translateY(${calculateOffset(start)})`, 
        height: `${calculateHeight(start, end)}`}} 
        onClick={onClick}>
                    <h2 className="font-bold">{course}</h2>
                    <p style={{ fontSize: '14px' }}>{activity}: {timeString}</p>
    </div>);
}


export function formatTime(time: number): string {
    const hour = Math.floor(time / 100);
    const minute = time % 100;
    const period = hour >= 12 ? 'p' : 'a';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute.toString().padStart(2, '0')}${period}`;
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