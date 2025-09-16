interface Acheivement {
  id: string;
  title: string;
  icon: string;
  date: string;
  description: string;
}

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  instructor: string;
  thumbnail: string;
}

interface User {
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
}

interface StudentStats {
  id: string;
  first_name: string;
  last_name: string;
  courses_completed: number;
  hours_learned: number | string | null;
  certificates_earned: number;
  current_streak: number;
  overall_progress: number;
  new_courses_this_month: number;
  hours_learned_this_month: number | string | null;
  certificates_this_month: number;
  streak_days_this_month: number;
}
