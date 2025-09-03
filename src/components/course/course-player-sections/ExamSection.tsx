import { useState } from "react";

export interface ExamData {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: (
    | {
        id: string;
        question: string;
        type: "multiple-choice";
        options: string[];
        correctAnswer: string;
      }
    | {
        id: string;
        question: string;
        type: "true-false";
        correctAnswer: string;
        options?: undefined;
      }
    | {
        id: string;
        question: string;
        type: "short-answer";
        correctAnswer: string;
        options?: undefined;
      }
  )[];
}

const examData: ExamData = {
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

interface ExamSectionProps {
  setShowExam: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ExamSection({ setShowExam }: ExamSectionProps) {
  const [examAnswers, setExamAnswers] = useState<{ [key: string]: string }>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);

  const handleSubmitExam = () => {
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

  const handleExamAnswer = (questionId: string, answer: string) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const resetExam = () => {
    setExamAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
  };
  return (
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
              {examData.questions.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <h4 className="text-white font-medium mb-4">
                    {index + 1}. {question.question}
                  </h4>

                  {question.type === "multiple-choice" && (
                    <div className="space-y-2">
                      {question.options?.map(
                        (option: any, optionIndex: number) => (
                          <label
                            key={optionIndex}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={examAnswers[question.id] === option}
                              onChange={(e) =>
                                handleExamAnswer(question.id, e.target.value)
                              }
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                            />
                            <span className="ml-3 text-gray-300">{option}</span>
                          </label>
                        )
                      )}
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
                            handleExamAnswer(question.id, e.target.value)
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
                            handleExamAnswer(question.id, e.target.value)
                          }
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-300">False</span>
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
                  Object.keys(examAnswers).length !== examData.questions.length
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
                          (q: any) => examAnswers[q.id] === q.correctAnswer
                        ).length
                      }
                    </div>
                    <div className="text-gray-400">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-lg">
                      {
                        examData.questions.filter(
                          (q: any) => examAnswers[q.id] !== q.correctAnswer
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
  );
}
