import { useNavigate } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
import InstructorCourseCard from "./InstructorCourseCard";

export default function CoursesSection() {
  const navigate = useNavigate();

  const { data } = useCustomQuery(API_ENDPOINTS.instructorCourseStats, [
    "instructor-courses",
  ]);

  const instructorCourses: InstructorCourses[] = data?.data ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm sm:p-6 p-2">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">My Courses</h3>
      <div className="space-y-4 sm:grid-cols-2 sm:grid md:block sm:space-x-4 md:space-x-0">
        {instructorCourses.map((course) => (
          <InstructorCourseCard
            course={course}
            key={course?.id}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}
