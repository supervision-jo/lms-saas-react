import React, { useState } from "react";
import {
  Plus,
  Users,
  DollarSign,
  Star,
  Edit,
  Trash2,
  Eye,
  LucideIcon,
} from "lucide-react";
import { useCustomQuery } from "../../hooks/useQuery";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const ICONS = {
  Users,
  DollarSign,
  Star,
  Eye,
} as const;

type IconName = keyof typeof ICONS;

type InstructorStats = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  bg: string;
  change: string;
};

type RecentReview = {
  id: string;
  student: string;
  course: string;
  rating: number;
  comment: string;
  date: string;
};

type Analytics = {
  monthlyRevenue: number[];
  studentGrowth: number[];
  coursePerformance: {
    name: string;
    students: number;
    revenue: number;
    rating: number;
  }[];
  topCountries: {
    country: string;
    students: number;
    percentage: number;
  }[];
};

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

const InstructorPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");

  const instructorStatsData = useCustomQuery("/data/instructorStats.json", [
    "instructorStats",
  ]);
  const instructorCoursesData = useCustomQuery("/data/instructorCourses.json", [
    "instructorCourses",
  ]);
  const recentReviewsData = useCustomQuery("/data/recentReviews.json", [
    "recentReviews",
  ]);
  const analyticsData = useCustomQuery("/data/analytics.json", ["analytics"]);

  const instructorStats =
    (instructorStatsData?.data?.data as InstructorStats[] | undefined)?.map(
      (s: InstructorStats) => ({
        ...s,
        Icon: ICONS[s.icon] as LucideIcon,
      })
    ) ?? [];

  const myCourses: InstructorCourses[] =
    instructorCoursesData?.data?.data ?? [];

  const recentReviews: RecentReview[] = recentReviewsData?.data?.data ?? [];

  const analytics: Analytics = analyticsData?.data?.data ?? {};

  const handleDeleteCourse = (courseId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );
    if (confirmDelete) {
      console.log("Deleting course:", courseId);
      toast.success("Course has been deleted successfully.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your courses and track your teaching success.
            </p>
          </div>
          <button
            onClick={() => {
              navigate("/course-builder");
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {instructorStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "courses", label: "My Courses" },
                { id: "analytics", label: "Analytics" },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === "courses" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  My Courses
                </h3>
                <div className="space-y-4">
                  {myCourses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start">
                        <img
                          src={course.thumbnail}
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
                                <span className="mr-4">
                                  Revenue: {course.revenue}
                                </span>
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
                                onClick={() =>
                                  navigate(`/catalog/${course.id}`)
                                }
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Course"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate("/course-builder")}
                                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                title="Edit Course"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
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
                  ))}
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Course Performance
                  </h3>
                  <div className="space-y-4">
                    {analytics.coursePerformance.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {course.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="mr-4">
                              {course.students.toLocaleString()} students
                            </span>
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${course.revenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Student Growth
                  </h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-end justify-center p-4">
                    <div className="flex items-end space-x-2 h-full">
                      {analytics.studentGrowth.map((value, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-600 rounded-t w-8 transition-all duration-300 hover:bg-blue-700"
                            style={{
                              height: `${
                                (value / Math.max(...analytics.studentGrowth)) *
                                100
                              }%`,
                            }}
                          />
                          <span className="text-xs text-gray-500 mt-2">
                            {
                              ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][
                                index
                              ]
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Top Countries
                  </h3>
                  <div className="space-y-4">
                    {analytics.topCountries.map((country, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {country.country}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${country.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {country.students.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.student}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {review.course}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Reviews
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Download Reports
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Manage Payouts
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                This Month
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New Students</span>
                  <span className="font-semibold text-gray-900">+234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue</span>
                  <span className="font-semibold text-green-600">+$6,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Course Views</span>
                  <span className="font-semibold text-gray-900">+12,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New Reviews</span>
                  <span className="font-semibold text-gray-900">+45</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tips for Success
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">
                    Engage with Students
                  </p>
                  <p className="text-blue-700">
                    Respond to questions and reviews promptly
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Update Content</p>
                  <p className="text-green-700">
                    Keep your courses current and relevant
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-900">Promote Courses</p>
                  <p className="text-purple-700">
                    Share on social media and networks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPage;
