interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  timeSpent: string;
  lastAccessed: string;
  rating: number;
  category: string;
}
interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
}
interface Course {
  id: string;
  title: string;
  picture: string;
  subtitle: string;
  description: string;
  sub_category: string;
  instructor: Instructor;
  old_price: number;
  price: number;
  is_paid: boolean;
  level: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  rating: number;
  average_rating: number;
  total_reviews: number;
  duration: string;
  is_best_seller: boolean;
}

interface Instructor {
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  students: number;
  courses: number;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "article" | "quiz" | "exam" | "material";
  isCompleted: boolean;
  isFree: boolean;
  fileUrl: string | null;
}

interface Module {
  id: string;
  title: string;
  totalDuration: string;
  lessonCount: number;
  lessons: Lesson[];
}
