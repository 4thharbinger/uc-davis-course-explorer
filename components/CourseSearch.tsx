"use client"

import { useGraphStore } from '@/store/useGraphStore';
import { useState, useEffect } from 'react';
import { searchCourses } from '@/app/actions/searchCourses';
import { redirect } from 'next/navigation';

export default function CourseSearch() {
  const [searchTerm, setSearchTerm] = useState('MAT 021A');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce user input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const data = await searchCourses(searchTerm);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]); // Clear results if input is empty
      }
    }, 200); // Wait for after they stop typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  const addCourse = useGraphStore((state) => state.addCourse);
  const handleAddCourse = (course: any) => {
    addCourse(course.code);
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white p-4 flex flex-col gap-4">
      <h2 className="font-bold text-xl">Course Catalog</h2>
      
      <input
        type="text"
        placeholder="Search MAT 021A or Calculus..."
        className="border p-2 rounded w-full border-gray-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-y-auto flex-1 flex flex-col gap-0.5">
        {isSearching && <p className="text-gray-400 text-sm">Searching...</p>}
        
        {results.map((course) => (
          <button 
            key={course.id}
            onClick={() => handleAddCourse(course)}
            className="text-left p-2 rounded hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <div className="font-bold">{course.code} - {course.name}</div>
            <div className="text-sm text-gray-600 wrap">{course.shortDesc}</div>
          </button>
        ))}
        
        {results.length === 0 && searchTerm.length >= 2 && !isSearching && (
          <p className="text-gray-400 text-sm">No courses found.</p>
        )}
      </div>
    </div>
  );
}