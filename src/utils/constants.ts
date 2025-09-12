export const ACCESS_TOKEN_KEY = "lms-access-token";
export const REFRESH_TOKEN_KEY = "lms-refresh-token";
export const ACCESS_TOKEN_EXPIRES_AT_KEY = "lms-access-token-exp";
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const USER_KEY = "lms-user";
export const BASE_URL = "https://lms-saas-jv3u7.ondigitalocean.app/api/";

export const API_ENDPOINTS = {
  courses: "course/courses/",
  createCourse: "course/create-course/",
  createSection: "course/create-section/",
  createExam: "course/create-exam/",
  exams: "course/git-quizs/",
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
  createQuestion: "enrollments/create-question/",
  updateQuestion: "enrollments/update-question/",
  answers: "enrollments/answer/",
  signup: "users/register/",
  login: "users/login/",
  refreshToken: "users/refresh-token/",
  updateProfile: "users/update-profile/",
};
