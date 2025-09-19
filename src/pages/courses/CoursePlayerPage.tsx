import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  // BookOpen,
  // MessageSquare,
  // Star,
  // Award,
  Users,
  X,
  ListVideo,
  Clock,
} from "lucide-react";
import CourseContent, {
  findNextLessonId,
} from "../../components/course/CourseContent";
import { useCustomQuery } from "../../hooks/useQuery";
import { ACCESS_TOKEN_KEY, API_ENDPOINTS } from "../../utils/constants";
import { useLocation, useNavigate, useParams } from "react-router";
import NotesSection from "../../components/course/course-player-sections/NotesSection";
import QASection from "../../components/course/course-player-sections/QASection";
import LessonContentPlayer from "../../components/course/course-player-sections/LessonContentPlayer";
import { formatDuration } from "../../utils/formatDuration";
import GroupsSection from "../../components/course/course-player-sections/GroupsSection";
import ChatModal from "../../components/course/course-player-sections/ChatModal";
import { useCustomPost } from "../../hooks/useMutation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { readUserFromStorage } from "../../services/auth";
import { getCookie } from "../../services/cookies";

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const currentUser: User = readUserFromStorage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation() as unknown as Location & {
    state?: { assessment?: Exam };
  };
  const { state } = location;
  const search = location.search;

  // read lesson id from query
  const lessonFromQS = useMemo(
    () => new URLSearchParams(search).get("lesson") ?? "",
    [search]
  );
  const assessmentIdFromQS = useMemo(
    () => new URLSearchParams(search).get("assessment"),
    [search]
  );
  const assessmentTypeFromQS = useMemo(
    () => new URLSearchParams(search).get("atype"),
    [search]
  );

  const [currentLessonId, setCurrentLessonId] = useState<string>(lessonFromQS);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(
    undefined
  );
  const [currentAssessmentId, setCurrentAssessmentId] = useState<
    string | undefined
  >(undefined);

  // side panels
  const [showNotes, setShowNotes] = useState(true);
  const [showQA, setShowQA] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [notes, setNotes] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [notesCount, setNotesCount] = useState<number>(0);

  // assessment modal/state
  const [assessment, setAssessment] = useState<Exam | null>(null);

  // mobile drawer
  const [contentOpen, setContentOpen] = useState(false);

  // course + modules
  const { data: courseRes } = useCustomQuery(
    `${API_ENDPOINTS.oldCourses}${courseId}/`,
    ["course", courseId],
    undefined,
    !!courseId
  );

  const isStudent = !!(currentUser && currentUser.is_student);
  const token = getCookie(ACCESS_TOKEN_KEY);

  const { data: modulesData } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    ["modules", courseId],
    {
      headers: {
        ...(isStudent && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    !!courseId
  );

  const { data: enrollmentData } = useCustomQuery(
    `${API_ENDPOINTS.studentEnrollements}${courseId}/`,
    ["student-enrollements", courseId],
    undefined,
    !!courseId
  );

  // Exams: ALWAYS fetch by lesson (your API expects ?lesson=)
  const shouldFetchLessonExams = !!currentLessonId && !state?.assessment;
  const { data: examsForLessonRes } = useCustomQuery(
    shouldFetchLessonExams
      ? `${API_ENDPOINTS.exams}?lesson=${currentLessonId}`
      : "",
    ["exams-by-lesson", currentLessonId],
    undefined,
    shouldFetchLessonExams
  );

  // Questions for Q&A tab (independent)
  const { data: questionsData, isLoading: isQuestionsLoading } = useCustomQuery(
    `${API_ENDPOINTS.questions}?lesson=${currentLessonId}`,
    ["questions", currentLessonId],
    undefined,
    !!currentLessonId
  );

  const questions: Question[] = questionsData?.data ?? [];
  const courseData: Course = courseRes?.data;

  const modules: Module[] = useMemo(
    () => modulesData?.data?.data ?? [],
    [modulesData]
  );

  const enrollStats: EnrolledCourseStats[] = useMemo(
    () => enrollmentData?.data ?? [],
    [enrollmentData]
  );

  const currentEnrollStat: EnrolledCourseStats | null = useMemo(() => {
    return enrollStats?.find((s) => String(s.id) === String(courseId)) ?? null;
  }, [courseId, enrollStats]);

  // Initial lesson selection: prefer QS, else first
  useEffect(() => {
    if (!modules?.length) return;

    const allLessons = modules.flatMap((m) => m?.lessons ?? []);

    if (lessonFromQS) {
      const found = allLessons.find(
        (l) => String(l?.id) === String(lessonFromQS)
      );
      if (found) {
        setCurrentLessonId(String(found.id));
        setCurrentLesson(found);
        return;
      }
    }

    const first = allLessons[0];
    if (!first) return;
    setCurrentLessonId((prev) => (prev ? prev : String(first.id)));
    setCurrentLesson((prev) => prev ?? first);
  }, [modules, lessonFromQS]);

  // keep currentLesson synced
  useEffect(() => {
    if (!currentLessonId || !modules?.length) return;
    const allLessons = modules.flatMap((m) => m?.lessons ?? []);
    const selected = allLessons.find(
      (l) => String(l?.id) === String(currentLessonId)
    );
    if (selected) setCurrentLesson(selected);
  }, [currentLessonId, modules]);

  // Decide which exam to show (prefer state; else from list; else placeholder)
  useEffect(() => {
    // 1) If a full exam was passed via navigation state, use it
    if (state?.assessment) {
      setAssessment(state.assessment);
      setCurrentAssessmentId(String(state.assessment.id));
      return;
    }

    // 2) If assessment id is in QS, try to pick it from the fetched list
    if (assessmentIdFromQS) {
      const list: Exam[] = examsForLessonRes?.data ?? [];
      if (list.length) {
        const chosen =
          list.find((e) => String(e.id) === String(assessmentIdFromQS)) ||
          list[0];
        setAssessment(chosen);
        setCurrentAssessmentId(String(chosen.id));
      } else {
        // while waiting / or empty list — keep a minimal placeholder
        setAssessment(
          (prev) =>
            prev ??
            ({
              id: assessmentIdFromQS,
              type: assessmentTypeFromQS,
              title: "Loading…",
              description: "",
              lesson: currentLessonId,
              time_limit: 0,
              passing_score: 0,
              questions: [],
            } as unknown as Exam)
        );
        setCurrentAssessmentId(String(assessmentIdFromQS));
      }
    } else {
      // no exam in QS → clear
      setAssessment(null);
      setCurrentAssessmentId(undefined);
    }
  }, [
    state,
    assessmentIdFromQS,
    assessmentTypeFromQS,
    examsForLessonRes,
    currentLessonId,
  ]);

  const handleLessonSelect = (lessonId: string) => {
    setAssessment(null);
    setCurrentLessonId(lessonId);
    setContentOpen(false);
    setCurrentAssessmentId(undefined);

    const params = new URLSearchParams(search);
    params.set("lesson", String(lessonId));
    params.delete("assessment");
    params.delete("atype");
    navigate(
      {
        pathname: `/catalog/${courseId}/player`,
        search: `?${params.toString()}`,
      },
      { replace: true }
    );

    const allLessons = modules?.flatMap((m) => m?.lessons ?? []);
    const selectedLesson = allLessons?.find(
      (l) => String(l?.id) === String(lessonId)
    );
    setCurrentLesson(selectedLesson as Lesson);
  };

  const { mutateAsync: createProgress } = useCustomPost(
    API_ENDPOINTS.lessonProgress,
    ["course", courseData?.id]
  );

  const handleAssessmentSubmit = () => {
    // close assessment & clear highlight
    setAssessment(null);
    setCurrentAssessmentId(undefined);

    // advance to next lesson
    const nextId = findNextLessonId(modules, currentLessonId);
    const newLessonId = nextId ?? currentLessonId;
    setCurrentLessonId(String(newLessonId));

    const params = new URLSearchParams(search);
    params.set("lesson", String(newLessonId));
    params.delete("assessment");
    params.delete("atype");
    navigate(
      {
        pathname: `/catalog/${courseId}/player`,
        search: `?${params.toString()}`,
      },
      { replace: true }
    );
  };

  const handleOpenAssessment = (lessonId: string, a: Exam) => {
    setCurrentLessonId(String(lessonId));
    setAssessment(a);
    setContentOpen(false);
    setCurrentAssessmentId(String(a.id)); // IMPORTANT: a.id, not old state

    const params = new URLSearchParams(search);
    params.set("lesson", String(lessonId));
    params.set("assessment", String(a.id));
    if (a.type) params.set("atype", String(a.type));
    navigate(
      {
        pathname: `/catalog/${courseId}/player`,
        search: `?${params.toString()}`,
      },
      { replace: true }
    );
  };

  const handleComplete = async () => {
    try {
      if (!currentLesson?.watched && currentUser?.is_student) {
        const res = await createProgress({
          lesson: currentLessonId,
          watched: true,
        });

        queryClient.invalidateQueries({
          queryKey: ["student-enrollements", courseId],
        });

        queryClient.invalidateQueries({
          queryKey: ["modules", courseId],
        });

        if (res?.status) toast.success("Awesome! Lesson completed.");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Something went wrong.");
    }
  };

  // Groups/chat UI stubs
  const [showChatModal, setShowChatModal] = useState(false);
  const [groupMessage, setGroupMessage] = useState("");
  const [activeChatGroup, setActiveChatGroup] = useState<any>(null);
  const handleJoinGroup = (groupId: string) => {
    console.log(groupId);
  };
  const handleShowChat = (group: any) => {
    setActiveChatGroup(group);
    setShowChatModal(true);
  };
  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setActiveChatGroup(null);
    setGroupMessage("");
  };
  const handleSendGroupMessage = (groupId: string) => {
    if (!groupMessage.trim()) return;
    setGroupMessage("");
    console.log(groupId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between flex-row">
          <div className="flex mb-2 md:mb-0 items-center space-x-4 md:justify-start justify-between md:w-fit w-full">
            <button
              onClick={() => navigate(`/catalog/${courseId}`)}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2 font-medium lg:inline-block hidden">
                Back to Course Details
              </span>
            </button>
            <div className="flex-1">
              <h1 className="font-semibold whitespace-normal text-lg truncate max-w-md">
                {courseRes?.data?.title}
              </h1>
              <div className="flex items-center text-sm text-gray-400">
                <span>
                  Progress: {currentEnrollStat?.progress?.toFixed(0) ?? 0}%
                </span>
                <div className="w-20 h-2 bg-gray-700 rounded-full ml-2">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${currentEnrollStat?.progress?.toFixed(0) ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center space-x-2 sm:justify-start justify-center sm:w-fit w-full"> */}
          <div className="flex items-center justify-end w-fit">
            {/* <button
              onClick={() => setShowNotes((v) => !v)}
              className={`p-2 rounded-lg transition-colors ${
                showNotes ? "bg-purple-600" : "hover:bg-gray-700"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowQA((v) => !v)}
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
            </button> */}

            {/* Mobile syllabus trigger */}
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

      <div className="md:flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <LessonContentPlayer
            modules={modules}
            currentLessonId={currentLessonId}
            handleComplete={handleComplete}
            onLessonSelect={handleLessonSelect}
            assessment={assessment}
            setAssessment={setAssessment}
            onAssessmentSubmit={handleAssessmentSubmit}
          />

          {/* Lesson Info */}
          {currentLesson && (
            <div className="bg-gray-800 p-6 border-b border-gray-700">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between gap-2 md:gap-4 mb-4">
                  <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
                  <span className="text-gray-400 flex items-center justify-start">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(currentLesson?.duration_hours)}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {currentLesson?.description}
                </p>
              </div>
            </div>
          )}

          {/* Tabs (hidden while an assessment is open) */}
          {!assessment && (
            <div className="bg-gray-800 border-b border-gray-700">
              <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-3 items-center justify-items-center whitespace-nowrap">
                  <button
                    onClick={() => {
                      setShowNotes(true);
                      setShowQA(false);
                      setShowGroups(false);
                    }}
                    className={`flex sm:items-start sm:justify-start gap-1 sm:flex-row items-center flex-col py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                      showNotes
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <span>📝</span>
                    <span>Lesson Notes ({notesCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowQA(true);
                      setShowNotes(false);
                      setShowGroups(false);
                    }}
                    className={`flex sm:items-start sm:justify-start gap-1 sm:flex-row items-center flex-col py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                      showQA
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    <span>💬</span>
                    <span>Q&A ({questions?.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowGroups(true);
                      setShowNotes(false);
                      setShowQA(false);
                    }}
                    className={`flex items-center justify-start sm:flex-row flex-col gap-1 py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                      showGroups
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
          {showNotes && !assessment && (
            <NotesSection
              currentLessonId={currentLessonId}
              notes={notes}
              setNotes={setNotes}
              title={noteTitle}
              setTitle={setNoteTitle}
              setNotesCount={setNotesCount}
            />
          )}

          {/* Q&A */}
          {showQA && !assessment && (
            <QASection
              lesson={currentLessonId}
              questions={questions}
              isLoading={isQuestionsLoading}
            />
          )}

          {/* Groups */}
          {showGroups && !assessment && (
            <GroupsSection
              handleJoinGroup={handleJoinGroup}
              handleShowChat={handleShowChat}
            />
          )}
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block md:w-80 md:shrink-0">
          <div className="sticky top-0 h-screen w-80 bg-white text-gray-900 border-l border-gray-200">
            <div className="h-full overflow-y-auto">
              <CourseContent
                modules={modules}
                currentAssessmentId={currentAssessmentId}
                currentLessonId={currentLessonId}
                onLessonSelect={handleLessonSelect}
                isEnrolled={true}
                onOpenAssessment={handleOpenAssessment}
              />
            </div>
          </div>
        </aside>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden fixed inset-0 z-40 ${
            contentOpen ? "" : "pointer-events-none"
          }`}
          aria-hidden={!contentOpen}
        >
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity ${
              contentOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setContentOpen(false)}
          />
          <div
            className={`absolute right-0 top-0 h-full w-64 bg-white text-gray-900 border-l border-gray-200
              transform transition-transform ${
                contentOpen ? "translate-x-0" : "translate-x-full"
              } flex flex-col min-h-0`}
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
                currentAssessmentId={currentAssessmentId}
                currentLessonId={currentLessonId}
                onLessonSelect={handleLessonSelect}
                isEnrolled={true}
                onOpenAssessment={handleOpenAssessment}
              />
            </div>
          </div>
        </div>
      </div>

      {showChatModal && activeChatGroup && (
        <ChatModal
          activeChatGroup={activeChatGroup}
          groupMessage={groupMessage}
          handleCloseChatModal={handleCloseChatModal}
          handleSendGroupMessage={handleSendGroupMessage}
          setGroupMessage={setGroupMessage}
        />
      )}
    </div>
  );
}
