import { useMemo, useState } from "react";

interface ExamSectionProps {
  exam: Exam; // API Exam
  onClose: () => void; // called when learner clicks "Continue Learning"
}

export default function ExamSection({ exam, onClose }: ExamSectionProps) {
  // normalize
  const questions = useMemo(() => {
    return Array.isArray(exam?.questions) ? exam.questions : [];
  }, [exam.questions]);
  const passing =
    typeof exam?.passing_score === "number" ? exam.passing_score : 0;

  // answers keyed by question id -> set of choice ids (support multi-correct)
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleAnswer = (qId: string, choiceId: string, isMulti: boolean) => {
    if (submitted) return;
    setAnswers((prev) => {
      const curr = new Set(prev[qId] ?? []);
      if (isMulti) {
        if (curr.has(choiceId)) curr.delete(choiceId);
        else curr.add(choiceId);
        return { ...prev, [qId]: curr };
      }
      const n = new Set<string>();
      n.add(choiceId);
      return { ...prev, [qId]: n };
    });
  };

  const { totalScore, maxScore } = useMemo(() => {
    if (!submitted) return { totalScore: 0, maxScore: questions.length };
    let correctCount = 0;
    for (const q of questions) {
      const choices = Array.isArray(q.choices) ? q.choices : [];
      const correctIds = new Set(
        choices.filter((c) => c.is_correct).map((c) => c.id)
      );
      const picked = answers[q.id] ?? new Set<string>();
      if (
        picked.size === correctIds.size &&
        [...picked].every((p) => correctIds.has(p))
      ) {
        correctCount += 1;
      }
    }
    return { totalScore: correctCount, maxScore: questions.length };
  }, [submitted, answers, questions]);

  const percent = Math.round((totalScore / Math.max(1, maxScore)) * 100);
  const passed = percent >= passing;

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
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const choices = Array.isArray(q.choices) ? q.choices : [];
          const correctCount = choices.filter((c) => c.is_correct).length;
          const multi = correctCount > 1;
          const selected = answers[q.id] ?? new Set<string>();
          const isCorrectNow =
            submitted &&
            selected.size === correctCount &&
            [...selected].every(
              (id) => choices.find((c) => c.id === id)?.is_correct
            );

          return (
            <div
              key={q.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-gray-900 font-semibold">
                  {idx + 1}. {q.text}
                </h4>
                {submitted && (
                  <span
                    className={`text-sm font-semibold ${
                      isCorrectNow ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isCorrectNow ? "Correct" : "Incorrect"}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {choices.map((c, ci) => {
                  const checked = selected.has(c.id);
                  const showAs =
                    submitted && c.is_correct
                      ? "border-green-500 bg-green-50"
                      : submitted && checked && !c.is_correct
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-white";
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center p-3 rounded border ${showAs} cursor-pointer`}
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

              {submitted && q.explanation && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                  <strong>Explanation: </strong>
                  {q.explanation}
                </div>
              )}
              {multi && (
                <div className="mt-2 text-xs text-gray-500">
                  Multiple answers may be correct.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between">
        {!submitted ? (
          <>
            <div className="text-gray-500 text-sm">
              Answer all questions to submit.
            </div>
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length !== questions.length}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Submit {exam.type === "quiz" ? "Quiz" : "Exam"}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-start justify-start gap-4 w-full">
            <div
              className={`md:text-lg text-sm font-semibold ${
                passed ? "text-green-700" : "text-red-700"
              }`}
            >
              Score: {totalScore}/{maxScore} ({percent}%) —{" "}
              {passed ? "Passed" : "Failed"} (pass {passing}%)
            </div>
            <div className="flex sm:gap-4 gap-2 items-center flex-col sm:flex-row w-full sm:w-fit">
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-lg border sm:w-52 w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Review Again
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
