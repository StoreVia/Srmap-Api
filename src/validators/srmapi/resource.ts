export const isValidCourse = (data: { year?: string; code?: string; name?: string }): [boolean, string | null] => {
  if (!data.year || !data.year.trim()) {
    return [false, "Year is required"];
  }

  if (!data.code || !data.code.trim()) {
    return [false, "Course code is required"];
  }

  if (data.code.trim().length > 20) {
    return [false, "Course code must be less than 20 characters"];
  }

  if (!data.name || !data.name.trim()) {
    return [false, "Course name is required"];
  }

  if (data.name.trim().length > 100) {
    return [false, "Course name must be less than 100 characters"];
  }

  return [true, null];
};

export const isValidSubject = (data: { courseCode?: string; year?: string; code?: string; name?: string }): [boolean, string | null] => {
  if (!data.courseCode || !data.courseCode.trim()) {
    return [false, "Course code is required"];
  }

  if (!data.year || !data.year.trim()) {
    return [false, "Year is required"];
  }

  if (!data.code || !data.code.trim()) {
    return [false, "Subject code is required"];
  }

  if (data.code.trim().length > 20) {
    return [false, "Subject code must be less than 20 characters"];
  }

  if (!data.name || !data.name.trim()) {
    return [false, "Subject name is required"];
  }

  if (data.name.trim().length > 150) {
    return [false, "Subject name must be less than 150 characters"];
  }

  return [true, null];
};

export const isValidResource = (data: {
  courseCode?: string;
  year?: string;
  subjectId?: string;
  category?: string;
  examType?: string;
  title?: string;
  size?: string;
  fileType?: string;
  downloadUrl?: string;
}): [boolean, string | null] => {
  if (!data.courseCode || !data.courseCode.trim()) {
    return [false, "Course code is required"];
  }

  if (!data.year || !data.year.trim()) {
    return [false, "Year is required"];
  }

  if (!data.subjectId || !data.subjectId.trim()) {
    return [false, "Subject ID is required"];
  }

  if (!data.category || !["previousYearPapers", "slidesAndNotes"].includes(data.category)) {
    return [false, "Category must be previousYearPapers or slidesAndNotes"];
  }

  if (data.category === "previousYearPapers" && (!data.examType || !["mid", "sem"].includes(data.examType))) {
    return [false, "Exam type must be mid or sem for previous year papers"];
  }

  if (!data.title || !data.title.trim()) {
    return [false, "Resource title is required"];
  }

  if (data.title.trim().length > 200) {
    return [false, "Resource title must be less than 200 characters"];
  }

  if (!data.size || !data.size.trim()) {
    return [false, "Resource size is required"];
  }

  if (!data.fileType || !data.fileType.trim()) {
    return [false, "File type is required"];
  }

  if (!data.downloadUrl || !data.downloadUrl.trim()) {
    return [false, "Download URL is required"];
  }

  try {
    new URL(data.downloadUrl.trim());
  } catch {
    return [false, "Download URL must be a valid URL"];
  }

  return [true, null];
};