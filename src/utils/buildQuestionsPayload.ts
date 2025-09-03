import type { DraftQuestion } from "@/pages/dashboard/admin/exams/questions/QuestionsPage";
import { fileToDataUrl } from "./fileToDataUrl";

const safeTrim = (v?: string | null) => {
  const t = (v ?? "").trim();
  return t.length ? t : undefined;
};

type BuiltAnswer = {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  image?: string;
  explanation?: string;
};

type BuiltQuestion = {
  question_text: string;
  marks: number;
  image?: string;
  answers: BuiltAnswer[];
};

export const buildQuestionsJson = async (
  examId: string,
  drafts: DraftQuestion[]
): Promise<{ exam: string; questions: BuiltQuestion[] }> => {
  const questions: BuiltQuestion[] = await Promise.all(
    drafts.map(async (q) => {
      const image =
        q.image instanceof File ? await fileToDataUrl(q.image) : q.image;
      const answers: BuiltAnswer[] = await Promise.all(
        (q.answers ?? []).map(async (a) => {
          const ans: BuiltAnswer = {
            ...(a.id ? { id: a.id } : {}),
            answer_text: a.answer_text ?? "",
            is_correct: !!a.is_correct,
          };
          const ansImg =
            a.image instanceof File ? await fileToDataUrl(a.image) : a.image;
          if (ansImg) ans.image = ansImg;
          const exp = safeTrim(a.explanation);
          if (exp) ans.explanation = exp;
          return ans;
        })
      );

      const built: BuiltQuestion = {
        question_text: q.question_text ?? "",
        marks: q.marks ?? 0,
        answers,
      };
      if (image) built.image = image;
      return built;
    })
  );

  return { exam: examId, questions };
};

export const buildSingleQuestionJson = async (
  q: DraftQuestion
): Promise<BuiltQuestion> => {
  const image =
    q.image instanceof File ? await fileToDataUrl(q.image) : q.image;

  const answers: BuiltAnswer[] = await Promise.all(
    (q.answers ?? []).map(async (a) => {
      const ans: BuiltAnswer = {
        ...(a.id ? { id: a.id } : {}),
        answer_text: a.answer_text ?? "",
        is_correct: !!a.is_correct,
      };
      const ansImg =
        a.image instanceof File ? await fileToDataUrl(a.image) : a.image;
      if (ansImg) ans.image = ansImg;
      const exp = safeTrim(a.explanation);
      if (exp) ans.explanation = exp;
      return ans;
    })
  );

  const built: BuiltQuestion = {
    question_text: q.question_text ?? "",
    marks: q.marks ?? 0,
    answers,
  };
  if (image) built.image = image;
  return built;
};
