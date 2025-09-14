import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Download, Sun, Moon } from "lucide-react";
import VideoPlayer from "../../reusable-components/VideoPlayer";
import ExamSection from "./ExamSection";

interface LessonContentProps {
  modules: Module[];
  currentLessonId: string;
  handleComplete: () => void;
  onLessonSelect: (lessonId: string) => void;
  assessment: Exam | null;
  setAssessment: React.Dispatch<React.SetStateAction<Exam | null>>;
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
  assessment,
  setAssessment,
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const timeoutRef = useRef<number | null>(null);

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

  const renderAssessment = () => {
    if (!assessment) return null;

    const safeExam: Exam = {
      id: assessment.id,
      type: assessment.type,
      title: assessment.title ?? "Quiz",
      description: assessment.description ?? "",
      lesson: assessment.lesson ?? currentLessonId,
      time_limit: assessment.time_limit ?? 0,
      passing_score: assessment.passing_score ?? 0,
      questions: Array.isArray(assessment.questions)
        ? assessment.questions
        : [],
    } as any;

    if (!safeExam.questions.length) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-gray-600">Loading quiz…</div>
          <button
            className="mt-4 px-4 py-2 text-black rounded border"
            onClick={() => setAssessment(null)}
          >
            Back
          </button>
        </div>
      );
    }

    return (
      <ExamSection
        exam={safeExam}
        onClose={() => {
          // Treat as finish → call parent if provided
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
            if (assessment) return renderAssessment();

            if (currentLessonData?.content_type?.toLowerCase() === "article") {
              return (
                <div
                  className={`rounded-lg p-8 max-h-[70vh] overflow-y-auto transition-colors duration-200 ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-100"
                      : "bg-white text-gray-900"
                  }`}
                >
                  {/* Theme Toggle */}
                  <div className="flex justify-between items-center mb-6">
                    <h1
                      className={`text-3xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {currentLessonData?.title}
                    </h1>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={
                        isDarkMode
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                    >
                      {isDarkMode ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="prose max-w-none">
                    <div className="space-y-6">
                      <p
                        className={`text-lg leading-relaxed ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Welcome to this comprehensive article on React
                        fundamentals. In this lesson, we'll explore the core
                        concepts that make React such a powerful library for
                        building user interfaces.
                      </p>

                      <h2
                        className={`text-2xl font-semibold mt-8 mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        What is React?
                      </h2>
                      <p
                        className={`leading-relaxed ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        React is a JavaScript library for building user
                        interfaces, particularly web applications. It was
                        developed by Facebook and is now maintained by Facebook
                        and the community. React allows developers to create
                        large web applications that can change data, without
                        reloading the page.
                      </p>

                      <h2
                        className={`text-2xl font-semibold mt-8 mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Key Features of React
                      </h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }
                        >
                          <strong
                            className={
                              isDarkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            Component-Based:
                          </strong>{" "}
                          Build encapsulated components that manage their own
                          state
                        </li>
                        <li
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }
                        >
                          <strong
                            className={
                              isDarkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            Declarative:
                          </strong>{" "}
                          React makes it painless to create interactive UIs
                        </li>
                        <li
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }
                        >
                          <strong
                            className={
                              isDarkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            Learn Once, Write Anywhere:
                          </strong>{" "}
                          Develop new features without rewriting existing code
                        </li>
                        <li
                          className={
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }
                        >
                          <strong
                            className={
                              isDarkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            Virtual DOM:
                          </strong>{" "}
                          Efficient updating and rendering of components
                        </li>
                      </ul>

                      <h2
                        className={`text-2xl font-semibold mt-8 mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Getting Started
                      </h2>
                      <p
                        className={`leading-relaxed ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        To get started with React, you'll need to have Node.js
                        installed on your computer. Once you have Node.js, you
                        can create a new React application using Create React
                        App:
                      </p>

                      <div
                        className={`rounded-lg p-4 my-4 ${
                          isDarkMode ? "bg-gray-900" : "bg-gray-100"
                        }`}
                      >
                        <code className="text-sm">
                          npx create-react-app my-app
                          <br />
                          cd my-app
                          <br />
                          npm start
                        </code>
                      </div>

                      <h2
                        className={`text-2xl font-semibold mt-8 mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Your First Component
                      </h2>
                      <p
                        className={`leading-relaxed ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Here's a simple example of a React component:
                      </p>

                      <div
                        className={`rounded-lg p-4 my-4 ${
                          isDarkMode ? "bg-gray-900" : "bg-gray-100"
                        }`}
                      >
                        <pre className="text-sm overflow-x-auto">
                          {`function Welcome(props) {
                              return <h1>Hello, {props.name}</h1>;
                            }

                            function App() {
                              return (
                                <div>
                                  <Welcome name="Sara" />
                                  <Welcome name="Cahal" />
                                  <Welcome name="Edite" />
                                </div>
                              );
                            }`}
                        </pre>
                      </div>

                      <h2
                        className={`text-2xl font-semibold mt-8 mb-4 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Conclusion
                      </h2>
                      <p
                        className={`leading-relaxed ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        React is a powerful tool for building modern web
                        applications. Its component-based architecture and
                        declarative nature make it easy to build and maintain
                        complex user interfaces. In the next lessons, we'll dive
                        deeper into React concepts like state, props, and
                        lifecycle methods.
                      </p>

                      <div
                        className={`mt-8 p-4 border-l-4 rounded ${
                          isDarkMode
                            ? "bg-blue-900 border-blue-400 text-blue-200"
                            : "bg-blue-50 border-blue-400 text-blue-800"
                        }`}
                      >
                        <p>
                          <strong
                            className={
                              isDarkMode ? "text-blue-100" : "text-blue-900"
                            }
                          >
                            Next Steps:
                          </strong>{" "}
                          Practice creating your own React components and
                          experiment with different props and state
                          configurations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (currentLessonData?.content_type?.toLowerCase() === "material") {
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
                  </div>
                </div>
              );
            }

            // video / default
            const rawUrl = currentLessonData?.url as string | undefined;
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
