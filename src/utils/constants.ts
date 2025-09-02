import { update } from "lodash";

export const ACCESS_TOKEN_KEY = "lms-access-token";
export const USER_KEY = "lms-user";
export const BASE_URL = "https://lms-saas-jv3u7.ondigitalocean.app/api/";
export const API_ENDPOINTS = {
  courses: "course/courses/",
  categories: "course/categories/",
  featuredCourses: "course/best-sellers/",
  modules: "course/get-sections/",
  instructor: "course/instructor/",
  enrolledCourses: "enrollments/my-enrollments/",
  createEnrollment: "enrollments/create-enroll/",
  lessonNotes: "/api/enrollments/lesson-notes/",
  createLessonNotes: "/api/enrollments/lesson-notes/",
  updateLessonNotes: "/api/enrollments/lesson-notes/",
  signup: "users/register/",
  login: "users/login/",
  refreshToken: "users/refresh-token/",
  updateProfile: "users/update-profile/",
};
