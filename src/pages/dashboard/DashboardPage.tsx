import React, { useState } from "react";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  Star,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router";

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();

  const enrolledCourses = [
    {
      id: "1",
      title: "Complete React Developer Course",
      instructor: "John Doe",
      thumbnail:
        "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 68,
      totalLessons: 45,
      completedLessons: 31,
      timeSpent: "24h 30m",
      lastAccessed: "2 hours ago",
      rating: 4.7,
      category: "Development",
    },
    {
      id: "2",
      title: "Python for Data Science",
      instructor: "Jane Smith",
      thumbnail:
        "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 45,
      totalLessons: 32,
      completedLessons: 14,
      timeSpent: "18h 15m",
      lastAccessed: "1 day ago",
      rating: 4.6,
      category: "Data Science",
    },
    {
      id: "3",
      title: "UI/UX Design Masterclass",
      instructor: "Alex Brown",
      thumbnail:
        "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 25,
      totalLessons: 28,
      completedLessons: 7,
      timeSpent: "12h 45m",
      lastAccessed: "3 days ago",
      rating: 4.4,
      category: "Design",
    },
    {
      id: "4",
      title: "Digital Marketing Strategy",
      instructor: "Sarah Wilson",
      thumbnail:
        "https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 80,
      totalLessons: 24,
      completedLessons: 19,
      timeSpent: "16h 20m",
      lastAccessed: "5 hours ago",
      rating: 4.5,
      category: "Marketing",
    },
  ];

  const achievements = [
    {
      id: "1",
      title: "First Course Completed",
      icon: "🎓",
      date: "2024-01-15",
      description: "Completed your first course",
    },
    {
      id: "2",
      title: "Week Streak",
      icon: "🔥",
      date: "2024-01-20",
      description: "Learned for 7 consecutive days",
    },
    {
      id: "3",
      title: "Fast Learner",
      icon: "⚡",
      date: "2024-01-25",
      description: "Completed 3 courses in one month",
    },
    {
      id: "4",
      title: "Quiz Master",
      icon: "🧠",
      date: "2024-02-01",
      description: "Scored 100% on 5 quizzes",
    },
    {
      id: "5",
      title: "Community Helper",
      icon: "🤝",
      date: "2024-02-05",
      description: "Helped 10 fellow students",
    },
    {
      id: "6",
      title: "Dedicated Student",
      icon: "📚",
      date: "2024-02-10",
      description: "Spent 100+ hours learning",
    },
  ];

  const stats = [
    {
      label: "Courses Enrolled",
      value: "12",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Hours Learned",
      value: "156",
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      label: "Certificates",
      value: "8",
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      label: "Streak Days",
      value: "23",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
  ];

  // const weeklyActivity = [
  //   { day: "Mon", hours: 2.5 },
  //   { day: "Tue", hours: 1.8 },
  //   { day: "Wed", hours: 3.2 },
  //   { day: "Thu", hours: 2.1 },
  //   { day: "Fri", hours: 1.5 },
  //   { day: "Sat", hours: 4.0 },
  //   { day: "Sun", hours: 2.8 },
  // ];

  // const maxHours = Math.max(...weeklyActivity.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, John! 👋
                </h1>
                <p className="text-purple-100 text-lg">
                  Continue your learning journey and achieve your goals.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">68%</div>
                    <div className="text-purple-100 text-sm">
                      Overall Progress
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${stat.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-center">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-2">
            <nav className="flex space-x-2">
              {[
                { id: "courses", label: "My Courses", icon: BookOpen },
                { id: "achievements", label: "Achievements", icon: Trophy },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
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
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    My Courses
                  </h3>
                  <button
                    onClick={() => navigate("/catalog")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
                  >
                    Explore More Courses
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className="group bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-start">
                        <div className="relative">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
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
                                {course.title}
                              </h4>
                              <p className="text-gray-600 mb-3">
                                {course.instructor}
                              </p>
                              <div className="flex items-center text-sm text-gray-500 mb-4">
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mr-4">
                                  {course.category}
                                </span>
                                <Clock className="w-4 h-4 mr-1" />
                                <span className="mr-4">{course.timeSpent}</span>
                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                <span className="mr-4">{course.rating}</span>
                                <span className="text-gray-400">
                                  Last accessed {course.lastAccessed}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1 mr-6">
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span className="font-medium">
                                      {course.progress}% complete
                                    </span>
                                    <span>
                                      {course.completedLessons}/
                                      {course.totalLessons} lessons
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => navigate("/player")}
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
                  ))}
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-5xl mb-4">{achievement.icon}</div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {achievement.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full inline-block">
                        {achievement.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/catalog")}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
                >
                  Browse New Courses
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  View Certificates
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  Update Profile
                </button>
              </div>
            </div>

            {/* This Month Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-6">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">New Courses</span>
                  <span className="font-bold text-xl">+3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Hours Learned</span>
                  <span className="font-bold text-xl">+42h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Certificates</span>
                  <span className="font-bold text-xl">+2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Streak Days</span>
                  <span className="font-bold text-xl">23</span>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
