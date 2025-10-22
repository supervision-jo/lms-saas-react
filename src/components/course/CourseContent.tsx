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
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
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
  currentAssessmentId?: string;
  onLessonSelect: (lessonId: string) => void;
  isEnrolled: boolean;
  className?: string;
  onOpenAssessment?: (lessonId: string, assessment: Exam) => void;
  is_sequential: boolean; // passed in props
}

function AssessmentList({
  lesson,
  isEnrolled,
  onOpen,
  currentAssessmentId,
  t,
  forceLocked = false,
}: {
  lesson: Lesson;
  isEnrolled: boolean;
  onOpen: (assessment: Exam) => void;
  currentAssessmentId?: string;
  t: (k: string) => string;
  forceLocked?: boolean;
}) {
  const { data } = useCustomQuery(`${API_ENDPOINTS.exams}${lesson.id}/`, [
    "exams",
    String(lesson.id),
  ]);
  const assessments: Exam[] = data?.data ?? [];
  if (!assessments?.length) return null;
  const canAccess =
    (isEnrolled || lesson.free_preview) && !forceLocked && !lesson.is_locked;

  return (
    <div className="mt-2 space-y-1">
      {assessments.map((a) => {
        const Icon = a.type === "exam" ? Award : HelpCircle;
        const accent = a.type === "exam" ? "text-red-600" : "text-green-600";
        const isActive =
          currentAssessmentId && String(currentAssessmentId) === String(a.id);

        return (
          <button
            key={a.id}
            disabled={!canAccess}
            onClick={(e) => {
              e.stopPropagation();
              if (!canAccess) return;
              onOpen(a);
            }}
            className={`w-full flex items-start flex-col gap-2 justify-between rounded-lg py-3 px-4 text-left transition-all duration-200 ${
              !canAccess
                ? "opacity-50 cursor-not-allowed bg-gray-100"
                : isActive
                ? "bg-purple-600 text-white shadow-lg transform scale-[1.02]"
                : "hover:bg-white hover:shadow-md bg-white"
            }`}
            title={
              a.type === "exam"
                ? t("courseContent.openExam")
                : t("courseContent.openQuiz")
            }
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : accent}`} />
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-white" : "text-gray-700"
                }`}
              >
                {a.title ||
                  (a.type === "exam"
                    ? t("courseContent.exam")
                    : t("courseContent.quiz"))}
              </span>
            </div>
            <div
              className={`text-xs ${
                isActive ? "text-purple-200" : "text-gray-500"
              }`}
            >
              {a.time_limit}
              {t("courseContent.m")} • {t("courseContent.pass")}{" "}
              {a.passing_score}%
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
  currentAssessmentId,
  onLessonSelect,
  isEnrolled,
  className,
  onOpenAssessment,
  is_sequential, // ★ use this
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

        // ★ only block auto-select from a locked module when sequential
        const moduleAutoBlocked = is_sequential && !!firstModule.is_locked;

        if (!moduleAutoBlocked) {
          const firstPlayable =
            (firstModule.lessons ?? []).find(
              (lesson) =>
                (isEnrolled || lesson?.free_preview) && !lesson?.is_locked
            ) || (firstModule.lessons ?? [])[0];

          if (firstPlayable?.id) {
            onLessonSelect(String(firstPlayable.id));
            autoSelectedOnceRef.current = true;
          }
        }
      } else {
        setExpandedModules(nextExpanded);
      }
    } else {
      setExpandedModules(nextExpanded);
    }
    // ★ include is_sequential in deps
  }, [safeModules, currentLessonId, isEnrolled, is_sequential, pathname]); // eslint-disable-line

  const toggleModule = (moduleId: string | number) => {
    const key = String(moduleId);
    const next = new Set(expandedModules);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedModules(next);
  };

  const handleLessonClick = (lesson: Lesson, moduleLocked: boolean) => {
    // ★ module lock forces lesson lock only when sequential
    const effectiveLocked =
      (is_sequential && moduleLocked) || !!lesson?.is_locked;
    if (effectiveLocked) return;

    const canAccess = (isEnrolled || lesson?.free_preview) && !effectiveLocked;
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

  const getLessonIcon = (
    lesson: Lesson,
    isCurrentLesson: boolean,
    moduleLocked: boolean
  ) => {
    // ★ respect is_sequential for module → lesson lock
    const effectiveLocked =
      (is_sequential && moduleLocked) || !!lesson?.is_locked;
    if (effectiveLocked || (!isEnrolled && !lesson?.free_preview))
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
    return (mod?.lessons ?? []).reduce((sum, l) => {
      const v = (l as any)?.duration_hours;
      const n = typeof v === "number" ? v : parseFloat((v as any) ?? "0");
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
          const moduleLocked = !!module?.is_locked;

          return (
            <div
              key={key}
              className="bg-white mb-2 sm:mx-3 mx-1.5 mt-3 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleModule(module?.id)}
                className={`w-full sm:px-5 px-2 py-4 flex items-center justify-between transition-all duration-200 ${
                  isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                }`}
                title={t("courseContent.toggleModule")}
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
                    <h4 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                      {module?.title}
                      {moduleLocked && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-gray-700 bg-gray-200 rounded-full px-2 py-0.5">
                          <Lock className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {module?.lessons?.length} {t("courseContent.lessons")} •{" "}
                      {formatDuration(sumModuleHours(module), i18n.language)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Always render lessons if expanded.
                  If sequential AND module is locked → all lessons locked. */}
              {isExpanded && (
                <div className="sm:px-5 px-2 py-4 bg-gray-50">
                  {(module.lessons ?? []).map((lesson) => {
                    const isLessonActive =
                      String(lesson?.id) === String(currentLessonId);
                    const isCurrentLesson =
                      isLessonActive && !currentAssessmentId;

                    // ★ apply module lock only when sequential
                    const effectiveLocked =
                      (is_sequential && moduleLocked) || !!lesson?.is_locked;
                    const canAccess =
                      (isEnrolled || lesson?.free_preview) && !effectiveLocked;

                    return (
                      <div key={lesson?.id} className="mb-2">
                        <button
                          onClick={() =>
                            handleLessonClick(lesson, moduleLocked)
                          }
                          disabled={!canAccess}
                          className={`
    w-full flex items-center justify-between sm:px-4 px-3 py-3 rounded-xl transition-all duration-200 text-left
    border
    ${
      isCurrentLesson
        ? "bg-purple-600 border-purple-700 text-white shadow-lg scale-[1.02]"
        : lesson.completed
        ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        : canAccess
        ? "bg-white border-gray-200 hover:border-purple-400 hover:shadow-md"
        : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
    }
  `}
                        >
                          <div className="flex items-center justify-start gap-3 w-full">
                            <div>
                              {getLessonIcon(
                                lesson,
                                isCurrentLesson,
                                moduleLocked
                              )}
                            </div>
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
                            {lesson?.free_preview &&
                              !isEnrolled &&
                              !effectiveLocked && (
                                <span className="ltr:ml-2 rtl:mr-2 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                                  {t("courseContent.free")}
                                </span>
                              )}
                          </div>
                        </button>

                        {typeof onOpenAssessment === "function" &&
                          ["quiz", "exam"].includes(
                            (lesson?.content_type || "").toLowerCase()
                          ) && (
                            <AssessmentList
                              lesson={lesson}
                              isEnrolled={isEnrolled}
                              currentAssessmentId={currentAssessmentId}
                              onOpen={(a) =>
                                onOpenAssessment(String(lesson.id), a)
                              }
                              t={(k: string) => t(k)}
                              forceLocked={is_sequential && moduleLocked}
                            />
                          )}
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
