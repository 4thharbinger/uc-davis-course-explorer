import axios from 'axios';
import * as cheerio from 'cheerio';

async function fetchDepartmentCourses(subjectCode: string) {
  // Hit the bulk XML endpoint (e.g., /mat/index.xml)
  const url = `https://catalog.ucdavis.edu/courses-subject-code/${subjectCode.toLowerCase()}/index.xml`;

  try {
    const response = await axios.get(url);
    const xml = response.data;

    // 1. Extract the giant block of HTML from the CDATA wrapper
    const cdataMatch = xml.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    if (!cdataMatch) return [];
    
    const rawHtml = cdataMatch;

    // 2. Load the entire department's HTML into Cheerio at once
    const $ = cheerio.load(rawHtml);
    const courses: any[] = [];

    // 3. Loop through every single course block!
    $('.courseblock').each((_, el) => {
      // Notice we use $(el).find() to only search inside this specific course's HTML
      const courseCode = $(el).find('.detail-code').text().trim();
      const title = $(el).find('.detail-title').text().replace('— ', '').trim();
      const units = $(el).find('.detail-hours_html').text().replace(/[()]/g, '').trim();
      
      // Some descriptions have a prefix like "Course Description: " we want to strip out
      const description = $(el).find('.courseblockextra').first().text().replace(/Course Description:\s*/, '').trim();
      
      const prerequisites = $(el).find('.detail-prerequisite').text().replace(/Prerequisite\(s\):\s*/, '').trim();
      
      // Extract bullet points (Learning Activities, Grade Mode, GE)
      const attributes: Record<string, string> = {};
      $(el).find('.courseblockextra ul li').each((_, liEl) => {
        const label = $(liEl).find('.label').text().replace(':', '').trim();
        const value = $(liEl).text().replace($(liEl).find('.label').text(), '').trim();
        if (label && value) attributes[label] = value;
      });

      // Only add it if it's a real course (prevents pushing empty ghosts)
      if (courseCode) {
        courses.push({
          courseCode,
          title,
          units,
          description,
          prerequisites, // Feed this to Ollama!
          learningActivities: attributes['Learning Activities'] || null,
          gradeMode: attributes['Grade Mode'] || null,
          generalEducation: attributes['General Education'] || null,
        });
      }
    });

    console.log(`Successfully parsed ${courses.length} courses for ${subjectCode.toUpperCase()}!`);
    return courses;

  } catch (error) {
    console.error(`Failed to fetch department ${subjectCode}:`, error);
    return [];
  }
}

// Test it by grabbing the entire Math department in 1 second
fetchDepartmentCourses('mat').then(courses => {
  // Print the first 2 courses just to see it worked!
  console.log(courses.slice(0, 2)); 
});