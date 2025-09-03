import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Star,
  Award,
  Users,
  X,
  ListVideo, // ← trigger icon for the drawer on mobile
} from "lucide-react";
import CourseContent from "../../components/course/CourseContent";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
import { useParams } from "react-router";
import NotesSection from "../../components/course/course-player-sections/NotesSection";
import QASection from "../../components/course/course-player-sections/QASection";
import LessonContentPlayer from "../../components/course/course-player-sections/LessonContentPlayer";
import { formatDuration } from "../../utils/formatDuration";

export default function CoursePlayerPage() {
  const { courseId } = useParams();

  const { data: courseRes } = useCustomQuery(
    `${API_ENDPOINTS.courses}${courseId}/`,
    ["course", courseId],
    undefined,
    !!courseId
  );

  const { data: modulesData } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    ["modules", courseId],
    undefined,
    !!courseId
  );

  const courseData: Course = courseRes?.data;
  const modules: Module[] = useMemo(
    () => modulesData?.data?.data ?? [],
    [modulesData]
  );

  // ---- State ----
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [showNotes, setShowNotes] = useState(true);
  const [showQA, setShowQA] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [notes, setNotes] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savedNotes, setSavedNotes] = useState<{ [key: string]: string }>({});
  const [showExam, setShowExam] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(
    undefined
  );

  // NEW: mobile drawer open/close
  const [contentOpen, setContentOpen] = useState(false);

  // Auto-select the first lesson of the first module once modules load
  useEffect(() => {
    if (!modules?.length) return;
    const first = modules[0]?.lessons?.[0];
    if (!first) return;
    setCurrentLessonId((prev) => (prev ? prev : first.id));
    setCurrentLesson(first);
    if (first?.content_type?.toLowerCase() === "exam") {
      setShowExam(true);
      setShowNotes(false);
      setShowQA(false);
    } else {
      setShowExam(false);
    }
  }, [modules]);

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setNotes(savedNotes[lessonId] || "");
    setReplyingTo(null);
    setReplyText("");

    // Close drawer on mobile after selecting
    setContentOpen(false);

    const allLessons = modules?.flatMap((m) => m?.lessons ?? []);
    const selectedLesson = allLessons?.find((l) => l?.id === lessonId);

    if (selectedLesson?.content_type?.toLowerCase() === "exam") {
      setShowExam(true);
      setShowNotes(false);
      setShowQA(false);
    } else {
      setShowExam(false);
      setCurrentLesson(selectedLesson as Lesson);
    }
  };

  const handleComplete = () => {
    console.log("Lesson completed");
  };

  const handleSaveNotes = () => {
    setSavedNotes((prev) => ({
      ...prev,
      [currentLessonId]: notes,
    }));
    alert("Notes saved successfully!");
    console.log("Notes saved for lesson:", currentLessonId, notes);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between flex-col sm:flex-row">
          <div className="flex mb-2 sm:mb-0 items-center space-x-4 sm:justify-start justify-between sm:w-fit w-full">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2 font-medium sm:inline-block hidden">
                Back to Course Details
              </span>
            </button>
            <div>
              <h1 className="font-semibold text-lg truncate max-w-md">
                {courseData?.title}
              </h1>
              <div className="flex items-center text-sm text-gray-400">
                <span>Progress: 50%</span>
                <div className="w-20 h-2 bg-gray-700 rounded-full ml-2">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `50%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:justify-start justify-center sm:w-fit w-full">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition-colors ${
                showNotes ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowQA(!showQA)}
              className={`p-2 rounded-lg transition-colors ${
                showQA ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Award className="w-5 h-5" />
            </button>

            {/* Mobile-only trigger to open the drawer */}
            <button
              onClick={() => setContentOpen(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors md:hidden"
              aria-label="Open course content"
              title="Course Content"
            >
              <ListVideo className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Lesson Player */}
          <LessonContentPlayer
            showExam={showExam}
            setShowExam={setShowExam}
            modules={modules}
            currentLessonId={currentLessonId}
            handleComplete={handleComplete}
            onLessonSelect={handleLessonSelect}
          />

          {/* Lesson Info */}
          <div className="bg-gray-800 p-6 border-b border-gray-700">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                <span className="text-gray-400">
                  {formatDuration(currentLesson?.duration_hours)}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {currentLesson?.description}
              </p>
            </div>
          </div>

          {/* Tabs */}
          {!showExam && (
            <div className="bg-gray-800 border-b border-gray-700">
              <div className="max-w-5xl mx-auto px-6">
                <div className="whitespace-nowrap flex sm:space-x-8 space-x-8">
                  <button
                    onClick={() => {
                      setShowNotes(true);
                      setShowQA(false);
                      setShowGroups(false);
                    }}
                    className={`flex sm:items-start sm:justify-start gap-1 sm:flex-row items-center flex-col py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showNotes
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <span>📝</span>
                    <span>Lesson Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQA(true);
                      setShowNotes(false);
                      setShowGroups(false);
                    }}
                    className={`flex sm:items-start sm:justify-start gap-1 sm:flex-row items-center flex-col py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showQA
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <span>💬</span>
                    <span>Q&A (2)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowGroups(true);
                      setShowNotes(false);
                      setShowQA(false);
                    }}
                    className={`flex items-center justify-start sm:flex-row flex-col gap-1 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showQA
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <Users size={16} />
                    <span>Groups (2)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {showNotes && !showExam && (
            <NotesSection
              currentLessonId={currentLessonId}
              handleSaveNotes={handleSaveNotes}
              notes={notes}
              savedNotes={savedNotes}
              setNotes={setNotes}
            />
          )}

          {/* Q&A */}
          {showQA && !showExam && (
            <QASection
              newQuestion={newQuestion}
              replyText={replyText}
              replyingTo={replyingTo}
              setNewQuestion={setNewQuestion}
              setReplyText={setReplyText}
              setReplyingTo={setReplyingTo}
            />
          )}

          {/* Groups */}
          {showGroups && !showExam && (
            <div className="bg-gray-800 p-6 min-h-screen"></div>
          )}
        </div>

        {/* Desktop Sidebar (unchanged) */}
        <div className="hidden md:block w-80 bg-white text-gray-900 border-l border-gray-700 overflow-y-auto min-h-screen">
          <CourseContent
            modules={modules}
            currentLessonId={currentLessonId}
            onLessonSelect={handleLessonSelect}
            isEnrolled={true}
          />
        </div>

        {/* Mobile Drawer for Course Content */}
        <div
          className={`md:hidden fixed inset-0 z-40 ${
            contentOpen ? "" : "pointer-events-none"
          }`}
          aria-hidden={!contentOpen}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity ${
              contentOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setContentOpen(false)}
          />

          {/* Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-80 bg-white text-gray-900 border-l border-gray-200 transform transition-transform ${
              contentOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-900">
                Course Content
              </span>
              <button
                onClick={() => setContentOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(100%-48px)] overflow-y-auto">
              <CourseContent
                modules={modules}
                currentLessonId={currentLessonId}
                onLessonSelect={handleLessonSelect}
                isEnrolled={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
