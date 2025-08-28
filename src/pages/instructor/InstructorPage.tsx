import React, { useState } from "react";
import { Plus, Users, DollarSign, Star, Edit, Trash2, Eye } from "lucide-react";

interface InstructorPageProps {
  onNavigate?: (page: string) => void;
}

const InstructorPage: React.FC<InstructorPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("courses");

  const instructorStats = [
    {
      label: "Total Students",
      value: "12,450",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      change: "+12%",
    },
    {
      label: "Total Revenue",
      value: "$45,230",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      change: "+8%",
    },
    {
      label: "Average Rating",
      value: "4.8",
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      change: "+0.2",
    },
    {
      label: "Course Views",
      value: "89,234",
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-100",
      change: "+15%",
    },
  ];

  const myCourses = [
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

  const recentReviews = [
    {
      id: "1",
      student: "Sarah Johnson",
      course: "Complete React Developer Course",
      rating: 5,
      comment: "Excellent course! Very detailed and easy to follow.",
      date: "2024-01-25",
    },
    {
      id: "2",
      student: "Mike Chen",
      course: "Advanced JavaScript Concepts",
      rating: 4,
      comment: "Great content, but could use more practical examples.",
      date: "2024-01-24",
    },
    {
      id: "3",
      student: "Emily Davis",
      course: "Complete React Developer Course",
      rating: 5,
      comment: "Best React course I've taken. Highly recommended!",
      date: "2024-01-23",
    },
  ];

  const analyticsData = {
    monthlyRevenue: [3200, 3800, 4200, 4800, 5200, 5800, 6200],
    studentGrowth: [1200, 1450, 1680, 1920, 2150, 2380, 2650],
    coursePerformance: [
      { name: "React Course", students: 5420, revenue: 18450, rating: 4.7 },
      {
        name: "JavaScript Course",
        students: 3200,
        revenue: 12800,
        rating: 4.6,
      },
      { name: "Node.js Course", students: 2100, revenue: 8400, rating: 4.5 },
    ],
    topCountries: [
      { country: "United States", students: 3200, percentage: 35 },
      { country: "India", students: 2100, percentage: 23 },
      { country: "United Kingdom", students: 1800, percentage: 20 },
      { country: "Canada", students: 1200, percentage: 13 },
      { country: "Australia", students: 850, percentage: 9 },
    ],
  };

  const handleCreateCourse = () => {
    if (onNavigate) {
      onNavigate("course-builder");
    }
  };

  const handleViewCourse = (courseId: string) => {
    console.log("Viewing course:", courseId);
    if (onNavigate) {
      onNavigate("course");
    }
  };

  const handleEditCourse = (courseId: string) => {
    console.log("Editing course:", courseId);
    if (onNavigate) {
      onNavigate("course-builder");
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );
    if (confirmDelete) {
      console.log("Deleting course:", courseId);
      alert("Course has been deleted successfully.");
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
            onClick={handleCreateCourse}
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
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
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
                                onClick={() => handleViewCourse(course.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Course"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditCourse(course.id)}
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
                    {analyticsData.coursePerformance.map((course, index) => (
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
                      {analyticsData.studentGrowth.map((value, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-600 rounded-t w-8 transition-all duration-300 hover:bg-blue-700"
                            style={{
                              height: `${
                                (value /
                                  Math.max(...analyticsData.studentGrowth)) *
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
                    {analyticsData.topCountries.map((country, index) => (
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

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing 1-3 of 45 reviews
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      disabled
                    >
                      Previous
                    </button>
                    <button className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg">
                      1
                    </button>
                    <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      2
                    </button>
                    <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      3
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-500">...</span>
                    <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      15
                    </button>
                    <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                Course Content
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Study Groups
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-gray-700">
                          Frontend Developers
                        </span>
                      </div>
                      <span className="text-gray-500">12 members</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-700">Backend Engineers</span>
                      </div>
                      <span className="text-gray-500">8 members</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-gray-700">UI/UX Designers</span>
                      </div>
                      <span className="text-gray-500">15 members</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium">
                    <span
                      onClick={() => onNavigate && onNavigate("course-builder")}
                    >
                      Manage Groups
                    </span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Course Modules
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Getting Started</span>
                      <span>8 lessons</span>
                    </div>
                    <div className="flex justify-between">
                      <span>React Components</span>
                      <span>12 lessons</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Management</span>
                      <span>10 lessons</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium">
                    <span
                      onClick={() => onNavigate && onNavigate("course-builder")}
                    >
                      Edit Curriculum
                    </span>
                  </button>
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
