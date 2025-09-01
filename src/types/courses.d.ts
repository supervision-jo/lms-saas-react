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

interface Course {
  id: string;
  title: string;
  subtitle: string;
  instructor: Instructor;
  instructorImage: string;
  rating: number;
  reviewCount: number;
  studentCount: number;
  price: number;
  originalPrice: number;
  duration: string;
  lastUpdated: string;
  language: string;
  level: string;
  isBestseller: boolean;
  thumbnail: string;
  videoUrl: string;
  whatYouLearn: string[];
  requirements: string[];

  category: string;
  description: string;
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
