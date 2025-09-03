import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  // CheckCircle,
  Clock,
  FileText,
  Award,
  Download,
} from "lucide-react";

interface CourseContentProps {
  modulesData: Module[];
  currentLessonId?: string;
  onLessonSelect: (lessonId: string) => void;
  isEnrolled: boolean;
}

const CourseContent: React.FC<CourseContentProps> = ({
  modulesData,
  currentLessonId,
  onLessonSelect,
  isEnrolled,
}) => {
  const [expandedmodulesData, setExpandedmodulesData] = useState<Set<string>>(
    new Set(["1"])
  ); // Expand first module by default

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedmodulesData);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedmodulesData(newExpanded);
  };
  const handleLessonClick = (lesson: Lesson) => {
    const canAccess = isEnrolled || lesson.free_preview;
    
    if (!canAccess) return;

    if (lesson.content_type === "material" && lesson.video_url) {
      // Handle material download
      const link = document.createElement("a");
      link.href = lesson.video_url;
      link.download = lesson.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Download started!");
    } else {
      onLessonSelect(lesson.id);
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    // if (lesson.isCompleted) {
    //   return <CheckCircle className="w-4 h-4 text-green-500 fill-current" />;
    // }
    if (!isEnrolled && !lesson.free_preview) {
      return <Lock className="w-4 h-4 text-gray-500" />;
    }

    switch (lesson.content_type) {
      case "video":
        return <Play className="w-4 h-4 text-purple-600 fill-current" />;
      case "article":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "quiz":
        return (
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        );
      case "exam":
        return <Award className="w-4 h-4 text-red-600 fill-current" />;
      case "material":
        return <Download className="w-4 h-4 text-orange-600" />;
      default:
        return <Play className="w-4 h-4 text-purple-600 fill-current" />;
    }
  };

  return (
    <div className="bg-white h-full overflow-hidden shadow-lg">
      <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h3 className="text-xl font-bold">Course Content</h3>
        <p className="text-purple-100 mt-1 text-sm">
          {modulesData?.length} modulesData •{" "}
          {modulesData?.reduce((acc, m) => acc + m.lessonCount, 0)} lessons
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {modulesData?.map((module) => {
          const isExpanded = expandedmodulesData.has(module.id);

          return (
            <div
              key={module.id}
              className="bg-white mb-2 mx-3 mt-3 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 bg-white"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-purple-600 mr-3 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 mr-3 transition-transform duration-200" />
                  )}
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 text-base">
                      {module.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.lessonCount} lessons • {module.totalDuration}
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 bg-gray-50">
                  {module.lessons.map((lesson) => {
                    const isCurrentLesson = lesson.id === currentLessonId;
                    const canAccess = isEnrolled || lesson.free_preview;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        disabled={!canAccess}
                        className={`w-full flex items-center justify-between py-3 px-4 rounded-lg mb-2 transition-all duration-200 text-left ${
                          isCurrentLesson
                            ? "bg-purple-600 text-white shadow-lg transform scale-[1.02]"
                            : canAccess
                            ? "hover:bg-white hover:shadow-md bg-white border-0 outline-none focus:outline-none"
                            : "opacity-50 cursor-not-allowed bg-gray-100 border-0 outline-none focus:outline-none"
                        }`}
                      >
                        <div className="flex items-center">
                          {getLessonIcon(lesson)}
                          <span
                            className={`ml-3 text-sm text-left font-medium ${
                              isCurrentLesson ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {lesson.title}
                          </span>
                          {lesson.free_preview && !isEnrolled && (
                            <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                              Free
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex items-center text-xs ${
                            isCurrentLesson
                              ? "text-purple-200"
                              : "text-gray-600"
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {lesson.duration_hours}h
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseContent;
