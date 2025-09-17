import React, { useState } from "react";
import { ArrowLeft, Eye, Users, UserCheck } from "lucide-react";
import { useParams } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
import CourseInformationForm from "../../components/course/course-builder/CourseInformationForm";
import CreateSectionsForm from "../../components/course/course-builder/CreateSectionsForm";
import SettingsForm from "../../components/course/course-builder/SettingsForm";
import GroupManagement from "../../components/course/course-builder/GroupManagement";
import UserManagement from "../../components/course/course-builder/UserManagement";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const TABS = [
  { id: "course-info", label: "Course Information" },
  { id: "curriculum", label: "Curriculum" },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4 mr-2" /> },
  {
    id: "groups",
    label: "Groups",
    icon: <UserCheck className="w-4 h-4 mr-2" />,
  },
  { id: "settings", label: "Settings" },
];

const CourseBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("course-info");
  const { courseId } = useParams();

  const { data: courseData } = useCustomQuery(
    `${API_ENDPOINTS.oldCourses}${courseId}`,
    ["course", courseId],
    undefined,
    !!courseId
  );

  const course: Course = courseData?.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Eye className="w-4 h-4 mr-2" /> Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700"
                  }`}
                >
                  <span className="flex items-center">
                    {tab.icon ?? null}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {activeTab === "course-info" && (
              <CourseInformationForm course={course} />
            )}

            {activeTab === "curriculum" && (
              <DndProvider backend={HTML5Backend}>
                <CreateSectionsForm />
              </DndProvider>
            )}

            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <UserManagement />
              </div>
            )}

            {activeTab === "groups" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <GroupManagement />
              </div>
            )}

            {activeTab === "settings" && (
              <SettingsForm
                isPublished={Boolean(course?.is_published)}
                onChange={() => {
                  /* TODO: single-field PATCH publish */
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilderPage;
