import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Clock,
  LucideIcon,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
import EnrolledCourses from "../../components/dashboard/EnrolledCourses";
import { readUserFromStorage } from "../../services/auth";

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

const dashboardStatsData = [
  {
    label: "Courses Enrolled",
    value: "12",
    icon: "BookOpen",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    label: "Hours Learned",
    value: "156",
    icon: "Clock",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    label: "Certificates",
    value: "8",
    icon: "Award",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    label: "Streak Days",
    value: "23",
    icon: "TrendingUp",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

const ICONS = {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
} as const;

type IconName = keyof typeof ICONS;

type DashboardState = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  bg: string;
  border: string;
};

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const navigate = useNavigate();

  const enrolledCoursesData = useCustomQuery(API_ENDPOINTS.enrolledCourses, [
    "enrolledCourses",
  ]);

  const enrolledCourses: EnrolledCourse[] =
    enrolledCoursesData?.data?.data ?? [];

  const stats =
    (dashboardStatsData as DashboardState[] | undefined)?.map(
      (s: DashboardState) => ({
        ...s,
        Icon: ICONS[s.icon] as LucideIcon,
      })
    ) ?? [];

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

  const currentUser: User = readUserFromStorage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {currentUser?.first_name}! 👋
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
                  <stat.Icon className={`w-6 h-6 ${stat.color}`} />
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
                  {enrolledCourses.map((item) => (
                    <EnrolledCourses item={item} key={item.id} />
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
