import React, { useState } from "react";
import { BookOpen, Trophy } from "lucide-react";
import { useNavigate } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { ACCESS_TOKEN_KEY, API_ENDPOINTS } from "../../utils/constants";
import EnrolledCourses from "../../components/dashboard/EnrolledCourses";
import { readUserFromStorage, roleOf } from "../../services/auth";
import HeaderStatistics from "../../components/dashboard/HeaderStatistics";
import { useTranslation } from "react-i18next";
import { getCookie } from "../../services/cookies";

const achievements = [
  { id: "1", icon: "🎓", date: "2024-01-15" },
  { id: "2", icon: "🔥", date: "2024-01-20" },
  { id: "3", icon: "⚡", date: "2024-01-25" },
  { id: "4", icon: "🧠", date: "2024-02-01" },
  { id: "5", icon: "🤝", date: "2024-02-05" },
  { id: "6", icon: "📚", date: "2024-02-10" },
];

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"courses" | "achievements">(
    "courses"
  );
  const navigate = useNavigate();
  const { t } = useTranslation("studentDashboard");

  const currentUser: User = readUserFromStorage();
  const isStudent = roleOf(currentUser) === "student";
  const token = getCookie(ACCESS_TOKEN_KEY);
  const enrolledCoursesData = useCustomQuery(
    `${API_ENDPOINTS.enrolledCourses}`,
    ["enrolledCourses"],
    {
      headers: {
        ...(isStudent && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    !!isStudent
  );

  const { data: studentStatsData } = useCustomQuery(
    API_ENDPOINTS.studentStats,
    ["student-stats", currentUser?.id],
    undefined,
    !!isStudent
  );

  const studentStats: StudentStats = studentStatsData?.data;
  const enrolledCourses: EnrolledCourse[] =
    enrolledCoursesData?.data?.data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {t("header.welcome", { name: currentUser?.first_name ?? "" })}
                </h1>
                <p className="text-purple-100 text-lg">
                  {t("header.subtitle")}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {studentStats?.overall_progress ?? 0}%
                    </div>
                    <div className="text-purple-100 text-sm">
                      {t("header.overallProgress")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <HeaderStatistics stats={studentStats} />

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-2">
            <nav className="flex space-x-2">
              {[
                {
                  id: "courses" as const,
                  label: t("tabs.myCourses"),
                  icon: BookOpen,
                },
                {
                  id: "achievements" as const,
                  label: t("tabs.achievements"),
                  icon: Trophy,
                },
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
                    {t("coursesSection.title")}
                  </h3>
                  <button
                    onClick={() => navigate("/catalog")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
                  >
                    {t("coursesSection.exploreMore")}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {enrolledCourses.map((item) => (
                    <EnrolledCourses
                      item={item}
                      key={item.id}
                      isStudent={isStudent}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  {t("achievementsSection.title")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievements.map((a) => (
                    <div
                      key={a.id}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-5xl mb-4">{a.icon}</div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {t(`achievementsSection.items.${a.id}.title`)}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {t(`achievementsSection.items.${a.id}.desc`)}
                      </p>
                      <p className="text-xs text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full inline-block">
                        {a.date}
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
                {t("quickActions.title")}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/catalog")}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg"
                >
                  {t("quickActions.browseNew")}
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  {t("quickActions.viewCerts")}
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  {t("quickActions.updateProfile")}
                </button>
              </div>
            </div>

            {/* This Month Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-6">{t("thisMonth.title")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">
                    {t("thisMonth.newCourses")}
                  </span>
                  <span className="font-bold text-xl">
                    {studentStats?.new_courses_this_month
                      ? `+${studentStats?.new_courses_this_month}`
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">
                    {t("thisMonth.hoursLearned")}
                  </span>
                  <span className="font-bold text-xl">
                    {studentStats?.hours_learned_this_month
                      ? `+${studentStats?.hours_learned_this_month}h`
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">
                    {t("thisMonth.certificates")}
                  </span>
                  <span className="font-bold text-xl">
                    {studentStats?.certificates_this_month
                      ? `+${studentStats?.certificates_this_month}`
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">
                    {t("thisMonth.streakDays")}
                  </span>
                  <span className="font-bold text-xl">
                    {studentStats?.streak_days_this_month ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Achievements (if you add later) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
