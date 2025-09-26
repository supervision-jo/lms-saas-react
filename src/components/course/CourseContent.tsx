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
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { formatDuration } from "../../utils/formatDuration";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react-refresh/only-export-components
export function findNextLessonId(
  modules: Module[] = [],
  currentLessonId?: string | null
) {
  if (!currentLessonId) return null;
  const all = modules.flatMap((m) => m?.lessons ?? []);
  const idx = all.findIndex((l) => String(l?.id) === String(currentLessonId));
  if (idx === -1 || idx + 1 >= all.length) return null;
  return String(all[idx + 1]?.id ?? "");
}

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
  const { t, i18n } = useTranslation("courseDetails");
  const safeModules: Module[] = Array.isArray(modules) ? modules : [];
  const { pathname } = useLocation();

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const autoSelectedOnceRef = useRef(false);

  useEffect(() => {
    if (!pathname.includes("player")) return;
    if (!safeModules.length) return;

    const nextExpanded = new Set(expandedModules);

    if (currentLessonId) {
      const owner = safeModules.find((m) =>
        (m.lessons ?? []).some((l) => String(l?.id) === String(currentLessonId))
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
          onLessonSelect(String(firstPlayable.id));
          autoSelectedOnceRef.current = true;
        }
      }
    } else {
      setExpandedModules(nextExpanded);
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

    if (lesson?.content_type === "material" && (lesson as any)?.url) {
      const link = document.createElement("a");
      link.href = (lesson as any)?.url;
      link.download = lesson?.title || "material";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Download started!");
    } else {
      onLessonSelect(String(lesson?.id));
    }
  };

  const getLessonIcon = (lesson: Lesson, isCurrentLesson: boolean) => {
    if (!isEnrolled && !lesson?.free_preview)
      return <Lock className="w-4 h-4 text-gray-500" />;

    if ((lesson as any).watched) {
      return (
        <CheckCircle
          className={`w-4 h-4 ${
            isCurrentLesson ? "text-white" : "text-green-700"
          }`}
        />
      );
    }

    switch ((lesson?.content_type || "").toLowerCase()) {
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
      case "material":
        return <Download className="w-4 h-4 text-orange-600" />;
      case "quiz":
        return (
          <HelpCircle
            className={`w-4 h-4 ${
              isCurrentLesson ? "text-white" : "text-green-600"
            }`}
          />
        );
      case "exam":
        return (
          <Award
            className={`w-4 h-4 ${
              isCurrentLesson ? "text-white" : "text-red-600"
            }`}
          />
        );
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
      <div className="sm:p-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h3 className="text-xl font-bold">{t("courseContent.title")}</h3>
        <p className="text-purple-100 mt-1 text-sm">
          {safeModules.length} {t("courseContent.modules")} •{" "}
          {safeModules.reduce((acc, m) => acc + (m?.lessons?.length ?? 0), 0)}{" "}
          {t("courseContent.lessons")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {safeModules.map((module) => {
          const key = String(module?.id);
          const isExpanded = expandedModules.has(key);
          return (
            <div
              key={key}
              className="bg-white mb-2 sm:mx-3 mx-1.5 mt-3 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleModule(module?.id)}
                className="w-full sm:px-5 px-2 py-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 bg-white"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-purple-600 ltr:mr-3 rtl:ml-3 transition-transform duration-200" />
                  ) : i18n.language === "ar" ? (
                    <ChevronLeft className="w-5 h-5 text-gray-500 ml-3 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500 mr-3 transition-transform duration-200" />
                  )}
                  <div className="rtl:text-right ltr:text-left">
                    <h4 className="font-semibold text-gray-900 text-base">
                      {module?.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {module?.lessons?.length} {t("courseContent.lessons")} •{" "}
                      {formatDuration(sumModuleHours(module), i18n.language)}
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="sm:px-5 px-2 py-4 bg-gray-50">
                  {(module.lessons ?? []).map((lesson) => {
                    const isCurrentLesson =
                      String(lesson?.id) === String(currentLessonId);
                    const canAccess = isEnrolled || lesson?.free_preview;

                    return (
                      <div key={lesson?.id} className="mb-2">
                        <button
                          onClick={() => handleLessonClick(lesson)}
                          disabled={!canAccess}
                          className={`w-full flex items-start flex-col gap-2 py-3 sm:px-4 px-2 rounded-lg transition-all duration-200 text-left ${
                            !isCurrentLesson && (lesson as any)?.watched
                              ? "bg-green-50"
                              : isCurrentLesson
                              ? "bg-purple-600 text-white shadow-lg transform scale-[1.02]"
                              : canAccess
                              ? "hover:bg-white hover:shadow-md bg-white"
                              : "opacity-50 cursor-not-allowed bg-gray-100"
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
                              <Clock className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                              {formatDuration(
                                (lesson as any)?.duration_hours,
                                i18n.language
                              )}
                            </div>
                            {lesson?.free_preview && !isEnrolled && (
                              <span className="ltr:ml-2 rtl:mr-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                                {t("courseContent.free")}
                              </span>
                            )}
                          </div>
                        </button>
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
