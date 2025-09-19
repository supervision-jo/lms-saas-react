import { useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../../utils/constants";
import { useCustomPost } from "../../../hooks/useMutation";
import { useCustomQuery } from "../../../hooks/useQuery";
import toast from "react-hot-toast";
import handleErrorAlerts from "../../../utils/showErrorMessages";

interface ExamSectionProps {
  exam: Exam;
  onClose: () => void;
}

interface StudentAnswers {
  id: string;
  student: string;
  quiz: string;
  attempt: number;
  score: number;
  passed: boolean;
  total_questions: number;
  submitted_at: string;
  count_correct: number;
  count_incorrect: number;
}

export default function ExamSection({ exam, onClose }: ExamSectionProps) {
  const MAX_ATTEMPTS =
    typeof (exam as any)?.max_attempts === "number"
      ? (exam as any).max_attempts
      : 3;

  // Pull ALL previous attempts for this quiz (array)
  const {
    data: ansResp,
    isFetching: isFetchingSummary,
    refetch: refetchSummary,
  } = useCustomQuery(
    `${API_ENDPOINTS.getStudentAnswers}?quiz=${encodeURIComponent(exam.id)}`,
    ["studentAnswers", exam.id]
  );

  const attempts: StudentAnswers[] = ansResp?.data ?? [];
  const latest = attempts.length
    ? [...attempts].sort((a, b) => a.attempt - b.attempt)[attempts.length - 1]
    : undefined;

  // Next attempt is based on how many we already have
  const attemptsCount = attempts.length;
  const nextAttempt = Math.min(attemptsCount + 1, MAX_ATTEMPTS);
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptsCount);

  const questions = useMemo(
    () => (Array.isArray(exam?.questions) ? exam.questions : []),
    [exam.questions]
  );
  const passing =
    typeof exam?.passing_score === "number" ? exam.passing_score : 0;

  // local picks only
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [submitted, setSubmitted] = useState(false);

  // display numbers come from server (latest attempt)
  const totalQuestions = latest?.total_questions ?? questions.length;
  const correct = latest?.count_correct ?? 0;
  const incorrect = latest?.count_incorrect ?? 0;
  const percent = latest
    ? Math.round((correct / Math.max(1, totalQuestions)) * 100)
    : 0;
  const passed = latest?.passed ?? false;

  const toggleAnswer = (qId: string, choiceId: string, isMulti: boolean) => {
    if (submitted) return;
    setAnswers((prev) => {
      const curr = new Set(prev[qId] ?? []);
      if (isMulti) {
        if (curr.has(choiceId)) {
          curr.delete(choiceId);
        } else {
          curr.add(choiceId);
        }
        return { ...prev, [qId]: curr };
      }
      return { ...prev, [qId]: new Set([choiceId]) };
    });
  };

  const allAnswered = useMemo(
    () => questions.every((q) => (answers[q.id]?.size ?? 0) > 0),
    [answers, questions]
  );

  // Build POST body [{question, choice, attempt}, ...] using nextAttempt
  const buildSubmission = () => {
    const rows: Array<{ question: string; choice: string; attempt: number }> =
      [];
    for (const q of questions) {
      const picked = answers[q.id];
      if (!picked?.size) continue;
      for (const choiceId of picked)
        rows.push({ question: q.id, choice: choiceId, attempt: nextAttempt });
    }
    return rows;
  };

  const { mutateAsync, isPending } = useCustomPost(API_ENDPOINTS.submitExam, [
    "exam",
  ]);

  const submitExam = async () => {
    if (!allAnswered || isPending) return;

    // Guard: only 3 trials total (or MAX_ATTEMPTS)
    if (attemptsCount >= MAX_ATTEMPTS) {
      toast.error(`You only have ${MAX_ATTEMPTS} attempts.`);
      return;
    }

    try {
      const payload = buildSubmission();
      await mutateAsync(payload); // server grades & stores attempt
      setSubmitted(true);
      await refetchSummary(); // refresh attempts array so UI shows latest server result
      toast.success(`Submitted (attempt ${nextAttempt})`);
    } catch (err: any) {
      handleErrorAlerts(err?.response?.data?.error);
    }
  };

  const retake = () => {
    if (passed || attemptsCount >= MAX_ATTEMPTS) return;
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitDisabled =
    !allAnswered || isPending || attemptsCount >= MAX_ATTEMPTS;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      {/* Header */}
      <div className="flex md:items-center md:flex-row flex-col items-start gap-4 md:justify-between mb-6">
        <div>
          <h3 className="md:text-2xl text-lg font-bold text-gray-900">
            {exam.title} {exam.type === "quiz" ? "(Quiz)" : "(Exam)"}
          </h3>
          {exam.description && (
            <p className="text-gray-600 md:text-base text-sm">
              {exam.description}
            </p>
          )}
        </div>
        <div className="md:text-right">
          <div className="text-gray-900 font-semibold">
            Time Limit: {exam.time_limit ?? 0} min
          </div>
          <div className="text-gray-500 text-sm">Passing Score: {passing}%</div>
          <div className="text-gray-500 text-sm">
            Attempt {Math.min(nextAttempt, MAX_ATTEMPTS)} of {MAX_ATTEMPTS}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const choices = Array.isArray(q.choices) ? q.choices : [];
          const correctCount = choices.filter((c) => c.is_correct).length;
          const multi = correctCount > 1;
          const selected = answers[q.id] ?? new Set<string>();

          return (
            <div
              key={q.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-gray-900 font-semibold">
                  {idx + 1}. {q.text}
                </h4>
              </div>
              <div className="space-y-2">
                {choices.map((c, ci) => {
                  const checked = selected.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center p-3 rounded border border-gray-200 bg-white cursor-pointer"
                    >
                      <input
                        type={multi ? "checkbox" : "radio"}
                        name={`q-${q.id}`}
                        value={c.id}
                        checked={checked}
                        disabled={submitted}
                        onChange={() => toggleAnswer(q.id, c.id, multi)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 mr-3"
                      />
                      <span className="text-gray-800">
                        <span className="text-sm font-medium text-gray-500 mr-2">
                          {String.fromCharCode(65 + ci)}.
                        </span>
                        {c.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        {!submitted ? (
          <>
            <div className="text-gray-500 text-sm">
              {attemptsCount < MAX_ATTEMPTS
                ? `Answer all questions to submit. Attempts left: ${attemptsLeft}`
                : "No more attempts remaining."}
            </div>
            <button
              onClick={submitExam}
              disabled={submitDisabled}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isPending
                ? "Submitting..."
                : `Submit ${exam.type === "quiz" ? "Quiz" : "Exam"}`}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-start justify-start gap-4 w-full">
            <div className="text-sm text-gray-500">
              {isFetchingSummary
                ? "Loading results..."
                : `Submitted at: ${latest?.submitted_at ?? "-"}`}
            </div>

            <div
              className={`md:text-lg text-sm font-semibold ${
                passed ? "text-green-700" : "text-red-700"
              }`}
            >
              Score: {correct}/{totalQuestions} ({percent}%) —{" "}
              {passed ? "Passed" : "Failed"} (pass {passing}%)
            </div>

            <div className="text-sm text-gray-500">
              Correct: {correct} · Incorrect: {incorrect} · Attempt #
              {latest?.attempt ?? nextAttempt}
            </div>

            <div className="flex sm:gap-4 gap-2 items-center flex-col sm:flex-row w-full sm:w-fit">
              <button
                onClick={retake}
                disabled={passed || attemptsCount >= MAX_ATTEMPTS}
                className="px-4 py-2 rounded-lg border sm:w-52 w-full border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {passed
                  ? "Passed — No Retake"
                  : attemptsCount >= MAX_ATTEMPTS
                  ? "No Attempts Left"
                  : "Retake"}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-800 text-white px-6 py-2 sm:w-52 w-full rounded-lg hover:bg-gray-900 transition-colors"
              >
                Continue Learning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
