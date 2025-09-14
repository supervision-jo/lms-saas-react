import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  RotateCcw,
  XCircle,
} from "lucide-react";

/** Accepts either builder shape or API shape:
 * Question text: question | text | title
 * Options: options[] | choices[]
 * Option correctness: isCorrect | is_correct
 * Question type: question_type | type  (mcq | short_answer)
 * Short answer key: answer | correct_answer
 */

type RawAnswer = {
  id?: string;
  text?: string;
  label?: string;
  isCorrect?: boolean;
  is_correct?: boolean;
};

type RawQuestion = {
  id?: string;
  question?: string;
  text?: string;
  title?: string;
  explanation?: string;
  points?: number;
  point?: number;
  score?: number;
  timeLimit?: number;
  question_type?: string;
  type?: string;
  options?: RawAnswer[];
  choices?: RawAnswer[];
  answer?: string;
  correct_answer?: string;
};

type RawQuiz = {
  id?: string;
  title?: string;
  description?: string;
  questions?: RawQuestion[];
  totalPoints?: number;
  totalTimeLimit?: number;
};

interface QuizPreviewProps {
  quiz: RawQuiz;
  onClose: () => void;
  onEdit: () => void;
}

type SAnswer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type SQuestion = {
  id: string;
  question: string;
  explanation: string;
  points: number;
  type: "mcq" | "short_answer" | string;
  options: SAnswer[];
  answer?: string; // for short_answer
};

