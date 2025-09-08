import React, { useCallback, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  Clock,
  FileText,
  Award,
  Download,
} from "lucide-react";
import { formatDuration } from "../../utils/formatDuration";

interface CourseContentProps {
  modules: Module[];
  currentLessonId?: string;
  onLessonSelect: (lessonId: string) => void;
  isEnrolled: boolean;
  className?: string;
}

const CourseContent: React.FC<CourseContentProps> = ({
  modules,
  currentLessonId,
  onLessonSelect,
  isEnrolled,
  className,
}) => {
  const safeModules: Module[] = Array.isArray(modules) ? modules : [];

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(["1"])
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) newExpanded.delete(moduleId);
    else newExpanded.add(moduleId);
    setExpandedModules(newExpanded);
  };

  const handleLessonClick = (lesson: Lesson) => {
    const canAccess = isEnrolled || lesson?.free_preview;
    if (!canAccess) return;

    if (lesson?.content_type === "material" && lesson?.video_url) {
      const link = document.createElement("a");
      link.href = lesson?.video_url;
      link.download = lesson?.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Download started!");
    } else {
      onLessonSelect(lesson?.id);
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (!isEnrolled && !lesson?.free_preview)
      return <Lock className="w-4 h-4 text-gray-500" />;
    switch (lesson?.content_type?.toLowerCase()) {
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

  const sumModuleHours = useCallback((mod?: Module): number => {
    if (!mod) return 0;
    return (mod.lessons ?? []).reduce((sum, l) => {
      const v = (l as any)?.duration_hours;
      const n = typeof v === "number" ? v : parseFloat(v ?? "0");
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, []);

  return (
    <div
      className={`bg-white h-full min-h-0 flex flex-col shadow-lg ${
        className ?? ""
      }`}
    >
      <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h3 className="text-xl font-bold">Course Content</h3>
        <p className="text-purple-100 mt-1 text-sm">
          {safeModules.length} modules •{" "}
          {safeModules.reduce((acc, m) => acc + (m?.lessons?.length ?? 0), 0)}{" "}
          lessons
        </p>
      </div>

      {/* this is the scroller */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {safeModules.map((module) => {
          const isExpanded = expandedModules.has(module?.id);
          return (
            <div
              key={module?.id}
              className="bg-white mb-2 mx-3 mt-3 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleModule(module?.id)}
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
                      {module?.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {module?.lessons?.length} lessons •{" "}
                      {formatDuration(sumModuleHours(module))}
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 py-4 bg-gray-50">
                  {module.lessons.map((lesson) => {
                    const isCurrentLesson = lesson?.id === currentLessonId;
                    const canAccess = isEnrolled || lesson?.free_preview;

                    return (
                      <button
                        key={lesson?.id}
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
                            {lesson?.title}
                          </span>
                          {lesson?.free_preview && !isEnrolled && (
                            <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                              Free
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex items-center text-xs min-w-16 ${
                            isCurrentLesson
                              ? "text-purple-200"
                              : "text-gray-600"
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(lesson?.duration_hours)}
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
