import styles from "./CourseSchedule.module.css";

export default function CourseScheduleBlock({ course, activity, start, end, onClick } : { course: string, activity: string, start: number, end: number, onClick?: () => void }) {
    const timeString = `${formatTime(start)} - ${formatTime(end)}`;
    return <div className={styles.sectionBlock} style={{ gridRow: `${Math.floor(start / 100) - 5}`, transform: `translateY(${calculateOffset(start)})`, height: `${calculateHeight(start, end)}`}} onClick={onClick}>
                    <h2 className="font-bold">{course}</h2>
                    <p style={{ fontSize: '14px' }}>{activity}: {timeString}</p>
    </div>
}

function formatTime(time: number): string {
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