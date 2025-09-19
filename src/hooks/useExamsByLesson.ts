import { qk } from "../utils/builderQueries";
import { API_ENDPOINTS } from "../utils/constants";
import { useCustomQuery } from "./useQuery";

export function useExamsByLesson(lessonId?: string | null) {
  return useCustomQuery(
    lessonId ? `${API_ENDPOINTS.exams}?lesson=${lessonId}` : "",
    qk.examsByLesson(String(lessonId ?? "")),
    undefined,
    !!lessonId
  );
}
