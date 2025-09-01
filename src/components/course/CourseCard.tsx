import React from "react";
import { Star, Clock, Users, Play } from "lucide-react";
import { useNavigate } from "react-router";

interface CourseCardProps {
  course: Course;
  isListView?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isListView }) => {
  const navigate = useNavigate();
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer ${
        isListView ? "flex items-start" : ""
      }`}
      onClick={() => navigate(`/catalog/${course.id}`)}
    >
      <div className={`relative ${isListView ? "w-80 flex-shrink-0" : ""}`}>
        <img
          src={"course.picture"}
          alt={course.title}
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
            isListView ? "w-full h-48" : "w-full h-48"
          }`}
        />
        {course.is_best_seller && (
          <div className="absolute top-4 left-4">
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full">
              Bestseller
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/course");
            }}
            className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </button>
        </div>
      </div>

      <div className={`p-6 ${isListView ? "flex-1" : ""}`}>
        <div className={`${isListView ? "flex justify-between" : ""}`}>
          <div className={`${isListView ? "flex-1 pr-6" : ""}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 cursor-pointer transition-colors">
              {course.title}
            </h3>

            <div className="flex items-center mb-3">
              <img
                src={course.instructor.profile_image}
                alt={course.instructor.first_name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <p className="text-gray-600 text-sm">
                {course.instructor.first_name}
              </p>
            </div>

            {isListView && (
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>
            )}

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <span className="text-yellow-500 font-bold mr-1">
                  {course.rating}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(course.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm ml-2">
                  ({course.total_reviews.toLocaleString()})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {/* <span>{course.duration}</span> */}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {/* <span>{course.studentCount.toLocaleString()}</span> */}
              </div>
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {course.level}
              </span>
            </div>

            {isListView && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  What you'll learn:
                </h4>
                {/* <ul className="space-y-1">
                  {course.whatYouLearn
                    .slice(0, 3)
                    .map((item: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                </ul> */}
              </div>
            )}
          </div>

          <div
            className={`${
              isListView ? "text-right" : "flex items-center justify-between"
            }`}
          >
            <div className={`${isListView ? "mb-4" : "flex items-center"}`}>
              <span className="text-2xl font-bold text-gray-900">
                ${course.price}
              </span>
              {course.price && (
                <span className="text-gray-500 line-through ml-2">
                  ${course.price}
                </span>
              )}
            </div>
            {isListView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/course");
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
