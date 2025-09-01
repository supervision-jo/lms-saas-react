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
  profile_image: any;
}
