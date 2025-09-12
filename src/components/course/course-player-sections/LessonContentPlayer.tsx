import { FileText, ChevronRight, Download } from "lucide-react";
import VideoPlayer from "../../reusable-components/VideoPlayer";
import ExamSection from "./ExamSection";
import { useEffect, useMemo, useRef, useState } from "react";

interface LessonContentProps {
  modules: Module[];
  currentLessonId: string;
  handleComplete: any;
  onLessonSelect: (lessonId: string) => void;
  assessment: Exam | null; // ⬅ added
  setAssessment: React.Dispatch<React.SetStateAction<Exam | null>>; // ⬅ added
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
  assessment,
  setAssessment,
}: LessonContentProps) {
  const allLessons = useMemo(
    () => modules?.flatMap((m) => m?.lessons ?? []) ?? [],
    [modules]
  );
  const currentLessonData = useMemo(
    () => allLessons.find((l) => l?.id === currentLessonId),
    [allLessons, currentLessonId]
  );

  const [showAutoNext, setShowAutoNext] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const nextLessonId = useMemo(() => {
    if (!currentLessonId || !allLessons?.length) return null;
    const idx = allLessons.findIndex((l) => l?.id === currentLessonId);
    if (idx === -1 || idx + 1 >= allLessons.length) return null;
    return allLessons[idx + 1]?.id ?? null;
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

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {(() => {
            if (currentLessonData?.content_type?.toLowerCase() === "article") {
              return (
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {currentLessonData?.title}
                        </h1>
                        <p className="text-gray-600 mt-1">
                          Reading time: {currentLessonData?.duration_hours}
                        </p>
                      </div>
                    </div>

                    {/* (Demo article content kept as-is) */}
                    <div className="prose prose-lg max-w-none">
                      <h2>Introduction to React Fundamentals</h2>
                      <p>
                        React is a powerful JavaScript library for building user
                        interfaces, particularly web applications. It was
                        created by Facebook and has become one of the most
                        popular tools for front-end development.
                      </p>

                      <h3>Key Concepts</h3>
                      <ul>
                        <li>
                          <strong>Components:</strong> The building blocks of
                          React applications
                        </li>
                        <li>
                          <strong>JSX:</strong> A syntax extension that allows
                          you to write HTML-like code in JavaScript
                        </li>
                        <li>
                          <strong>Props:</strong> Properties passed to
                          components
                        </li>
                        <li>
                          <strong>State:</strong> Data that changes over time in
                          your component
                        </li>
                      </ul>

                      <h3>Why Choose React?</h3>
                      <p>React offers several advantages:</p>
                      <ol>
                        <li>Component-based architecture for reusable code</li>
                        <li>Virtual DOM for efficient updates</li>
                        <li>Large ecosystem and community support</li>
                        <li>Backed by Facebook with regular updates</li>
                      </ol>

                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-blue-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              <strong>Pro Tip:</strong> Practice building small
                              components as you learn. Start with simple
                              elements like buttons and cards before moving to
                              complex features.
                            </p>
                          </div>
                        </div>
                      </div>

                      <h3>Next Steps</h3>
                      <p>
                        In the following lessons, we'll dive deeper into each of
                        these concepts and start building real React
                        applications. Make sure you have your development
                        environment set up before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (assessment) {
              return (
                <ExamSection
                  exam={assessment}
                  onClose={() => setAssessment(null)}
                />
              );
            } else if (
              currentLessonData?.content_type?.toLowerCase() === "material"
            ) {
              return (
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Download className="w-10 h-10 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                      {currentLessonData?.title}
                    </h1>
                    <p className="text-gray-600 mb-8">
                      Download essential files and resources for this course
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Starter Code
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Complete React project setup with all dependencies
                        </p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Download ZIP (2.3 MB)
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Cheat Sheet
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Quick reference guide for React concepts
                        </p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Download PDF (1.1 MB)
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-yellow-400 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-yellow-700">
                          <strong>Note:</strong> Make sure to extract the files
                          to your preferred development folder before starting
                          the exercises.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              const rawUrl = currentLessonData?.video_url as string | undefined;
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
                      Video not available for this lesson yet — showing poster
                      only.
                    </div>
                  )}
                </>
              );
            }
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
                <div className="mt-3 text-white font-semibold">Next</div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
