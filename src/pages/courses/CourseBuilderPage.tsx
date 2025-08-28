/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Plus,
  Save,
  Eye,
  Upload,
  Video,
  FileText,
  HelpCircle,
  Award,
  ArrowLeft,
  Trash2,
  Edit,
  GripVertical,
} from "lucide-react";
import QuizBuilder from "../../components/quizes/QuizBuilder";
import QuizPreview from "../../components/quizes/QuizPreview";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "article" | "quiz" | "exam" | "material";
  content?: string;
  videoUrl?: string;
  duration?: string;
  quiz?: any;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  category: string;
  level: string;
  modules: Module[];
}

const CourseBuilderPage: React.FC = () => {
  const [course, setCourse] = useState<Course>({
    id: Date.now().toString(),
    title: "",
    description: "",
    price: 0,
    category: "development",
    level: "beginner",
    modules: [],
  });

  const [activeTab, setActiveTab] = useState("course-info");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: "New Module",
      description: "",
      lessons: [],
      order: course.modules.length,
    };
    setCourse({
      ...course,
      modules: [...course.modules, newModule],
    });
    setSelectedModule(newModule.id);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourse({
      ...course,
      modules: course.modules.map((module) =>
        module.id === moduleId ? { ...module, ...updates } : module
      ),
    });
  };

  const deleteModule = (moduleId: string) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      setCourse({
        ...course,
        modules: course.modules.filter((module) => module.id !== moduleId),
      });
      if (selectedModule === moduleId) {
        setSelectedModule(null);
      }
    }
  };

  const addLesson = (moduleId: string, type: Lesson["type"]) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      order: 0,
    };

    setCourse({
      ...course,
      modules: course.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                { ...newLesson, order: module.lessons.length },
              ],
            }
          : module
      ),
    });

    if (type === "quiz") {
      setSelectedLesson(newLesson.id);
      setShowQuizBuilder(true);
    }
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    setCourse({
      ...course,
      modules: course.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              ),
            }
          : module
      ),
    });
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setCourse({
        ...course,
        modules: course.modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.filter(
                  (lesson) => lesson.id !== lessonId
                ),
              }
            : module
        ),
      });
    }
  };

  const handleQuizSave = (quiz: any) => {
    if (selectedModule && selectedLesson) {
      updateLesson(selectedModule, selectedLesson, { quiz });
      setShowQuizBuilder(false);
      setCurrentQuiz(null);
      setSelectedLesson(null);
    }
  };

  const handleQuizPreview = (quiz: any) => {
    setCurrentQuiz(quiz);
    setShowQuizPreview(true);
  };

  const editQuiz = (moduleId: string, lessonId: string) => {
    const module = course.modules.find((m) => m.id === moduleId);
    const lesson = module?.lessons.find((l) => l.id === lessonId);
    if (lesson?.quiz) {
      setCurrentQuiz(lesson.quiz);
      setSelectedModule(moduleId);
      setSelectedLesson(lessonId);
      setShowQuizBuilder(true);
    }
  };

  const saveCourse = () => {
    console.log("Saving course:", course);
    alert("Course saved successfully!");
  };

  const publishCourse = () => {
    console.log("Publishing course:", course);
    alert("Course published successfully!");
  };

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4" />;
      case "exam":
        return <Award className="w-4 h-4" />;
      case "material":
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

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
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("course-info")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "course-info"
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Course Information
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "curriculum"
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === "settings"
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "course-info" && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) =>
                        setCourse({ ...course, title: e.target.value })
                      }
                      placeholder="Enter course title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Description *
                    </label>
                    <textarea
                      value={course.description}
                      onChange={(e) =>
                        setCourse({ ...course, description: e.target.value })
                      }
                      placeholder="Describe what students will learn in this course"
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={course.price}
                        onChange={(e) =>
                          setCourse({
                            ...course,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={course.category}
                        onChange={(e) =>
                          setCourse({ ...course, category: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="development">Development</option>
                        <option value="business">Business</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="data-science">Data Science</option>
                        <option value="photography">Photography</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level *
                      </label>
                      <select
                        value={course.level}
                        onChange={(e) =>
                          setCourse({ ...course, level: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all-levels">All Levels</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Thumbnail
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Curriculum
                    </h2>
                    <button
                      onClick={addModule}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Module
                    </button>
                  </div>

                  {course.modules.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <FileText className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No modules yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start building your course by adding your first module
                      </p>
                      <button
                        onClick={addModule}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Your First Module
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.modules.map((module) => (
                        <div
                          key={module.id}
                          className="border border-gray-200 rounded-lg"
                        >
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={module.title}
                                    onChange={(e) =>
                                      updateModule(module.id, {
                                        title: e.target.value,
                                      })
                                    }
                                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                  />
                                  <input
                                    type="text"
                                    value={module.description}
                                    onChange={(e) =>
                                      updateModule(module.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Module description"
                                    className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mt-1"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="relative group">
                                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[150px]">
                                    <button
                                      onClick={() =>
                                        addLesson(module.id, "video")
                                      }
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <Video className="w-4 h-4 mr-2" />
                                      Video
                                    </button>
                                    <button
                                      onClick={() =>
                                        addLesson(module.id, "article")
                                      }
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      Article
                                    </button>
                                    <button
                                      onClick={() =>
                                        addLesson(module.id, "quiz")
                                      }
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <HelpCircle className="w-4 h-4 mr-2" />
                                      Quiz
                                    </button>
                                    <button
                                      onClick={() =>
                                        addLesson(module.id, "exam")
                                      }
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <Award className="w-4 h-4 mr-2" />
                                      Exam
                                    </button>
                                    <button
                                      onClick={() =>
                                        addLesson(module.id, "material")
                                      }
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Material
                                    </button>
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteModule(module.id)}
                                  className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {module.lessons.length > 0 && (
                            <div className="p-4">
                              <div className="space-y-2">
                                {module.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                      {getLessonIcon(lesson.type)}
                                      <div>
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) =>
                                            updateLesson(module.id, lesson.id, {
                                              title: e.target.value,
                                            })
                                          }
                                          className="font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                        />
                                        <p className="text-sm text-gray-500 capitalize">
                                          {lesson.type}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {lesson.type === "quiz" && (
                                        <button
                                          onClick={() =>
                                            editQuiz(module.id, lesson.id)
                                          }
                                          className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                                          title="Edit Quiz"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() =>
                                          deleteLesson(module.id, lesson.id)
                                        }
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
      {showQuizBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <QuizBuilder
              initialQuiz={currentQuiz}
              onSave={handleQuizSave}
              onPreview={handleQuizPreview}
            />
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowQuizBuilder(false);
                  setCurrentQuiz(null);
                  setSelectedLesson(null);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Preview Modal */}
      {showQuizPreview && currentQuiz && (
        <QuizPreview
          quiz={currentQuiz}
          onClose={() => setShowQuizPreview(false)}
          onEdit={() => {
            setShowQuizPreview(false);
            setShowQuizBuilder(true);
          }}
        />
      )}
    </div>
  );
};

export default CourseBuilderPage;
