import QuizBuilder from "../../quizes/QuizBuilder";
import QuizPreview from "../../quizes/QuizPreview";
import type { AssessmentDraft } from "./CreateSectionsForm";
import { useState } from "react";

/**
 * A thin modal wrapper around your existing <QuizBuilder />.
 * - Does NOT call the API.
 * - Returns a draft object (including minutes) to the parent.
 * - Also supports a live preview modal before saving.
 */
export default function QuizBuilderModal({
  type,
  initial,
  onCancel,
  onSaveDraft,
}: {
  type: "quiz" | "exam";
  initial?: Partial<AssessmentDraft>;
  onCancel: () => void;
  onSaveDraft: (draft: AssessmentDraft) => void;
}) {
  /** ---------- Preview wiring ---------- */

  // The shape expected by <QuizPreview />
  type PreviewOption = { id: string; text: string; isCorrect: boolean };
  type PreviewQuestion = {
    id: string;
    question: string;
    options: PreviewOption[];
    explanation?: string;
    points: number;
    timeLimit?: number; // seconds (unused here, but supported)
  };
  type PreviewQuiz = {
    id: string;
    title: string;
    description?: string;
    questions: PreviewQuestion[];
    totalPoints: number;
    totalTimeLimit?: number; // seconds (QuizPreview expects seconds)
  };

  const [previewQuiz, setPreviewQuiz] = useState<PreviewQuiz | null>(null);

  const toPreviewQuiz = (draft: AssessmentDraft): PreviewQuiz => {
    const questions: PreviewQuestion[] = (draft.questions || []).map(
      (q, qi) => ({
        id: String(qi + 1),
        question: q.text ?? "",
        options: (q.choices || []).map((c, ci) => ({
          id: `${qi + 1}-${ci + 1}`,
          text: c.text ?? "",
          isCorrect: !!c.is_correct,
        })),
        explanation: q.explanation || "",
        // NOTE: AssessmentDraft doesn't carry points; default to 1 each for preview scoring
        points: 1,
        timeLimit: undefined,
      })
    );

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    return {
      id: "preview",
      title: draft.title || (draft.type === "exam" ? "Exam" : "Quiz"),
      description: draft.description || "",
      questions,
      totalPoints,
      totalTimeLimit: draft.time_limit_mins
        ? Number(draft.time_limit_mins) * 60
        : undefined,
    };
  };

  /** Normalize builder payload -> AssessmentDraft */
  const normalizeToDraft = (payload: any): AssessmentDraft => {
    const draft: AssessmentDraft = {
      title: (payload?.title ||
        initial?.title ||
        (type === "exam" ? "Exam" : "Quiz"))!
        .toString()
        .trim(),
      description: payload?.description ?? initial?.description ?? "",
      time_limit_mins: Number(
        payload?.time_limit_mins ??
          payload?.time_limit ??
          initial?.time_limit_mins ??
          10
      ),
      passing_score: Number(
        payload?.passing_score ?? initial?.passing_score ?? 70
      ),
      type,
      questions: Array.isArray(payload?.questions)
        ? payload.questions
        : initial?.questions || [],
    };

    // clamp + integer minutes/score
    draft.time_limit_mins = Math.max(
      1,
      Math.floor(Number(draft.time_limit_mins))
    );
    draft.passing_score = Math.max(
      0,
      Math.min(100, Math.floor(Number(draft.passing_score)))
    );

    return draft;
  };

  /** Save coming from builder */
  const handleSave = (payload: any) => {
    const draft = normalizeToDraft(payload);
    onSaveDraft(draft);
  };

  /** Preview coming from builder */
  const handlePreview = (payload: any) => {
    const draft = normalizeToDraft(payload);
    setPreviewQuiz(toPreviewQuiz(draft));
  };

  return (
    <>
      {/* Modal shell */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {type === "exam" ? "Build Exam" : "Build Quiz"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>

          {/* The builder */}
          <QuizBuilder
            initialQuiz={{
              title: initial?.title,
              description: initial?.description,
              time_limit_mins: initial?.time_limit_mins ?? 10,
              passing_score: initial?.passing_score ?? 70,
              questions: initial?.questions ?? [],
              type,
            }}
            onSave={handleSave}
            onPreview={handlePreview}
          />

          <div className="px-6 pb-6 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Preview overlay (sits above the builder) */}
      {previewQuiz && (
        <QuizPreview
          quiz={previewQuiz}
          onClose={() => setPreviewQuiz(null)}
          onEdit={() => setPreviewQuiz(null)}
        />
      )}
    </>
  );
}
