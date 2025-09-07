export const ACCESS_TOKEN_KEY = "lms-access-token";
export const USER_KEY = "lms-user";
export const BASE_URL = "https://lms-saas-jv3u7.ondigitalocean.app/api/";
export const API_ENDPOINTS = {
  courses: "course/courses/",
  categories: "course/categories/",
  featuredCourses: "course/best-sellers/",
  modules: "course/get-sections/",
  instructor: "course/instructor/",
  studentEnrollements: "course/get-course-enrollment/",
  enrolledCourses: "enrollments/my-enrollments/",
  studentCertificates: "users/get-certificates/",
  courseReviews: "enrollments/reviews/",
  updateReview: "enrollments/update-review/",
  courseStudentReview: "enrollments/get-reviews-course-student/",
  studentStats: "users/get-info-achivements/",
  createReview: "enrollments/create-review/",
  createEnrollment: "enrollments/create-enroll/",
  lessonNotes: "enrollments/lesson-notes/",
  signup: "users/register/",
  login: "users/login/",
  refreshToken: "users/refresh-token/",
  updateProfile: "users/update-profile/",
};
