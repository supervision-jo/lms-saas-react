import React, { useState } from "react";
import {
  Star,
  Clock,
  Users,
  Award,
  CheckCircle,
  Globe,
  Smartphone,
  Trophy,
  Play,
} from "lucide-react";
import CourseContent from "../../components/course/CourseContent";
import { useCustomQuery } from "../../hooks/useQuery";
import { useParams } from "react-router";

interface CourseDetailPageProps {
  onNavigateToPlayer?: () => void;
}

const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  onNavigateToPlayer,
}) => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolled, setIsEnrolled] = useState(false);

  const coursesData = useCustomQuery("/data/allCourses.json", ["courses"]);
  const modulesData = useCustomQuery("/data/modules.json", ["modules"]);

  const courses: Course[] = coursesData?.data?.data ?? [];

  const targetCourse = courses.find((c) => c.id === courseId) as Course;

  const modules: Module[] = modulesData?.data?.data ?? [];

  const handleEnroll = () => {
    setIsEnrolled(true);
    console.log("Enrolled in course");
  };

  const handleLessonSelect = (lessonId: string) => {
    console.log("Selected lesson:", lessonId);
    if (onNavigateToPlayer) {
      onNavigateToPlayer();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <nav className="text-sm mb-4">
                <span className="text-purple-400">Development</span>
                <span className="mx-2">›</span>
                <span className="text-purple-400">Web Development</span>
                <span className="mx-2">›</span>
                <span>React</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {targetCourse?.title}
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {targetCourse?.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                {targetCourse?.isBestseller && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded">
                    Bestseller
                  </span>
                )}
                <div className="flex items-center">
                  <span className="text-yellow-400 font-bold mr-2">
                    {targetCourse?.rating}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(targetCourse?.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-300 ml-2">
                    ({targetCourse?.reviewCount.toLocaleString()} ratings)
                  </span>
                </div>
                <span className="text-gray-300">
                  {targetCourse?.studentCount.toLocaleString()} students
                </span>
              </div>

              <div className="flex items-center text-gray-300 mb-6">
                <span>Created by {targetCourse?.instructor.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Last updated {targetCourse?.lastUpdated}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  <span>{targetCourse?.language}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
                <div className="relative">
                  <img
                    src={targetCourse?.thumbnail}
                    alt={targetCourse?.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl font-bold text-gray-900">
                        ${targetCourse?.price}
                      </span>
                      {targetCourse?.originalPrice && (
                        <span className="text-gray-500 line-through ml-3">
                          ${targetCourse?.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-4"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Enrolled</span>
                      </div>
                      <button
                        onClick={onNavigateToPlayer}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Start Learning
                      </button>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-600 mb-6">
                    30-Day Money-Back Guarantee
                  </div>

                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold text-gray-900">
                      This course includes:
                    </h4>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-3" />
                      <span>{targetCourse?.duration} on-demand video</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Smartphone className="w-4 h-4 mr-3" />
                      <span>Access on mobile and TV</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Trophy className="w-4 h-4 mr-3" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "curriculum", label: "Curriculum" },
                    { id: "instructor", label: "Instructor" },
                    { id: "reviews", label: "Reviews" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === "overview" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    What you'll learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {targetCourse?.whatYouLearn.map((item, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Requirements
                  </h3>
                  <ul className="space-y-2 mb-8">
                    {targetCourse?.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Description
                  </h3>
                  <div className="prose max-w-none text-gray-700">
                    {targetCourse?.description
                      .split("\n\n")
                      .map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Course Content
                  </h3>
                  <CourseContent
                    modules={modules}
                    onLessonSelect={handleLessonSelect}
                    isEnrolled={isEnrolled}
                  />
                </div>
              )}

              {activeTab === "instructor" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Instructor
                  </h3>
                  <div className="flex items-start mb-6">
                    <img
                      src={targetCourse?.instructor.avatar}
                      alt={targetCourse?.instructor.name}
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {targetCourse?.instructor.name}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        {targetCourse?.instructor.bio}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{targetCourse?.instructor.rating} Rating</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>
                            {targetCourse?.instructor.students.toLocaleString()}{" "}
                            Students
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          <span>
                            {targetCourse?.instructor.courses} Courses
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Student Reviews
                  </h3>
                  <div className="text-center py-12 text-gray-500">
                    <p>Reviews will be displayed here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CourseContent
              modules={modules}
              onLessonSelect={handleLessonSelect}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
