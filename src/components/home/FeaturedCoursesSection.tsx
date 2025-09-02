import { Clock, Star, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { API_ENDPOINTS } from "../../utils/constants";
import { useCustomQuery } from "../../hooks/useQuery";

export default function FeaturedCoursesSection() {
  const navigate = useNavigate();

  const { data: featuredCoursesData } = useCustomQuery(
    API_ENDPOINTS.featuredCourses,
    ["featured-courses"]
  );
  const courses: Partial<Course>[] = featuredCoursesData?.data;
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hand-picked courses by our experts to help you learn the most
            in-demand skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course) => (
            <div
              key={course?.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate("/course")}
            >
              <div className="relative">
                <img
                  src={
                    course.picture ??
                    "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                  }
                  alt={course?.title ?? "--"}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course?.is_best_seller && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full">
                      Bestseller
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/catalog/${course?.id}`);
                      }}
                      className="w-full bg-white text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Preview Course
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {course?.title ?? "--"}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {course?.instructor?.first_name ?? "--"}{" "}
                  {course?.instructor?.last_name ?? "--"}
                </p>

                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 font-bold mr-1">
                      {course?.rating ?? 0}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(course?.rating ?? 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">
                      ({course?.total_reviews ?? 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{course?.duration ?? "0h 0m"}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course?.total_students?.toLocaleString() ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ${course?.price ?? "0"}
                    </span>
                    {course?.old_price && (
                      <span className="text-gray-500 line-through ml-2">
                        ${course?.old_price ?? "0"}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {course?.level ?? "--"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
