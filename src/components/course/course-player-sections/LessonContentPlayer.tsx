import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Download } from "lucide-react";
import VideoPlayer from "../../reusable-components/VideoPlayer";
import ExamSection from "./ExamSection";
import { useTranslation } from "react-i18next";
import { useCustomQuery } from "../../../hooks/useQuery";
import { API_ENDPOINTS } from "../../../utils/constants";

interface LessonContentProps {
  modules: Module[];
  currentLessonId: string;
  handleComplete: () => void;
  onLessonSelect: (lessonId: string) => void;
  onAssessmentSubmit?: () => void; // called when learner finishes a quiz/exam
}

const isMockUrl = (u?: string) => !!u && /(^|\/\/)example\.com/i.test(u);

const isPlayableUrl = (u?: string) =>
  !!u &&
  !isMockUrl(u) &&
  (/(?:youtu\.be|youtube\.com\/(?:watch|embed|shorts))/i.test(u) ||
    /\.(mp4|webm|ogg|ogv|m3u8)(?:\?|$)/i.test(u));

const DEFAULT_POSTER =
  "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800";

export default function LessonContentPlayer({
  modules,
  currentLessonId,
  handleComplete,
  onLessonSelect,
  onAssessmentSubmit,
}: LessonContentProps) {
  const allLessons = useMemo(
    () => modules?.flatMap((m) => m?.lessons ?? []) ?? [],
    [modules]
  );
  const currentLessonData = useMemo(
    () => allLessons.find((l) => String(l?.id) === String(currentLessonId)),
    [allLessons, currentLessonId]
  );

  const [showAutoNext, setShowAutoNext] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { t } = useTranslation("coursePlayer");

  const nextLessonId = useMemo(() => {
    if (!currentLessonId || !allLessons?.length) return null;
    const idx = allLessons.findIndex(
      (l) => String(l?.id) === String(currentLessonId)
    );
    if (idx === -1 || idx + 1 >= allLessons.length) return null;
    return String(allLessons[idx + 1]?.id ?? "");
  }, [allLessons, currentLessonId]);

  const cancelAutoNext = () => {
    setShowAutoNext(false);
    setAnimateRing(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    cancelAutoNext();
  }, [currentLessonId]);

  useEffect(() => cancelAutoNext, []); // cleanup on unmount

  const proceedNext = () => {
    cancelAutoNext();
    if (nextLessonId) {
      setTimeout(() => onLessonSelect(nextLessonId), 0);
    }
  };

  const beginAutoNext = () => {
    if (currentLessonData?.content_type?.toLowerCase() !== "video") return;
    setShowAutoNext(true);
    requestAnimationFrame(() => setAnimateRing(true));
    timeoutRef.current = window.setTimeout(proceedNext, 5000);
  };

  const onVideoComplete = () => {
    try {
      handleComplete?.();
    } catch {
      //
    }
    beginAutoNext();
  };

  // at top of the component
  const [downloading, setDownloading] = useState(false);

  const downloadMaterial = async (rawUrl?: string) => {
    if (!rawUrl) return;
    try {
      setDownloading(true);

      const u = new URL(rawUrl);
      const pathname = u.pathname;
      const base = pathname.substring(pathname.lastIndexOf("/") + 1) || "file";
      const filename = base.includes(".") ? base : `${base}.download`;

      const res = await fetch(rawUrl, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      console.log(e);
      window.open(rawUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  // NEW: fetch quiz/exam by *lesson id* when lesson is assessment
  const isAssessment =
    (currentLessonData?.content_type || "").toLowerCase() === "quiz" ||
    (currentLessonData?.content_type || "").toLowerCase() === "exam";

  const { data: examResp, isFetching: loadingExam } = useCustomQuery(
    isAssessment ? `${API_ENDPOINTS.exams}${currentLessonId}/` : "",
    ["exams", String(currentLessonId)],
    undefined,
    isAssessment && !!currentLessonId
  );

  const exam: Exam | null = useMemo(() => {
    const raw = examResp?.data ?? null;
    if (raw && typeof raw === "object") {
      return {
        id: raw.id,
        type: raw.type,
        title: raw.title ?? currentLessonData?.title ?? "",
        description: raw.description ?? currentLessonData?.description ?? "",
        lesson: currentLessonId,
        time_limit: raw.time_limit ?? 0,
        passing_score: raw.passing_score ?? 0,
        questions: Array.isArray(raw.questions) ? raw.questions : [],
      } as any;
    }
    return null;
  }, [examResp, currentLessonData, currentLessonId]);

  const renderAssessment = () => {
    if (!isAssessment) return null;

    if (loadingExam || !exam) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-gray-600">{t("content.loadingQuiz")}</div>
        </div>
      );
    }

    return (
      <ExamSection
        exam={exam}
        onClose={() => {
          onAssessmentSubmit?.();
        }}
      />
    );
  };

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {(() => {
            if (isAssessment) return renderAssessment();

            if (currentLessonData?.content_type?.toLowerCase() === "article") {
              return (
                <div
                  className={`rounded-lg flex flex-col items-start p-8 max-h-[70vh] overflow-y-auto transition-colors duration-200 bg-white text-gray-900`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold text-gray-900`}>
                      {currentLessonData?.title}
                    </h1>
                  </div>

                  <div className="prose max-w-none">
                    <div
                      className="space-y-6"
                      dangerouslySetInnerHTML={{
                        __html: (currentLessonData as any)?.description_html,
                      }}
                    />

                    {currentLessonData?.description && (
                      <div
                        className={`mt-8 p-4 border-l-4 rounded bg-blue-50 border-blue-400 text-blue-800`}
                      >
                        <p>{currentLessonData?.description}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 self-end"
                  >
                    {t("content.markComplete")}
                  </button>
                </div>
              );
            }

            if (currentLessonData?.content_type?.toLowerCase() === "material") {
              const fileUrl = (currentLessonData as any)?.file ?? "";

              return (
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <div className="max-w-4xl mx-auto text-center">
                    <button
                      onClick={() => downloadMaterial(fileUrl)}
                      className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
                      title={
                        downloading
                          ? t("content.downloading")
                          : t("content.download")
                      }
                    >
                      <Download className="w-10 h-10 text-orange-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {currentLessonData?.title}
                    </h1>
                    <p className="text-gray-600 mb-8">
                      {currentLessonData?.description}
                    </p>
                    {fileUrl && (
                      <div className="text-sm text-gray-500 break-all">
                        {decodeURIComponent(
                          new URL(fileUrl).pathname.split("/").pop() || ""
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // video / default
            const rawUrl = (currentLessonData as any)?.url as
              | string
              | undefined;
            const safeUrl = isPlayableUrl(rawUrl) ? rawUrl! : "";
            const poster =
              (currentLessonData as any)?.poster ||
              (currentLessonData as any)?.thumbnail ||
              DEFAULT_POSTER;

            return (
              <>
                <VideoPlayer
                  key={currentLessonId}
                  privacyEnhanced
                  src={safeUrl}
                  poster={poster}
                  title={currentLessonData?.title}
                  onComplete={onVideoComplete}
                />
                {!safeUrl && (
                  <div className="mt-2 text-xs text-amber-500">
                    {t("content.noVideo")}
                  </div>
                )}
              </>
            );
          })()}

          {showAutoNext &&
            currentLessonData?.content_type?.toLowerCase() === "video" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60">
                <button
                  onClick={proceedNext}
                  aria-label="Next lesson"
                  className="relative w-24 h-24"
                >
                  <svg
                    className="absolute inset-0 w-24 h-24"
                    viewBox="0 0 36 36"
                    fill="none"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      stroke="#9333ea"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="100"
                      strokeDashoffset={animateRing ? 0 : 100}
                      style={{ transition: "stroke-dashoffset 5s linear" }}
                      transform="rotate(-90 18 18)"
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChevronRight className="w-9 h-9 text-white" />
                  </div>
                </button>
                <div className="mt-3 text-white font-semibold">
                  {t("content.next")}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
