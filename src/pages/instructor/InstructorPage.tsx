import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import StatisticsCards from "../../components/instructor-dashboard/StatisticsCards";
import CoursesSection from "../../components/instructor-dashboard/CoursesSection";
import AnalyticsSection from "../../components/instructor-dashboard/AnalyticsSection";
import ReviewsSection from "../../components/instructor-dashboard/ReviewsSection";
import InstructorDashboardSidebar from "../../components/instructor-dashboard/Sidebar";

const InstructorPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("courses");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex sm:items-center items-start sm:flex-row flex-col sm:justify-between justify-start gap-4 sm:gap-0 mb-8">
          <div>
            <h1 className="sm:text-3xl text-xl font-bold text-gray-900 mb-2">
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
            className="bg-purple-600 text-white sm:px-6 px-3 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </button>
        </div>

        {/* Stats Cards */}
        <StatisticsCards />

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
            {activeTab === "courses" && <CoursesSection />}

            {activeTab === "analytics" && <AnalyticsSection />}

            {activeTab === "reviews" && <ReviewsSection />}
          </div>

          {/* Sidebar */}
          <InstructorDashboardSidebar />
        </div>
      </div>
    </div>
  );
};

export default InstructorPage;
