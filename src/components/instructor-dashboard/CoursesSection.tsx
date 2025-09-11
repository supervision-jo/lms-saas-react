import { Edit, Eye, Star, Trash2, Users } from "lucide-react";
// import { useNavigate } from "react-router";

type InstructorCourses = {
  id: string;
  title: string;
  thumbnail: string;
  students: number;
  rating: number;
  reviews: number;
  revenue: string;
  status: string;
  lastUpdated: string;
  completion: number;
};

const instructorCoursesData = [
  {
    id: "1",
    title: "Complete React Developer Course",
    thumbnail:
      "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=400",
    students: 5420,
    rating: 4.7,
    reviews: 1250,
    revenue: "$18,450",
    status: "published",
    lastUpdated: "2024-01-15",
    completion: 78,
  },
  {
    id: "2",
    title: "Advanced JavaScript Concepts",
    thumbnail:
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400",
    students: 3200,
    rating: 4.6,
    reviews: 890,
    revenue: "$12,800",
    status: "published",
    lastUpdated: "2024-01-10",
    completion: 82,
  },
  {
    id: "3",
    title: "Node.js Backend Development",
    thumbnail:
      "https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=400",
    students: 2100,
    rating: 4.5,
    reviews: 456,
    revenue: "$8,400",
    status: "draft",
    lastUpdated: "2024-01-20",
    completion: 65,
  },
];
export default function CoursesSection() {
  // const navigate = useNavigate();

  const myCourses: InstructorCourses[] = instructorCoursesData ?? [];
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">My Courses</h3>
      <div className="space-y-4">
        {myCourses.map((course) => (
          <>
            {/* Above md screen course card */}
            <div
              key={course.id}
              className="border border-gray-200 rounded-lg p-4 md:block hidden"
            >
              <div className="flex items-start">
                <img
                  src={
                    course.thumbnail ??
                    "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                  }
                  alt={course.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {course.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="mr-4">
                          {course.students.toLocaleString()} students
                        </span>
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        <span className="mr-1">{course.rating}</span>
                        <span>({course.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span className="mr-4">Revenue: {course.revenue}</span>
                        <span className="mr-4">
                          Completion: {course.completion}%
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            course.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${course.completion}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        // onClick={() => navigate(`/catalog/${course.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Course"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        // onClick={() => navigate("/course-builder")}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        // onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Below md screen course card */}
            <div className="block md:hidden bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={
                    course?.thumbnail ??
                    "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                  }
                  alt={course?.title}
                  className="object-cover w-full h-60"
                />
              </div>

              <div className="p-6">
                <div>
                  <div className="flex flex-col items-start justify-start w-full gap-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {course?.title}
                    </h3>

                    <div className="flex sm:items-center items-start justify-start gap-4 w-full sm:flex-row flex-col">
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-bold mr-1">
                          {course?.rating ?? 0}
                        </span>
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        <span className="text-gray-500 text-sm ml-2">
                          ({course?.reviews?.toLocaleString() ?? 0} reviews)
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        <span>
                          {course?.students?.toLocaleString() ?? 0} students
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:items-center items-start sm:flex-row flex-col gap-4 text-sm text-gray-600 w-full">
                      <span className="mr-4">Revenue: {course.revenue}</span>
                      <span className="mr-4">
                        Completion: {course.completion}%
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          course.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 w-full justify-center">
                      <button
                        // onClick={() => navigate(`/catalog/${course.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Course"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        // onClick={() => navigate("/course-builder")}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        // onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
