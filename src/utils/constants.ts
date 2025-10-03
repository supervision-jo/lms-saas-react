export const ACCESS_TOKEN_KEY = "lms-access-token";
export const REFRESH_TOKEN_KEY = "lms-refresh-token";
export const ACCESS_TOKEN_EXPIRES_AT_KEY = "lms-access-token-exp";
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const USER_KEY = "lms-user";
// export const BASE_URL = "https://backend.iraqform.com/api/";
// export const BASE_URL = "https://ollms-api.vision-jo.com/api/";
// export const BASE_URL = "https://test-lms-api.vision-jo.com/api/";

const api_url =
  window.location.href.includes("vercel") ||
  window.location.href.includes("localhost")
    ? "https://test-lms-api.vision-jo.com/"
    : toApiURL(window.location.origin);
export const BASE_URL = `${api_url}api/`;

export function toApiURL(input: string) {
  const hasScheme = /^[a-zA-Z][\w+.-]*:\/\//.test(input);
  const temp = hasScheme ? input : `http://${input}`;

  const url = new URL(temp);
  const port = url.port;
  const host = url.hostname;

  const parts = host.split(".");

  let newHostname;

  if (parts[0].toLowerCase() === "www") {
    newHostname = ["api", ...parts.slice(1)].join(".");
  } else if (parts.length > 2) {
    const first = parts[0] + "-api";
    newHostname = [first, ...parts.slice(1)].join(".");
  } else if (parts.length === 2) {
    newHostname = `api.${host}`;
  } else {
    newHostname = `api.${host}`;
  }

  url.hostname = newHostname;
  if (port) url.port = port;

  return hasScheme
    ? url.toString()
    : url.port
    ? `${url.hostname}:${url.port}`
    : url.hostname;
}

export const API_ENDPOINTS = {
  oldCourses: "course/courses/",
  courses: "course/v2/courses/",
  createCourse: "course/create-course/",
  updateCourse: "course/update-course/",
  deleteCourse: "course/delete-course/",
  createSection: "course/create-section/",
  updateSection: "course/update-section/",
  deleteSection: "course/delete-section/",
  lessons: "course/lessons/",
  lesson: "course/lesson/",
  createExam: "course/create-exam/",
  updateExam: "course/update-exam/",
  courseUsers: "course/get-student-courses/",
  submitExam: "exam/exam-quiz/",
  getStudentAnswers: "exam/get-student-answers/",
  exams: "course/quiz/",
  categories: "course/categories/",
  subCategories: "course/get-sub-categories/",
  featuredCourses: "course/best-sellers/",
  modules: "course/get-sections/",
  instructor: "course/instructor/",
  studentEnrollements: "course/get-course-enrollment/",
  enrolledCourses: "enrollments/my-enrollments/",
  studentCertificates: "users/get-certificates/",
  courseReviews: "enrollments/reviews/",
  updateReview: "enrollments/update-review/",
  reviewReasons: "enrollments/course-review-likes/",
  courseStudentReview: "enrollments/get-reviews-course-student/",
  studentStats: "users/get-info-achivements/",
  instructorStats: "users/get-instructor-achivements/",
  instructorCourseStats: "course/course-instructor-stats/",
  instructorCourseReviews: "enrollments/get-reviews-course-instructor/",
  createReview: "enrollments/create-review/",
  createEnrollment: "enrollments/create-enroll/",
  lessonProgress: "enrollments/create-lesson-progress/",
  lessonNotes: "enrollments/lesson-notes/",
  questions: "enrollments/question/",
  toggleReaction: "enrollments/create-reaction/",
  createQuestion: "enrollments/create-question/",
  updateQuestion: "enrollments/update-question/",
  answers: "enrollments/answer/",
  signup: "users/register/",
  login: "users/login/",
  refreshToken: "users/refresh-token/",
  updateProfile: "users/update-profile/",
  settings: "tenant/settings",
  studentPresence: "",
};