type SQuiz = {
  id: string;
  title: string;
  description: string;
  totalTimeLimit: number;
  totalPoints: number; // <-- we store and use this, removing the ESLint warning
  questions: SQuestion[];
};

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz, onClose, onEdit }) => {
  const safeQuiz: SQuiz = useMemo(() => {
    const qRaw = Array.isArray(quiz?.questions) ? quiz.questions! : [];

    const questions: SQuestion[] = qRaw.map((q, qi) => {
      const qid = q.id ?? `q-${qi}`;
      const qtype = (q.question_type ?? q.type ?? "mcq")
        .toString()
        .toLowerCase();

      const optsRaw = Array.isArray(q.options)
        ? q.options!
        : Array.isArray(q.choices)
        ? q.choices!
        : [];
      const options: SAnswer[] = optsRaw.map((o, oi) => ({
        id: o.id ?? `q-${qid}-o-${oi}`,
        text: (o.text ?? o.label ?? "").toString(),
        isCorrect: Boolean(o.isCorrect ?? o.is_correct ?? false),
      }));

      return {
        id: qid,
        type: (qtype.includes("short")
          ? "short_answer"
          : qtype) as SQuestion["type"],
        question: (
          q.question ??
          q.text ??
          q.title ??
          `Question ${qi + 1}`
        ).toString(),
        explanation: (q.explanation ?? "").toString(),
        points: Number(
          typeof q.points === "number"
            ? q.points
            : typeof q.point === "number"
            ? q.point
            : typeof q.score === "number"
            ? q.score
            : 1
        ),
        options,
        answer: (q.answer ?? q.correct_answer ?? "").toString(),
      };
    });

    const totalPoints =
      typeof quiz.totalPoints === "number"
        ? quiz.totalPoints
        : questions.reduce(
            (s, q) => s + (Number.isFinite(q.points) ? q.points : 0),
            0
          );

    return {
      id: quiz.id ?? "",
      title: quiz.title ?? "Quiz",
      description: quiz.description ?? "",
      totalTimeLimit: Number(quiz.totalTimeLimit ?? 0),
      totalPoints, // <-- used later
      questions,
    };
  }, [quiz]);

  const hasQuestions = safeQuiz.questions.length > 0;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(safeQuiz.totalTimeLimit || 0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Multiple-choice answers: Set of option ids per question id
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, Set<string>>
  >({});
  // Short-answer: free text per question id
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});

  const currentQuestion: SQuestion | undefined = hasQuestions
    ? safeQuiz.questions[currentQuestionIndex]
    : undefined;

  // --- Timer
  useEffect(() => {
    if (safeQuiz.totalTimeLimit && timeLeft > 0 && !showResults) {
      const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
      return () => clearTimeout(t);
    } else if (safeQuiz.totalTimeLimit && timeLeft === 0 && !showResults) {
      setIsTimeUp(true);
      setShowResults(true);
    }
  }, [timeLeft, showResults, safeQuiz.totalTimeLimit]);

  // --- Actions
  const goToQuestion = (i: number) => {
    if (!hasQuestions) return;
    if (i >= 0 && i < safeQuiz.questions.length) setCurrentQuestionIndex(i);
  };

  const toggleOption = (qid: string, oid: string) => {
    if (showResults || isTimeUp) return;
    setSelectedAnswers((prev) => {
      const cur = prev[qid] ?? new Set<string>();
      const next = new Set(cur);
      if (next.has(oid)) {
        next.delete(oid);
      } else {
        next.add(oid);
      }

      return { ...prev, [qid]: next };
    });
  };

  const handleShortAnswer = (qid: string, value: string) => {
    if (showResults || isTimeUp) return;
    setTextAnswers((p) => ({ ...p, [qid]: value }));
  };

  const handleSubmit = () => setShowResults(true);

  const handleReset = () => {
    setSelectedAnswers({});
    setTextAnswers({});
    setShowResults(false);
    setIsTimeUp(false);
    setTimeLeft(safeQuiz.totalTimeLimit || 0);
    setCurrentQuestionIndex(0);
  };

  // --- Results
  const { totalScore, maxScore, questionResults } = useMemo(() => {
    if (!showResults)
      return {
        totalScore: 0,
        maxScore: 0,
        questionResults: {} as Record<string, boolean>,
      };

    let total = 0;
    const qres: Record<string, boolean> = {};
    const max = safeQuiz.totalPoints; // <-- use the normalized total points

    safeQuiz.questions.forEach((q) => {
      if (q.type === "short_answer") {
        const given = (textAnswers[q.id] ?? "").trim().toLowerCase();
        const correct = (q.answer ?? "").trim().toLowerCase();
        const ok = !!correct && given.length > 0 && given === correct;
        qres[q.id] = ok;
        if (ok) total += q.points;
        return;
      }

      // mcq
      const user = selectedAnswers[q.id] ?? new Set<string>();
      const correctOpts = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const sameSize = user.size === correctOpts.length;
      const allMatch = sameSize && correctOpts.every((id) => user.has(id));
      qres[q.id] = allMatch;
      if (allMatch) total += q.points;
    });

    return { totalScore: total, maxScore: max, questionResults: qres };
  }, [
    safeQuiz.questions,
    safeQuiz.totalPoints,
    selectedAnswers,
    textAnswers,
    showResults,
  ]);

  // --- UI helpers
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const getQuestionStatus = (idx: number) => {
    const q = safeQuiz.questions[idx];
    const answered =
      q.type === "short_answer"
        ? !!(textAnswers[q.id] ?? "").trim()
        : (selectedAnswers[q.id]?.size ?? 0) > 0;

    if (showResults) return questionResults[q.id] ? "correct" : "incorrect";
    if (idx === currentQuestionIndex) return "current";
    return answered ? "answered" : "unanswered";
  };

  // --- Render
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {safeQuiz.title}
              </h2>
              {!!quiz.description && (
                <p className="text-gray-600 mt-1">{quiz.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {safeQuiz.questions.length} question
                {safeQuiz.questions.length !== 1 ? "s" : ""} •{" "}
                {safeQuiz.totalPoints} total point
                {safeQuiz.totalPoints !== 1 ? "s" : ""}
              </p>
            </div>

            {!!safeQuiz.totalTimeLimit && (
              <div
                className={`flex items-center px-4 py-2 rounded-lg ${
                  timeLeft <= 60 && !showResults
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-semibold">
                  {showResults ? "Completed" : formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="space-y-2">
              {safeQuiz.questions.map((q, index) => {
                const status = getQuestionStatus(index);
                let statusClass = "bg-white border-gray-200 text-gray-700";
                if (status === "current")
                  statusClass =
                    "bg-purple-100 border-purple-300 text-purple-700";
                else if (status === "answered")
                  statusClass = "bg-blue-100 border-blue-300 text-blue-700";
                else if (status === "correct")
                  statusClass = "bg-green-100 border-green-300 text-green-700";
                else if (status === "incorrect")
                  statusClass = "bg-red-100 border-red-300 text-red-700";

                return (
                  <button
                    key={q.id}
                    onClick={() => !showResults && goToQuestion(index)}
                    disabled={showResults}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${statusClass} ${
                      showResults ? "cursor-default" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Q{index + 1}</span>
                      <div className="flex items-center">
                        {status === "correct" && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {status === "incorrect" && (
                          <XCircle className="w-4 h-4" />
                        )}
                        {status === "answered" && !showResults && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs mt-1 opacity-75">
                      {q.points} point{q.points !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResults && (
              <div className="mt-6 p-4 bg-white rounded-lg border">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Final Score
                </h4>
                <div className="text-2xl font-bold text-purple-600">
                  {totalScore}/{maxScore}
                </div>
                <div className="text-sm text-gray-600">
                  {maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="flex-1 p-6">
            {!showResults ? (
              !hasQuestions ? (
                <div className="p-8 text-center text-gray-600">
                  <p className="mb-2 font-semibold">No questions yet</p>
                  <p>Add at least one question to preview this quiz.</p>
                </div>
              ) : (
                <>
                  {/* Question */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Question {currentQuestionIndex + 1} of{" "}
                        {safeQuiz.questions.length}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {currentQuestion!.points} point
                        {currentQuestion!.points !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <p className="text-lg text-gray-900">
                        {currentQuestion!.question || "Untitled question"}
                      </p>
                    </div>

                    {isTimeUp && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">
                          Time's up! Your answers have been submitted
                          automatically.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Answers */}
                  {currentQuestion!.type === "short_answer" ? (
                    <div className="mb-8">
                      <input
                        type="text"
                        value={textAnswers[currentQuestion!.id] ?? ""}
                        onChange={(e) =>
                          handleShortAnswer(currentQuestion!.id, e.target.value)
                        }
                        placeholder="Type your answer…"
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                      />
                      {!!currentQuestion!.answer && (
                        <p className="text-xs text-gray-500 mt-2">
                          Correct answer is configured (hidden during attempt).
                        </p>
                      )}
                    </div>
                  ) : (currentQuestion!.options ?? []).length > 0 ? (
                    <div className="space-y-3 mb-8">
                      {currentQuestion!.options.map((opt, idx) => {
                        const qid = currentQuestion!.id;
                        const isSelected =
                          selectedAnswers[qid]?.has(opt.id) || false;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => toggleOption(qid, opt.id)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-25"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="flex items-center mr-4">
                                <span className="text-sm font-medium text-gray-500 mr-3">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "border-purple-500 bg-purple-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                              </div>
                              <span className="text-gray-900 flex-1">
                                {opt.text || "(empty option)"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mb-8 p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 text-yellow-800">
                      No options configured for this question.
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={() => goToQuestion(currentQuestionIndex - 1)}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        currentQuestionIndex === 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </button>

                    <div className="flex space-x-3">
                      {currentQuestionIndex ===
                      safeQuiz.questions.length - 1 ? (
                        <button
                          onClick={handleSubmit}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        >
                          Submit Quiz
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      ) : (
                        <button
                          onClick={() => goToQuestion(currentQuestionIndex + 1)}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        >
                          Next Question
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )
            ) : (
              // Results
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Quiz Complete!
                  </h3>
                  <div
                    className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold ${
                      totalScore === maxScore
                        ? "bg-green-100 text-green-800"
                        : totalScore >= maxScore * 0.7
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Final Score: {totalScore}/{maxScore} (
                    {maxScore ? Math.round((totalScore / maxScore) * 100) : 0}%)
                  </div>
                </div>

                <div className="space-y-6">
                  {safeQuiz.questions.map((q, qi) => {
                    const isCorrect = questionResults[q.id];
                    return (
                      <div
                        key={q.id}
                        className={`border-2 rounded-lg p-6 ${
                          isCorrect
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Question {qi + 1}:{" "}
                            {q.question || "Untitled question"}
                          </h4>
                          <div className="flex items-center">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mr-2" />
                            )}
                            <span
                              className={`font-semibold ${
                                isCorrect ? "text-green-800" : "text-red-800"
                              }`}
                            >
                              {isCorrect ? q.points : 0}/{q.points} pts
                            </span>
                          </div>
                        </div>

                        {q.type === "short_answer" ? (
                          <div className="space-y-2 mb-4">
                            <div className="p-3 rounded border-2 bg-white">
                              <div className="text-sm text-gray-500 mb-1">
                                Your answer
                              </div>
                              <div className="text-gray-900">
                                {textAnswers[q.id] ?? ""}
                              </div>
                            </div>
                            {!!q.answer && (
                              <div className="p-3 rounded border-2 bg-green-50 border-green-200">
                                <div className="text-sm text-green-800">
                                  Correct:{" "}
                                  <span className="font-semibold">
                                    {q.answer}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {q.options.map((opt, oi) => {
                              const userSel =
                                selectedAnswers[q.id]?.has(opt.id) ?? false;
                              const correct = opt.isCorrect;
                              let klass = "border-gray-200 bg-white";
                              if (correct)
                                klass = "border-green-500 bg-green-100";
                              else if (userSel && !correct)
                                klass = "border-red-500 bg-red-100";
                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded border-2 ${klass}`}
                                >
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-500 mr-3">
                                      {String.fromCharCode(65 + oi)}.
                                    </span>
                                    <span className="flex-1">
                                      {opt.text || "(empty option)"}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      {userSel && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          Your answer
                                        </span>
                                      )}
                                      {correct && (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {!!q.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <h5 className="font-semibold text-blue-900 mb-1">
                              Explanation:
                            </h5>
                            <p className="text-blue-800 text-sm">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                Edit Quiz
              </button>
            </div>
            {showResults && (
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;
