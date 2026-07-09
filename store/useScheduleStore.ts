import { create } from 'zustand';

type ScheduleState = {
    schedule: Record<string, number>;
    setSchedule: (schedule: Record<string, number>) => void;
    activeScheduling: string | null; 
    setActiveScheduling: (courseCode: string | null) => void;
    addCourseToSchedule: (courseCode: string, section?: number) => void;
    removeCourseFromSchedule: (courseCode: string) => void;
    rescheduleCourse: (courseCode: string, newSection: number) => void;
    clearSchedule: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedule: { "MAT021C": 0, "PHY009HA": 0, "ENG004": 0, "EAE001": 0, "CHE004A": 0 },
  setSchedule: (schedule) => set({ schedule }),
  activeScheduling: null,
  setActiveScheduling: (courseCode: string | null) => set({ activeScheduling: courseCode }),
  addCourseToSchedule: (courseCode : string, section : number = 0) => set((state) => ({ schedule: { ...state.schedule, [courseCode]: section} })),
  removeCourseFromSchedule: (courseCode : string) => set((state) => {
    const newSchedule = { ...state.schedule };
    delete newSchedule[courseCode];
    if (courseCode == state.activeScheduling) {
      set({ activeScheduling: null });
    }
    return { schedule: newSchedule };
  }),
  rescheduleCourse: (courseCode : string, newSection : number) => set((state) => {
    const newSchedule = { ...state.schedule };
    newSchedule[courseCode] = newSection;
    return { schedule: newSchedule };
  }),
  clearSchedule: () => set({ schedule: {} }),
}));

export default useScheduleStore