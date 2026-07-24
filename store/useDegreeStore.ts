import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isDev = process.env.NODE_ENV === 'development';
export const useDegreeStore = create(persist((set) => ({
  school: "ucdavis",
  major: isDev ? "EASE" : "",
  setSchool: (school: string) => set({ school }),
  setMajor: (major: string) => set({ major }),
  
}),
    {
      name: 'degree',
    }));

export default useDegreeStore