interface InstructorCourses {
  title: string;
  picture: string;
  total_students: number;
  average_rating: number;
  total_reviews: number;
  revenue: number | null;
  status: string;
  lastUpdated: string;
  completion: number;

  instructor: {
    first_name: string;
    last_name: string;
    profile_image: string;
    id: string;
    bio: string;
  };
}

interface InstructorStats {
  total_courses: number;
  total_students: number;
  average_rating: number | null;
  total_reviews: number;
  new_reviews: number;
  new_students: number;
  revenue_this_month: number | null;
  revenue: number | null;
}
