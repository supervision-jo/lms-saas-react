import React, { useState } from "react";
import { ArrowLeft, Users, UserCheck } from "lucide-react";
// import QuizPreview from "../../components/quizes/QuizPreview";
import UserManagement from "../../components/course/course-builder/UserManagement";
import GroupManagement from "../../components/course/course-builder/GroupManagement";
import CourseInformationForm from "../../components/course/course-builder/CourseInformationForm";
import CreateSectionsForm from "../../components/course/course-builder/CreateSectionsForm";

const CourseBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("course-info");
  // const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  // const [showQuizPreview, setShowQuizPreview] = useState(false);
  // const [currentQuiz, setCurrentQuiz] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Course Builder
              </h1>
            </div>
            {/* <div className="flex items-center space-x-4">
              <button
                onClick={saveCourse}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button
                onClick={publishCourse}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Publish
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: "course-info", label: "Course Information" },
                  { id: "curriculum", label: "Curriculum" },
                  { id: "users", label: "Users", icon: Users },
                  { id: "groups", label: "Groups", icon: UserCheck },
                  { id: "settings", label: "Settings" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                      activeTab === tab.id
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "course-info" && (
              <CourseInformationForm setActiveTab={setActiveTab} />
            )}

            {activeTab === "curriculum" && <CreateSectionsForm />}

            {activeTab === "users" && <UserManagement />}

            {activeTab === "groups" && <GroupManagement />}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Publishing
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Course Status
                          </h4>
                          <p className="text-sm text-gray-600">
                            Control who can see your course
                          </p>
                        </div>
                        <select className="border border-gray-300 rounded-lg px-3 py-2">
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Enrollment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Auto-approve enrollments
                          </h4>
                          <p className="text-sm text-gray-600">
                            Students can enroll immediately
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Builder Modal */}

      {/* Quiz Preview Modal */}
      {/* {showQuizPreview && currentQuiz && (
        <QuizPreview
          quiz={currentQuiz}
          onClose={() => setShowQuizPreview(false)}
          onEdit={() => {
            setShowQuizPreview(false);
            setShowQuizBuilder(true);
          }}
        />
      )} */}
    </div>
  );
};

export default CourseBuilderPage;
