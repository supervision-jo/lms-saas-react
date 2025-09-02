import { Clock, Play, Star } from "lucide-react";
import { useNavigate } from "react-router";
import { formatDateTimeSimple } from "../../utils/formatDateTime";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";

export default function EnrolledCourses({ item }: { item: EnrolledCourse }) {
  const navigate = useNavigate();

  const { data: catesData } = useCustomQuery(`${API_ENDPOINTS.categories}`, [
    "categories",
  ]);

  const { data: instructorData } = useCustomQuery(
    `${API_ENDPOINTS.instructor}${item?.course?.instructor}/course/${item?.course?.id}/`,
    ["instructor", item?.course?.id],
    undefined,
    !!item?.course?.id && !!item?.course?.instructor
  );

  const cates: Category[] = catesData?.data?.data ?? [];

  const currentCategory = cates?.find(
    (c) => c.id === item?.course?.sub_category
  );

  const instructor: Partial<Instructor> = instructorData?.data;

  return (
    <div
      key={item?.course?.id}
      className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-start">
        <div className="relative">
          <img
            src={
              item?.course?.picture ??
              "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
            }
            alt={item?.course?.title}
            className="w-24 h-24 rounded-xl object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-300 flex items-center justify-center">
            <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
        <div className="ml-6 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {item?.course?.title}
              </h4>
              <div className="flex items-center mb-3">
                <img
                  src={
                    instructor?.instructor_image ??
                    "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                  }
                  alt={instructor?.instructor_full_name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <p className="text-gray-600">
                  {instructor?.instructor_full_name}
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mr-4">
                  {currentCategory?.name}
                </span>
                <Clock className="w-4 h-4 mr-1" />
                <span className="mr-4">{item?.course?.duration}</span>
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                <span className="mr-4">{item?.course?.rating}</span>
                <span className="text-gray-400">
                  Last accessed {formatDateTimeSimple(item?.course?.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 mr-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span className="font-medium">
                      {/* {item.progress} */}
                      50% complete
                    </span>
                    <span>
                      {/* {item.completedLessons} */}3 /
                      {/* {item.totalLessons}  */}6 lessons
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `50%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/catalog/${item?.course?.id}/player`)
                  }
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
