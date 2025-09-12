import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  Clock,
  FileText,
  Award,
  Download,
  HelpCircle,
} from "lucide-react";
import { formatDuration } from "../../utils/formatDuration";
import { useLocation } from "react-router";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";

interface CourseContentProps {
  modules: Module[];
  currentLessonId?: string;
  onLessonSelect: (lessonId: string) => void;
  isEnrolled: boolean;
  className?: string;
  onOpenAssessment: (lessonId: string, assessment: Exam) => void; // ⬅ added
}

function AssessmentList({
  lesson,
  isEnrolled,
  onOpen,
}: {
  lesson: Lesson;
  isEnrolled: boolean;
  onOpen: (assessment: Exam) => void;
}) {
  const { data } = useCustomQuery(
    `${API_ENDPOINTS.exams}?lesson=${lesson.id}`,
    ["exams", String(lesson.id)]
  );
  const assessments: Exam[] = data?.data ?? [];

  if (!assessments?.length) return null;

  const canAccess = isEnrolled || lesson.free_preview;

  return (
    <div className="mt-2 space-y-1">
      {assessments.map((a) => {
        const Icon = a.type === "exam" ? Award : HelpCircle;
        const accent = a.type === "exam" ? "text-red-600" : "text-green-600";

        return (
          <button
            key={a.id}
            disabled={!canAccess}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(a);
            }}
            className={`w-full flex items-start flex-col gap-2 justify-between rounded-lg py-3 px-4 text-left  transition-all duration-200 ${
              canAccess
                ? "hover:bg-white hover:shadow-md bg-white border-0 outline-none focus:outline-none"
                : "opacity-50 cursor-not-allowed bg-gray-100"
            }`}
            title={a.type === "exam" ? "Open Exam" : "Open Quiz"}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${accent}`} />
              <span className="text-sm font-medium text-gray-700">
                {a.title || (a.type === "exam" ? "Exam" : "Quiz")}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {a.time_limit}m • pass {a.passing_score}%
            </div>
          </button>
        );
      })}
    </div>
  );
}

const CourseContent: React.FC<CourseContentProps> = ({
  modules,
  currentLessonId,
  onLessonSelect,
  isEnrolled,
  className,
  onOpenAssessment,
}) => {
  const safeModules: Module[] = Array.isArray(modules) ? modules : [];
  const { pathname } = useLocation();

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const autoSelectedOnceRef = useRef(false);

  useEffect(() => {
    if (pathname.includes("player")) {
      if (!safeModules.length) return;

      const nextExpanded = new Set(expandedModules);

      if (currentLessonId) {
        const owner = safeModules.find((m) =>
          (m.lessons ?? []).some(
            (l) => String(l?.id) === String(currentLessonId)
          )
        );
        if (owner) nextExpanded.add(String(owner.id));
        setExpandedModules(nextExpanded);
        return;
      }

      if (!autoSelectedOnceRef.current) {
        const firstModule = safeModules[0];
        if (firstModule) {
          nextExpanded.add(String(firstModule.id));
          setExpandedModules(nextExpanded);

          const firstPlayable =
            (firstModule.lessons ?? []).find(
              (lesson) => isEnrolled || lesson?.free_preview
            ) || (firstModule.lessons ?? [])[0];

          if (firstPlayable?.id) {
            onLessonSelect(firstPlayable.id);
            autoSelectedOnceRef.current = true;
          }
        }
      } else {
        setExpandedModules(nextExpanded);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeModules, currentLessonId, isEnrolled]);

  const toggleModule = (moduleId: string | number) => {
    const key = String(moduleId);
    const next = new Set(expandedModules);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedModules(next);
  };

  const handleLessonClick = (lesson: Lesson) => {
    const canAccess = isEnrolled || lesson?.free_preview;
    if (!canAccess) return;

    if (lesson?.content_type === "material" && lesson?.video_url) {
      const link = document.createElement("a");
      link.href = lesson?.video_url;
      link.download = lesson?.title || "material";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Download started!");
    } else {
      onLessonSelect(lesson?.id);
    }
  };

  const getLessonIcon = (lesson: Lesson, isCurrentLesson: boolean) => {
    if (!isEnrolled && !lesson?.free_preview)
      return <Lock className="w-4 h-4 text-gray-500" />;
    switch (lesson?.content_type?.toLowerCase()) {
      case "video":
        return (
          <Play
            className={`w-4 h-4 ${
              isCurrentLesson ? "text-white" : "text-purple-600"
            } fill-current`}
          />
        );
      case "article":
        return (
          <FileText
            className={`w-4 h-4 ${
              isCurrentLesson ? "text-white" : "text-blue-600"
            }`}
          />
        );
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
        return (
          <Play
            className={`w-4 h-4 ${
              isCurrentLesson ? "text-white" : "text-purple-600"
            } fill-current`}
          />
        );
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

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {safeModules.map((module) => {
          const key = String(module?.id);
          const isExpanded = expandedModules.has(key);
          return (
            <div
              key={key}
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
                  {(module.lessons ?? []).map((lesson) => {
                    const isCurrentLesson =
                      String(lesson?.id) === String(currentLessonId);
                    const canAccess = isEnrolled || lesson?.free_preview;

                    return (
                      <div key={lesson?.id} className="mb-2">
                        <button
                          onClick={() => handleLessonClick(lesson)}
                          disabled={!canAccess}
                          className={`w-full flex items-start flex-col gap-2 py-3 px-4 rounded-lg transition-all duration-200 text-left ${
                            isCurrentLesson
                              ? "bg-purple-600 text-white shadow-lg transform scale-[1.02]"
                              : canAccess
                              ? "hover:bg-white hover:shadow-md bg-white border-0 outline-none focus:outline-none"
                              : "opacity-50 cursor-not-allowed bg-gray-100 border-0 outline-none focus:outline-none"
                          }`}
                        >
                          <div className="flex items-center justify-start gap-3 w-full">
                            <div>{getLessonIcon(lesson, isCurrentLesson)}</div>
                            <span
                              className={`text-sm font-medium block whitespace-break-spaces ${
                                isCurrentLesson ? "text-white" : "text-gray-700"
                              }`}
                            >
                              {lesson?.title}
                            </span>
                          </div>
                          <div className="flex items-center justify-between w-full">
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
                            {lesson?.free_preview && !isEnrolled && (
                              <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                                Free
                              </span>
                            )}
                          </div>
                        </button>
                        {/* attached assessments shown UNDER the lesson */}
                        <AssessmentList
                          lesson={lesson}
                          isEnrolled={isEnrolled}
                          onOpen={(a) => onOpenAssessment(lesson.id, a)}
                        />
                      </div>
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
