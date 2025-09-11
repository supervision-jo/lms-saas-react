interface EnrolledCourse {
  id: number;
  date_enrolled: string;
  course: {
    id: string;
    picture: string | null;
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    rating: number;
    price: string;
    old_price: string;
    is_paid: boolean;
    level: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    search_vector: string;
    duration: string;
    sub_category: string;
    instructor: string;
  };
}

interface EnrolledCourseStats {
  id: string;
  title: string;
  description: string;
  completed_lessons: number;
  progress: number;
  lessons_progress: string; // "0/31 lessons"
  last_accessed: string | null;
  sub_category: {
    id: string;
    name: string;
    description: string;
  };
  total_hours: number;
  average_rating: number;
}

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  title: string;
  total_students: number;
  total_courses: number;
  instructor_full_name: string;
  instructor_image: string;
  bio: string;
  average_rating: number;
}

interface CourseInstructor {
  title: string;
  total_students: number;
  total_courses: number;
  instructor: {
    first_name: string;
    last_name: string;
    profile_image: string;
    id: string;
    bio: string;
  };
  total_reviews: number;
  average_rating: number;
}

type TextLists = {
  id: string;
  text: string;
};

interface Course {
  id: string;
  title: string;
  slug: string;
  picture: string;
  subtitle: string;
  description: string;
  sub_category: string;
  instructor: Instructor;
  instructor_: Instructor;
  old_price: number;
  price: number;
  is_paid: boolean;
  level: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  total_students: number;
  rating: number;
  average_rating: number;
  total_reviews: number;
  total_enrollments: number;
  total_hours: number | null;
  is_best_seller: boolean;
  objectives: TextLists[];
  requirements: TextLists[];
  language: string;
}

interface Lesson {
  id: string;
  title: string;
  duration_hours: number;
  description: string;
  video_url: string | null;
  free_preview: boolean;
  content_type: "video" | "article" | "quiz" | "exam" | "material";
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface CourseReview {
  student_: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_student: boolean;
    is_instructor: boolean;
    profile_image: string | null;
    bio: string | null;
    phone: string | null;
    location: string | null;
    data_joined: string;
  };
  id: number;
  course: string;
  course_title: string;
  rating: number;
  tell_about_your_experience: string;
  like_course_details: {
    id: number;
    name: string;
    type: "positive" | "negative";
  }[];
  recommend: boolean;
  anonymous: boolean;
  comment: string;
  created_at: string;
  updated_at: string;
}
