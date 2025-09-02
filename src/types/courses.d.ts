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
  total_hours: string | null;
  is_best_seller: boolean;
  objectives: TextLists[];
  requirements: TextLists[];
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
  totalDuration: string;
  lessonCount: number;
  lessons: Lesson[];
}
