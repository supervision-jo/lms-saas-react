import React, { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  Save,
  Eye,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/** ===== Shapes used by the parent after normalization ===== */
type Choice = { text: string; is_correct: boolean };
type QuestionDraft = {
  text: string;
  question_type: "mcq";
  explanation?: string;
  choices: Choice[];
};
export type AssessmentDraft = {
  title: string;
  description?: string;
  time_limit_mins: number; // minutes
  passing_score: number; // 0..100
  type?: "quiz" | "exam"; // parent may provide, not required here
  questions: QuestionDraft[];
};

/** ===== Props ===== */
interface QuizBuilderProps {
  onSave: (draft: AssessmentDraft) => void;
  onPreview: (draft: AssessmentDraft) => void;
  /**
   * May come in the new AssessmentDraft-like shape (preferred) or
   * the legacy quiz shape you had before. We gracefully adapt.
   */
  initialQuiz?: any;
}

/** ===== Internal editor state (UI friendly) ===== */
type UiOption = { id: string; text: string; is_correct: boolean };
type UiQuestion = {
  id: string;
  text: string;
  explanation?: string;
  points: number; // UI-only (not sent to API)
  timeLimitSeconds?: number; // UI optional per-question time; not sent
  options: UiOption[];
};

type UiQuiz = {
  title: string;
  description?: string;
  time_limit_mins: number;
  passing_score: number;
  type?: "quiz" | "exam";
  questions: UiQuestion[];
};

/** ===== Helpers ===== */
const uid = () => Math.random().toString(36).slice(2);

function fromInitialToUi(initial?: any): UiQuiz {
  // Defaults
  const base: UiQuiz = {
    title: "",
    description: "",
    time_limit_mins: 10,
    passing_score: 70,
    type: initial?.type === "exam" ? "exam" : "quiz",
    questions: [
      {
        id: uid(),
        text: "",
        explanation: "",
        points: 1,
        timeLimitSeconds: undefined,
        options: [
          { id: uid(), text: "", is_correct: false },
          { id: uid(), text: "", is_correct: false },
        ],
      },
    ],
  };

  if (!initial) return base;

  // If initial already looks like AssessmentDraft
  if (
    typeof initial?.title === "string" &&
    Array.isArray(initial?.questions) &&
    (typeof initial?.time_limit_mins === "number" ||
      initial?.time_limit_mins == null)
  ) {
    return {
      title: initial.title ?? base.title,
      description: initial.description ?? base.description,
      time_limit_mins:
        typeof initial.time_limit_mins === "number"
          ? Math.max(1, Math.floor(initial.time_limit_mins))
          : base.time_limit_mins,
      passing_score:
        typeof initial.passing_score === "number"
          ? Math.max(0, Math.min(100, Math.floor(initial.passing_score)))
          : base.passing_score,
      type: initial.type === "exam" ? "exam" : "quiz",
      questions:
        initial.questions.length > 0
          ? initial.questions.map((q: any) => ({
              id: uid(),
              text: String(q.text ?? ""),
              explanation: q.explanation ?? "",
              points: 1,
              timeLimitSeconds: undefined,
              options:
                Array.isArray(q.choices) && q.choices.length > 0
                  ? q.choices.map((c: any) => ({
                      id: uid(),
                      text: String(c.text ?? ""),
                      is_correct: !!c.is_correct,
                    }))
                  : [
                      { id: uid(), text: "", is_correct: false },
                      { id: uid(), text: "", is_correct: false },
                    ],
            }))
          : base.questions,
    };
  }

  // Legacy shape fallback (your old Quiz type)
  // { title, description, questions:[{ question, options:[{text,isCorrect}], explanation, points, timeLimit }], totalTimeLimit, ... }
  const fromLegacy: UiQuiz = {
    title: initial?.title ?? base.title,
    description: initial?.description ?? base.description,
    time_limit_mins: initial?.totalTimeLimit
      ? Math.max(1, Math.floor(Number(initial.totalTimeLimit) / 60))
      : base.time_limit_mins,
    passing_score: 70,
    type: "quiz",
    questions:
      Array.isArray(initial?.questions) && initial.questions.length
        ? initial.questions.map((q: any) => ({
            id: uid(),
            text: String(q.question ?? ""),
            explanation: q.explanation ?? "",
            points: Number.isFinite(q.points)
              ? Math.max(1, Number(q.points))
              : 1,
            timeLimitSeconds: q.timeLimit ? Number(q.timeLimit) : undefined,
            options:
              Array.isArray(q.options) && q.options.length
                ? q.options.map((o: any) => ({
                    id: uid(),
                    text: String(o.text ?? ""),
                    is_correct: !!(o.isCorrect ?? o.is_correct),
                  }))
                : [
                    { id: uid(), text: "", is_correct: false },
                    { id: uid(), text: "", is_correct: false },
                  ],
          }))
        : base.questions,
  };

  return fromLegacy;
}

function toAssessmentDraft(ui: UiQuiz): AssessmentDraft {
  return {
    title: ui.title.trim(),
    description: ui.description?.trim() || "",
    time_limit_mins: Math.max(1, Math.floor(Number(ui.time_limit_mins || 1))),
    passing_score: Math.max(
      0,
      Math.min(100, Math.floor(Number(ui.passing_score || 0)))
    ),
    type: ui.type ?? "quiz",
    questions: ui.questions.map((q) => ({
      text: q.text.trim(),
      question_type: "mcq",
      explanation: q.explanation?.trim() || "",
      choices: q.options.map((o) => ({
        text: o.text.trim(),
        is_correct: !!o.is_correct,
      })),
    })),
  };
}

/** ===== Component ===== */
const QuizBuilder: React.FC<QuizBuilderProps> = ({
  onSave,
  onPreview,
  initialQuiz,
}) => {
  const [quiz, setQuiz] = useState<UiQuiz>(() => fromInitialToUi(initialQuiz));
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    () => new Set(quiz.questions.length ? [quiz.questions[0].id] : [])
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalPoints = useMemo(
    () => quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [quiz.questions]
  );

  /** ---- question ops ---- */
  const addQuestion = () => {
    const q: UiQuestion = {
      id: uid(),
      text: "",
      explanation: "",
      points: 1,
      timeLimitSeconds: undefined,
      options: [
        { id: uid(), text: "", is_correct: false },
        { id: uid(), text: "", is_correct: false },
      ],
    };
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, q] }));
    setExpandedQuestions((s) => new Set([...s, q.id]));
  };

  const removeQuestion = (qid: string) => {
    if (quiz.questions.length <= 1) {
      alert("A quiz must have at least 1 question");
      return;
    }
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qid),
    }));
    setExpandedQuestions((s) => {
      const n = new Set(s);
      n.delete(qid);
      return n;
    });
  };

  const updateQuestion = (qid: string, patch: Partial<UiQuestion>) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qid ? { ...q, ...patch } : q
      ),
    }));
  };

  /** ---- option ops ---- */
  const addOption = (qid: string) => {
    const q = quiz.questions.find((x) => x.id === qid);
    if (!q) return;
    const opt: UiOption = { id: uid(), text: "", is_correct: false };
    updateQuestion(qid, { options: [...q.options, opt] });
  };

  const removeOption = (qid: string, oid: string) => {
    const q = quiz.questions.find((x) => x.id === qid);
    if (!q) return;
    if (q.options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }
    updateQuestion(qid, { options: q.options.filter((o) => o.id !== oid) });
  };

  const updateOption = (qid: string, oid: string, text: string) => {
    const q = quiz.questions.find((x) => x.id === qid);
    if (!q) return;
    updateQuestion(qid, {
      options: q.options.map((o) => (o.id === oid ? { ...o, text } : o)),
    });
  };

  const toggleCorrect = (qid: string, oid: string) => {
    const q = quiz.questions.find((x) => x.id === qid);
    if (!q) return;
    updateQuestion(qid, {
      options: q.options.map((o) =>
        o.id === oid ? { ...o, is_correct: !o.is_correct } : o
      ),
    });
  };

  /** ---- ui helpers ---- */
  const toggleExpanded = (qid: string) => {
    setExpandedQuestions((s) => {
      const n = new Set(s);
      if (n.has(qid)) n.delete(qid);
      else n.add(qid);
      return n;
    });
  };

  /** ---- validation ---- */
  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!quiz.title.trim()) next["title"] = "Title is required";

    quiz.questions.forEach((q, idx) => {
      if (!q.text.trim()) next[`q_${q.id}`] = `Question ${idx + 1} is required`;
      if (q.options.some((o) => !o.text.trim()))
        next[`opts_${q.id}`] = `All options in question ${
          idx + 1
        } must have text`;
      if (!q.options.some((o) => o.is_correct))
        next[`corr_${q.id}`] = `Question ${
          idx + 1
        } must have at least one correct answer`;
      if (!Number.isFinite(q.points) || q.points < 1)
        next[`pts_${q.id}`] = `Question ${idx + 1} points must be ≥ 1`;
    });

    // minutes + passing score sanity
    if (!Number.isFinite(quiz.time_limit_mins) || quiz.time_limit_mins < 1) {
      next["time"] = "Time limit must be at least 1 minute";
    }
    if (
      !Number.isFinite(quiz.passing_score) ||
      quiz.passing_score < 0 ||
      quiz.passing_score > 100
    ) {
      next["pass"] = "Passing score must be between 0 and 100";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** ---- actions ---- */
  const handleSave = () => {
    if (!validate()) return;
    onSave(toAssessmentDraft(quiz));
  };
  const handlePreview = () => {
    if (!validate()) return;
    onPreview(toAssessmentDraft(quiz));
  };

  /** ---- render ---- */
  return (
    <div className="bg-white rounded-xl md:p-8 p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {quiz.type === "exam" ? "Exam Builder" : "Quiz Builder"}
        </h2>
        <p className="text-gray-600">
          Create engaging {quiz.type === "exam" ? "exams" : "quizzes"} with
          multiple questions and answer options.
        </p>
      </div>

      <div className="space-y-8">
        {/* Quiz info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {quiz.type === "exam" ? "Exam Information" : "Quiz Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={quiz.title}
                onChange={(e) =>
                  setQuiz((p) => ({ ...p, title: e.target.value }))
                }
                placeholder={`Enter ${
                  quiz.type === "exam" ? "exam" : "quiz"
                } title`}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={quiz.passing_score}
                onChange={(e) =>
                  setQuiz((p) => ({
                    ...p,
                    passing_score: Math.max(
                      0,
                      Math.min(100, Number(e.target.value || 0))
                    ),
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.pass ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.pass && (
                <p className="mt-1 text-sm text-red-600">{errors.pass}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Time Limit (minutes) *
              </label>
              <input
                type="number"
                min={1}
                value={quiz.time_limit_mins}
                onChange={(e) =>
                  setQuiz((p) => ({
                    ...p,
                    time_limit_mins: Math.max(
                      1,
                      Math.floor(Number(e.target.value || 1))
                    ),
                  }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.time ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                rows={3}
                value={quiz.description || ""}
                onChange={(e) =>
                  setQuiz((p) => ({ ...p, description: e.target.value }))
                }
                placeholder={`Brief description of the ${
                  quiz.type === "exam" ? "exam" : "quiz"
                }`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className="flex items-center justify-between sm:flex-row flex-col-reverse gap-2 sm:gap-0 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 sm:self-center self-start">
              Questions ({quiz.questions.length})
            </h3>
            <button
              onClick={addQuestion}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const expanded = expandedQuestions.has(q.id);
              return (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleExpanded(q.id)}
                        className="flex items-center space-x-3 flex-1 text-left"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {expanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Question {idx + 1}
                            {q.text &&
                              `: ${q.text.substring(0, 50)}${
                                q.text.length > 50 ? "…" : ""
                              }`}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {q.options.length} options • {q.points} point
                            {q.points !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => removeQuestion(q.id)}
                        disabled={quiz.questions.length <= 1}
                        className={`p-2 rounded-lg transition-colors ${
                          quiz.questions.length <= 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          quiz.questions.length <= 1
                            ? "Minimum 1 question required"
                            : "Remove question"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* body */}
                  {expanded && (
                    <div className="sm:p-6 p-2 space-y-6">
                      {/* text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={q.text}
                          onChange={(e) =>
                            updateQuestion(q.id, { text: e.target.value })
                          }
                          placeholder="Enter your question here…"
                          rows={3}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                            errors[`q_${q.id}`]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`q_${q.id}`] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[`q_${q.id}`]}
                          </p>
                        )}
                      </div>

                      {/* options */}
                      <div>
                        <div className="flex sm:items-center items-start sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Answer Options *
                          </label>
                          <button
                            onClick={() => addOption(q.id)}
                            className="self-center bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </button>
                        </div>

                        <div className="space-y-3">
                          {q.options.map((o, oi) => (
                            <div
                              key={o.id}
                              className="flex items-start gap-3 sm:flex-row flex-col p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center mt-1">
                                <span className="text-sm font-medium text-gray-500 mr-3">
                                  {String.fromCharCode(65 + oi)}.
                                </span>
                                <button
                                  onClick={() => toggleCorrect(q.id, o.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    o.is_correct
                                      ? "bg-green-500 border-green-500 text-white"
                                      : "border-gray-300 hover:border-green-400"
                                  }`}
                                  title={
                                    o.is_correct
                                      ? "Correct answer"
                                      : "Mark as correct"
                                  }
                                >
                                  {o.is_correct && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={o.text}
                                  onChange={(e) =>
                                    updateOption(q.id, o.id, e.target.value)
                                  }
                                  placeholder={`Option ${String.fromCharCode(
                                    65 + oi
                                  )}`}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>

                              <button
                                onClick={() => removeOption(q.id, o.id)}
                                disabled={q.options.length <= 2}
                                className={`p-1 rounded transition-colors ${
                                  q.options.length <= 2
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-red-500 hover:bg-red-50"
                                }`}
                                title={
                                  q.options.length <= 2
                                    ? "Minimum 2 options required"
                                    : "Remove option"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {errors[`opts_${q.id}`] && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors[`opts_${q.id}`]}
                          </p>
                        )}
                        {errors[`corr_${q.id}`] && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors[`corr_${q.id}`]}
                          </p>
                        )}
                      </div>

                      {/* settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Points *
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={q.points}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                points: Math.max(
                                  1,
                                  Number(e.target.value || 1)
                                ),
                              })
                            }
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`pts_${q.id}`]
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`pts_${q.id}`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`pts_${q.id}`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Per-question Time (seconds, optional)
                          </label>
                          <input
                            type="number"
                            min={10}
                            max={1800}
                            value={q.timeLimitSeconds ?? ""}
                            onChange={(e) =>
                              updateQuestion(q.id, {
                                timeLimitSeconds: e.target.value
                                  ? Math.max(10, Number(e.target.value))
                                  : undefined,
                              })
                            }
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* explanation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explanation (optional)
                        </label>
                        <textarea
                          value={q.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(q.id, {
                              explanation: e.target.value,
                            })
                          }
                          placeholder="Provide an explanation for the correct answer…"
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">
            {quiz.type === "exam" ? "Exam Summary" : "Quiz Summary"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Questions:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.questions.length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Points:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {totalPoints}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Total Options:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.questions.reduce((sum, q) => sum + q.options.length, 0)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Time Limit:</span>
              <span className="font-semibold text-blue-900 ml-2">
                {quiz.time_limit_mins}m
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center sm:flex-row flex-col gap-4 justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {quiz.questions.length} question
            {quiz.questions.length !== 1 ? "s" : ""} • {totalPoints} total point
            {totalPoints !== 1 ? "s" : ""}
          </div>

          <div className="sm:w-fit w-full flex gap-4 items-center sm:flex-row flex-col">
            <button
              onClick={handlePreview}
              className="bg-gray-600 text-white px-6 py-3 w-full rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="bg-purple-600 text-white px-6 py-3 w-full rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
