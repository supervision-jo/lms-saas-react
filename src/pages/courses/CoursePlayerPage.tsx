import React, { useState } from "react";
import {
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Star,
  Send,
  Award,
  FileText,
  Download,
  Heart,
  ThumbsUp,
  Reply,
} from "lucide-react";
import VideoPlayer from "../../components/reusable-components/VideoPlayer";
import CourseContent from "../../components/course/CourseContent";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";
import { useParams } from "react-router";

const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams();
  const [currentLessonId, setCurrentLessonId] = useState("1");
  const [showNotes, setShowNotes] = useState(true);
  const [showQA, setShowQA] = useState(false);
  const [notes, setNotes] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [qaData, setQaData] = useState([
    {
      id: "1",
      student: "Sarah Johnson",
      studentImage:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
      question: "What is the difference between React and Angular?",
      timestamp: "5:30",
      date: "Jan 15, 2024",
      fullTimestamp: "Jan 15, 2024 at 5:30 PM",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: "1",
          author: "John Doe",
          authorImage:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
          isInstructor: true,
          content:
            'Great question! React is a library focused on building UI components, while Angular is a full framework with more built-in features like routing, forms, and HTTP client. You can learn more about React at <a href="https://reactjs.org" target="_blank" class="text-purple-600 hover:text-purple-800 underline">reactjs.org</a> and Angular at <a href="https://angular.io" target="_blank" class="text-purple-600 hover:text-purple-800 underline">angular.io</a>.',
          timestamp: "2 hours ago",
          date: "Jan 15, 2024",
          likes: 8,
          isLiked: true,
        },
      ],
    },
    {
      id: "2",
      student: "Mike Chen",
      studentImage:
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      question: "Can you explain JSX in more detail?",
      timestamp: "8:15",
      date: "Jan 15, 2024",
      fullTimestamp: "Jan 15, 2024 at 8:15 PM",
      likes: 7,
      isLiked: true,
      replies: [
        {
          id: "2",
          author: "John Doe",
          authorImage:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
          isInstructor: true,
          content:
            'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files. It gets compiled to regular JavaScript function calls. Check out the official JSX documentation at <a href="https://reactjs.org/docs/introducing-jsx.html" target="_blank" class="text-purple-600 hover:text-purple-800 underline">React JSX Guide</a> for more details.',
          timestamp: "1 hour ago",
          date: "Jan 15, 2024",
          likes: 5,
          isLiked: false,
        },
      ],
    },
  ]);
  const [examAnswers, setExamAnswers] = useState<{ [key: string]: string }>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savedNotes, setSavedNotes] = useState<{ [key: string]: string }>({});
  const [showExam, setShowExam] = useState(false);

  const courseData = {
    title: "Complete React Developer Course with Redux, Hooks, and GraphQL",
    progress: 35,
  };

  const currentLesson = {
    id: "1",
    title: "What is React?",
    videoUrl:
      "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    description:
      "In this lesson, we will explore what React is and why it has become one of the most popular JavaScript libraries for building user interfaces.",
    duration: "15:30",
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      dateTime: now.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const examData = {
    id: "1",
    title: "Module 1 Final Exam",
    description: "Test your knowledge of React fundamentals",
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        id: "1",
        question: "What is React?",
        type: "multiple-choice" as const,
        options: [
          "A JavaScript library for building user interfaces",
          "A database management system",
          "A web server framework",
          "A CSS preprocessor",
        ],
        correctAnswer: "A JavaScript library for building user interfaces",
      },
      {
        id: "2",
        question: "JSX stands for JavaScript XML.",
        type: "true-false" as const,
        correctAnswer: "true",
      },
      {
        id: "3",
        question:
          "Which hook is used for managing state in functional components?",
        type: "multiple-choice" as const,
        options: ["useEffect", "useState", "useContext", "useReducer"],
        correctAnswer: "useState",
      },
      {
        id: "4",
        question: "What is the main benefit of using React components?",
        type: "short-answer" as const,
        correctAnswer: "Reusability and modularity",
      },
      {
        id: "5",
        question: "React components must return a single parent element.",
        type: "true-false" as const,
        correctAnswer: "false",
      },
    ],
  };

  const { data: modulesData } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    ["modules", courseId],
    undefined,
    !!courseId
  );

  const modules: Module[] = modulesData?.data?.data ?? [];

  const handleLessonSelect = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    // Load saved notes for the new lesson
    setNotes(savedNotes[lessonId] || "");
    // Reset reply state when switching lessons
    setReplyingTo(null);
    setReplyText("");

    // Handle different lesson types
    const allLessons = modules.flatMap((m) => m.lessons);
    const selectedLesson = allLessons.find((l) => l.id === lessonId);

    if (selectedLesson?.content_type === "exam") {
      setShowExam(true);
      setShowNotes(false);
      setShowQA(false);
    } else {
      setShowExam(false);
    }

    console.log("Playing lesson:", lessonId);
  };

  const handleProgress = (progress: number) => {
    console.log("Video progress:", progress);
  };

  const handleComplete = () => {
    console.log("Lesson completed");
  };

  const handleSaveNotes = () => {
    // Save notes for current lesson
    setSavedNotes((prev) => ({
      ...prev,
      [currentLessonId]: notes,
    }));

    // Show success message (you could add a toast notification here)
    alert("Notes saved successfully!");
    console.log("Notes saved for lesson:", currentLessonId, notes);
  };

  const handleAskQuestion = () => {
    if (newQuestion.trim()) {
      const currentTime = getCurrentDateTime();
      const newQA = {
        id: Date.now().toString(),
        student: "You", // Current user
        studentImage:
          "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100", // Provide a default or current user's image
        question: newQuestion,
        timestamp: currentTime.time,
        date: currentTime.date,
        fullTimestamp: `${currentTime.date} at ${currentTime.time}`,
        likes: 0,
        isLiked: false,
        replies: [],
      };

      setQaData((prev) => [newQA, ...prev]);
      setNewQuestion("");
      console.log("New question added:", newQA);
    }
  };

  const handleReply = (questionId: string) => {
    if (replyText.trim()) {
      const currentTime = getCurrentDateTime();
      const newReply = {
        id: Date.now().toString(),
        author: "You", // Current user
        authorImage:
          "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100",
        isInstructor: false,
        content: replyText,
        timestamp: "just now",
        date: currentTime.date,
        likes: 0,
        isLiked: false,
      };

      setQaData((prev) =>
        prev.map((qa) =>
          qa.id === questionId
            ? { ...qa, replies: [...qa.replies, newReply] }
            : qa
        )
      );

      setReplyText("");
      setReplyingTo(null);
      console.log("Reply added to question:", questionId, newReply);
    }
  };

  const handleExamAnswer = (questionId: string, answer: string) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = () => {
    // Calculate score
    let correct = 0;
    examData.questions.forEach((question) => {
      if (examAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    const score = Math.round((correct / examData.questions.length) * 100);
    setExamScore(score);
    setExamSubmitted(true);
  };

  const resetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
  };

  const handleLikeQuestion = (questionId: string) => {
    setQaData((prev) =>
      prev.map((qa) =>
        qa.id === questionId
          ? {
              ...qa,
              isLiked: !qa.isLiked,
              likes: qa.isLiked ? qa.likes - 1 : qa.likes + 1,
            }
          : qa
      )
    );
  };

  const handleLikeReply = (questionId: string, replyId: string) => {
    setQaData((prev) =>
      prev.map((qa) =>
        qa.id === questionId
          ? {
              ...qa,
              replies: qa.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    }
                  : reply
              ),
            }
          : qa
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2 font-medium">Back to Course Details</span>
            </button>
            <div>
              <h1 className="font-semibold text-lg truncate max-w-md">
                {courseData.title}
              </h1>
              <div className="flex items-center text-sm text-gray-400">
                <span>Progress: {courseData.progress}%</span>
                <div className="w-20 h-2 bg-gray-700 rounded-full ml-2">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${courseData.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
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
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 p-4">
            <div className="max-w-5xl mx-auto">
              {(() => {
                const allLessons = modules.flatMap((m) => m.lessons);
                const currentLessonData = allLessons.find(
                  (l) => l.id === currentLessonId
                );

                if (currentLessonData?.content_type === "article") {
                  return (
                    <div className="bg-white rounded-lg p-8 shadow-lg">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                              {currentLessonData.title}
                            </h1>
                            <p className="text-gray-600 mt-1">
                              Reading time: {currentLessonData.duration_hours}
                            </p>
                          </div>
                        </div>

                        <div className="prose prose-lg max-w-none">
                          <h2>Introduction to React Fundamentals</h2>
                          <p>
                            React is a powerful JavaScript library for building
                            user interfaces, particularly web applications. It
                            was created by Facebook and has become one of the
                            most popular tools for front-end development.
                          </p>

                          <h3>Key Concepts</h3>
                          <ul>
                            <li>
                              <strong>Components:</strong> The building blocks
                              of React applications
                            </li>
                            <li>
                              <strong>JSX:</strong> A syntax extension that
                              allows you to write HTML-like code in JavaScript
                            </li>
                            <li>
                              <strong>Props:</strong> Properties passed to
                              components
                            </li>
                            <li>
                              <strong>State:</strong> Data that changes over
                              time in your component
                            </li>
                          </ul>

                          <h3>Why Choose React?</h3>
                          <p>React offers several advantages:</p>
                          <ol>
                            <li>
                              Component-based architecture for reusable code
                            </li>
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
                                  <strong>Pro Tip:</strong> Practice building
                                  small components as you learn. Start with
                                  simple elements like buttons and cards before
                                  moving to complex features.
                                </p>
                              </div>
                            </div>
                          </div>

                          <h3>Next Steps</h3>
                          <p>
                            In the following lessons, we'll dive deeper into
                            each of these concepts and start building real React
                            applications. Make sure you have your development
                            environment set up before proceeding.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else if (currentLessonData?.content_type === "quiz") {
                  return (
                    <div className="bg-white rounded-lg p-8 shadow-lg">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                ?
                              </span>
                            </div>
                          </div>
                          <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                              {currentLessonData.title}
                            </h1>
                            <p className="text-gray-600 mt-1">
                              Quick assessment •{" "}
                              {currentLessonData.duration_hours}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-green-800 mb-3">
                              Question 1 of 3
                            </h3>
                            <p className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                              What does JSX stand for?
                            </p>
                            <div className="space-y-2">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q1"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  JavaScript XML
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q1"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  JavaScript Extension
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q1"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  Java Syntax Extension
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                              Question 2 of 3
                            </h3>
                            <p className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                              React components must return a single parent
                              element.
                            </p>
                            <div className="space-y-2">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q2"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  True
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q2"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  False
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                              Question 3 of 3
                            </h3>
                            <p className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                              Which company created React?
                            </p>
                            <div className="space-y-2">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q3"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  Google
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q3"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  Facebook (Meta)
                                </span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="q3"
                                  className="h-5 w-5 text-green-600"
                                />
                                <span className="ml-4 text-base font-medium text-gray-700">
                                  Microsoft
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4">
                            <div className="text-base font-medium text-gray-600">
                              Progress: 0/3 questions answered
                            </div>
                            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base">
                              Submit Quiz
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (currentLessonData?.content_type === "material") {
                  return (
                    <div className="bg-white rounded-lg p-8 shadow-lg">
                      <div className="max-w-4xl mx-auto text-center">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Download className="w-10 h-10 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {currentLessonData.title}
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
                              <strong>Note:</strong> Make sure to extract the
                              files to your preferred development folder before
                              starting the exercises.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <VideoPlayer
                      videoUrl={currentLesson.videoUrl}
                      title={currentLesson.title}
                      onProgress={handleProgress}
                      onComplete={handleComplete}
                    />
                  );
                }
              })()}
            </div>
          </div>

          {/* Lesson Info */}
          <div className="bg-gray-800 p-6 border-b border-gray-700">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                <span className="text-gray-400">{currentLesson.duration}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {currentLesson.description}
              </p>
            </div>
          </div>

          {/* Tabs for Notes and Q&A */}
          {!showExam && (
            <div className="bg-gray-800 border-b border-gray-700">
              <div className="max-w-5xl mx-auto px-6">
                <div className="flex space-x-8">
                  <button
                    onClick={() => {
                      setShowNotes(true);
                      setShowQA(false);
                    }}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showNotes
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    📝 Lesson Notes
                  </button>
                  <button
                    onClick={() => {
                      setShowQA(true);
                      setShowNotes(false);
                    }}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      showQA
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    💬 Q&A ({qaData.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Section */}
          {showNotes && !showExam && (
            <div className="bg-gray-800 p-6 border-b border-gray-700">
              <div className="max-w-5xl mx-auto">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Lesson Notes
                    </h3>
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                  <textarea
                    placeholder="Take notes while watching..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-40 p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                  {savedNotes[currentLessonId] && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ Notes saved for this lesson
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Exam Section */}
          {showExam && (
            <div className="bg-gray-800 p-6">
              <div className="max-w-4xl mx-auto">
                {!examSubmitted ? (
                  <div className="bg-gray-900 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {examData.title}
                        </h3>
                        <p className="text-gray-300">{examData.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          Time Limit: {examData.timeLimit} minutes
                        </div>
                        <div className="text-gray-400 text-sm">
                          Passing Score: {examData.passingScore}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {examData.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                        >
                          <h4 className="text-white font-medium mb-4">
                            {index + 1}. {question.question}
                          </h4>

                          {question.type === "multiple-choice" && (
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <label
                                  key={optionIndex}
                                  className="flex items-center cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={
                                      examAnswers[question.id] === option
                                    }
                                    onChange={(e) =>
                                      handleExamAnswer(
                                        question.id,
                                        e.target.value
                                      )
                                    }
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                  />
                                  <span className="ml-3 text-gray-300">
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {question.type === "true-false" && (
                            <div className="space-y-2">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value="true"
                                  checked={examAnswers[question.id] === "true"}
                                  onChange={(e) =>
                                    handleExamAnswer(
                                      question.id,
                                      e.target.value
                                    )
                                  }
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-300">True</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value="false"
                                  checked={examAnswers[question.id] === "false"}
                                  onChange={(e) =>
                                    handleExamAnswer(
                                      question.id,
                                      e.target.value
                                    )
                                  }
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-300">
                                  False
                                </span>
                              </label>
                            </div>
                          )}

                          {question.type === "short-answer" && (
                            <textarea
                              value={examAnswers[question.id] || ""}
                              onChange={(e) =>
                                handleExamAnswer(question.id, e.target.value)
                              }
                              placeholder="Type your answer here..."
                              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows={3}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-gray-400">
                        Questions answered: {Object.keys(examAnswers).length} /{" "}
                        {examData.questions.length}
                      </div>
                      <button
                        onClick={handleSubmitExam}
                        disabled={
                          Object.keys(examAnswers).length !==
                          examData.questions.length
                        }
                        className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Submit Exam
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-lg p-8 text-center">
                    <div
                      className={`text-6xl mb-4 ${
                        examScore! >= examData.passingScore
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {examScore! >= examData.passingScore ? "🎉" : "😞"}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {examScore! >= examData.passingScore
                        ? "Congratulations!"
                        : "Try Again"}
                    </h3>
                    <p className="text-xl text-gray-300 mb-6">
                      Your Score:{" "}
                      <span
                        className={`font-bold ${
                          examScore! >= examData.passingScore
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {examScore}%
                      </span>
                    </p>
                    <p className="text-gray-400 mb-8">
                      {examScore! >= examData.passingScore
                        ? `You passed! You need ${examData.passingScore}% to pass.`
                        : `You need ${examData.passingScore}% to pass. You can retake this exam.`}
                    </p>

                    <div className="space-y-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-3">
                          Results Breakdown:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-green-400 font-bold text-lg">
                              {
                                examData.questions.filter(
                                  (q) => examAnswers[q.id] === q.correctAnswer
                                ).length
                              }
                            </div>
                            <div className="text-gray-400">Correct</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-400 font-bold text-lg">
                              {
                                examData.questions.filter(
                                  (q) => examAnswers[q.id] !== q.correctAnswer
                                ).length
                              }
                            </div>
                            <div className="text-gray-400">Incorrect</div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-bold text-lg">
                              {examData.questions.length}
                            </div>
                            <div className="text-gray-400">Total</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={resetExam}
                          className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Retake Exam
                        </button>
                        <button
                          onClick={() => setShowExam(false)}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Q&A Section */}
          {showQA && !showExam && (
            <div className="bg-gray-800 p-6 min-h-screen">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Questions List */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Questions & Answers
                    </h3>
                    <div className="space-y-4">
                      {qaData.map((qa) => (
                        <div
                          key={qa.id}
                          className="bg-gray-900 rounded-lg p-5 border border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  qa.studentImage ??
                                  "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                                }
                                alt={qa.student}
                                className="w-8 h-8 rounded-full object-cover border-2 border-purple-500"
                              />
                              <div>
                                <h4 className="font-medium text-white hover:text-purple-300 cursor-pointer transition-colors">
                                  {qa.student}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  {qa.fullTimestamp ||
                                    `${qa.date} at ${qa.timestamp}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-300 mb-4 ml-11 leading-relaxed">
                            <p>{qa.question}</p>
                          </div>

                          {/* Question Actions */}
                          <div className="ml-11 mb-4 flex items-center space-x-4">
                            <button
                              onClick={() => handleLikeQuestion(qa.id)}
                              className={`flex items-center space-x-1 text-sm transition-colors ${
                                qa.isLiked
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-gray-400 hover:text-red-400"
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  qa.isLiked ? "fill-current" : ""
                                }`}
                              />
                              <span>{qa.likes}</span>
                            </button>
                            <button
                              onClick={() => setReplyingTo(qa.id)}
                              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-purple-400 transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              <span>Reply</span>
                            </button>
                          </div>

                          {/* Replies */}
                          <div className="ml-11 space-y-3">
                            {qa.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src={
                                        reply.authorImage ??
                                        "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                                      }
                                      alt={reply.author}
                                      className="w-6 h-6 rounded-full object-cover border border-gray-500"
                                    />
                                    <span className="font-medium text-white hover:text-purple-300 cursor-pointer transition-colors">
                                      {reply.author}
                                    </span>
                                    {reply.isInstructor && (
                                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium">
                                        Instructor
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {reply.timestamp}
                                  </span>
                                </div>
                                <div
                                  className="text-gray-300 text-sm leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: reply.content,
                                  }}
                                />

                                {/* Reply Actions */}
                                <div className="flex items-center space-x-4 mt-3">
                                  <button
                                    onClick={() =>
                                      handleLikeReply(qa.id, reply.id)
                                    }
                                    className={`flex items-center space-x-1 text-xs transition-colors ${
                                      reply.isLiked
                                        ? "text-blue-400 hover:text-blue-300"
                                        : "text-gray-400 hover:text-blue-400"
                                    }`}
                                  >
                                    <ThumbsUp
                                      className={`w-3 h-3 ${
                                        reply.isLiked ? "fill-current" : ""
                                      }`}
                                    />
                                    <span>{reply.likes}</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reply Section */}
                          <div className="mt-4 ml-11">
                            {replyingTo === qa.id && (
                              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                                <div className="flex items-center mb-3">
                                  <img
                                    src="https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100"
                                    alt="You"
                                    className="w-6 h-6 rounded-full object-cover border border-gray-500 mr-2"
                                  />
                                  <span className="text-sm text-gray-300">
                                    Replying to {qa.student}
                                  </span>
                                </div>
                                <textarea
                                  placeholder="Write your reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <div className="flex justify-end space-x-3 mt-3">
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(qa.id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ask Question */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-900 rounded-lg p-5 sticky top-4 border border-gray-700">
                      <h4 className="font-medium text-white mb-3">
                        Ask a Question
                      </h4>
                      <textarea
                        placeholder="Type your question here..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                      />
                      <button
                        onClick={handleAskQuestion}
                        className="w-full mt-3 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Ask Question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white text-gray-900 border-l border-gray-700 overflow-y-auto min-h-screen">
          <CourseContent
            modules={modules}
            currentLessonId={currentLessonId}
            onLessonSelect={handleLessonSelect}
            isEnrolled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
