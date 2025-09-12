import {
  Edit,
  FileText,
  GripVertical,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useCustomQuery } from "../../../hooks/useQuery";
import { useCustomPost } from "../../../hooks/useMutation";
import { API_ENDPOINTS } from "../../../utils/constants";
import toast from "react-hot-toast";
import handleErrorAlerts from "../../../utils/showErrorMessages";
import QuizBuilderModal from "./QuizBuilderModal";
import { readUserFromStorage } from "../../../services/auth";
import { useEffect, useState } from "react";

type AssessmentChoice = { text: string; is_correct: boolean };
type AssessmentQuestion = {
  text: string;
  question_type: "mcq";
  explanation?: string;
  choices: AssessmentChoice[];
};

export type AssessmentDraft = {
  title: string;
  description?: string;
  time_limit_mins: number;
  passing_score: number;
  type: "quiz" | "exam";
  questions: AssessmentQuestion[];
};

type LessonDraft = {
  id?: string;
  title: string;
  description: string;
  content_type: "video" | "article" | "material";
  video_url: string | null;
  free_preview: boolean;
  duration_hours: number | "";
  order?: number;
  quizDraft?: AssessmentDraft | null;
  examDraft?: AssessmentDraft | null;
};

type SectionFormValues = {
  courseId: string;
  title: string;
  description: string;
  order?: number;
  lessons: LessonDraft[];
};

const lessonIcon = (type: LessonDraft["content_type"]) => {
  switch (type) {
    case "video":
      return <Video className="w-4 h-4" />;
    case "article":
      return <FileText className="w-4 h-4" />;
    case "material":
      return <Upload className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const defaultLesson = (type: LessonDraft["content_type"]): LessonDraft => ({
  title:
    type === "video"
      ? "New Video"
      : `New ${type[0].toUpperCase()}${type.slice(1)}`,
  description: "",
  content_type: type,
  duration_hours: "",
  video_url: type === "video" ? "" : null,
  free_preview: false,
  quizDraft: null,
  examDraft: null,
});

export default function CreateSectionsForm() {
  const currentUser: User = readUserFromStorage();

  const { data: coursesRes } = useCustomQuery(API_ENDPOINTS.courses, [
    "courses",
  ]);
  const allCourses: Course[] = coursesRes?.data ?? [];

  const courses: Array<{ id: string; title: string }> = allCourses
    ?.filter((c) => c?.instructor?.id === currentUser?.id)
    .map((i) => ({ id: i?.id, title: i?.title }));

  const { mutateAsync: createSection, isPending: creatingSection } =
    useCustomPost(API_ENDPOINTS.createSection, ["modules"]);

  const { mutateAsync: createAssessment, isPending: creatingAssessments } =
    useCustomPost(API_ENDPOINTS.createExam, ["modules"]);

  /** Form */
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SectionFormValues>({
    mode: "onChange",
    defaultValues: {
      courseId: courses?.[0]?.id ?? "",
      title: "",
      description: "",
      order: 1,
      lessons: [],
    },
  });

  useEffect(() => {
    const first = courses?.[0]?.id;
    if (first && !watch("courseId"))
      setValue("courseId", first, { shouldDirty: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses?.length]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  });

  const addLesson = (type: LessonDraft["content_type"]) =>
    append(defaultLesson(type));

  const [quizModal, setQuizModal] = useState<{
    open: boolean;
    index: number | null;
    type: "quiz" | "exam";
    initial?: AssessmentDraft | null;
  }>({ open: false, index: null, type: "quiz", initial: null });

  const openAssessmentModal = (idx: number, type: "quiz" | "exam") => {
    const initial =
      type === "quiz"
        ? (watch(`lessons.${idx}.quizDraft`) as AssessmentDraft | null)
        : (watch(`lessons.${idx}.examDraft`) as AssessmentDraft | null);
    setQuizModal({ open: true, index: idx, type, initial: initial ?? null });
  };

  const onSaveDraftFromModal = (draft: AssessmentDraft) => {
    if (quizModal.index == null) return;
    const minutes = Math.max(1, Math.floor(Number(draft.time_limit_mins || 1)));
    if (quizModal.type === "quiz") {
      setValue(
        `lessons.${quizModal.index}.quizDraft`,
        { ...draft, time_limit_mins: minutes, type: "quiz" },
        { shouldDirty: true }
      );
    } else {
      setValue(
        `lessons.${quizModal.index}.examDraft`,
        { ...draft, time_limit_mins: minutes, type: "exam" },
        { shouldDirty: true }
      );
    }
    setQuizModal({ open: false, index: null, type: "quiz", initial: null });
  };

  const onSubmit = async (values: SectionFormValues) => {
    if (!values.courseId) return toast.error("Please choose a course.");
    if (!values.title.trim()) return toast.error("Section title is required.");
    if (!values.lessons?.length) return toast.error("Add at least one lesson.");

    const lessonsPayload = values.lessons.map((l, idx) => ({
      title: l.title?.trim() || `Lesson ${idx + 1}`,
      description: l.description?.trim() || "",
      order: idx + 1,
      video_url: l.content_type === "video" ? l.video_url || "" : null,
      free_preview: !!l.free_preview,
      duration_hours: l.duration_hours || 0,
      content_type: l.content_type,
    }));

    const sectionPayload = {
      title: values.title.trim(),
      course: values.courseId,
      description: values.description?.trim() || "",
      order: Number(values.order ?? 1),
      lessons: lessonsPayload,
    };

    try {
      const res = await createSection(sectionPayload);
      const created = res?.data ?? res;
      const createdLessons:
        | Array<{ id: string; order: number; title?: string }>
        | undefined = created?.lessons ?? created?.data?.lessons;

      const tasks: Array<Promise<any>> = [];
      values.lessons.forEach((local, idx) => {
        if (local.content_type !== "video") return;
        const found = createdLessons?.find(
          (cl) => Number(cl.order) === idx + 1
        );
        if (!found) return;

        const pushAssessment = (draft?: AssessmentDraft | null) => {
          if (!draft) return;
          const payload = {
            title:
              draft.title?.trim() ||
              `${draft.type === "exam" ? "Exam" : "Quiz"} for ${
                local.title || `Lesson ${idx + 1}`
              }`,
            description: draft.description || "",
            lesson: found.id,
            time_limit: Math.max(1, Math.floor(Number(draft.time_limit_mins))),
            type: draft.type,
            passing_score: Math.max(
              0,
              Math.min(100, Math.floor(Number(draft.passing_score || 0)))
            ),
            questions: draft.questions || [],
          };
          tasks.push(createAssessment(payload));
        };

        pushAssessment(local.quizDraft);
        pushAssessment(local.examDraft);
      });

      if (tasks.length) {
        const results = await Promise.allSettled(tasks);
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length) {
          toast.error(
            `Section saved, but ${failed.length} assessment(s) failed.`
          );
        } else {
          toast.success("Section & assessments created successfully!");
        }
      } else {
        toast.success("Section created successfully!");
      }

      const keepCourse = watch("courseId");
      reset({
        courseId: keepCourse,
        title: "",
        description: "",
        order: Number(values.order ?? 1) + 1,
        lessons: [],
      });
    } catch (err: any) {
      const p = err?.response?.data;
      handleErrorAlerts(
        p?.message ||
          p?.title?.[0] ||
          p?.description?.[0] ||
          p?.course?.[0] ||
          p?.order?.[0] ||
          "There is an unexpected error occurred."
      );
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <div className="flex md:items-center items-start gap-4 justify-between mb-6 md:flex-row flex-col">
          <h2 className="text-2xl font-bold text-gray-900">Curriculum</h2>

          <div className="flex items-center gap-3 sm:flex-row flex-col sm:w-fit w-full">
            <button
              type="button"
              onClick={() => addLesson("video")}
              className="bg-gray-100 text-gray-800 px-3 py-2 sm:w-fit w-full rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </button>
            <button
              type="button"
              onClick={() => addLesson("article")}
              className="bg-gray-100 text-gray-800 px-3 py-2 sm:w-fit w-full rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </button>
            <button
              type="button"
              onClick={() => addLesson("material")}
              className="bg-gray-100 text-gray-800 px-3 py-2 sm:w-fit w-full rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </button>
          </div>
        </div>

        {/* Section header inputs */}
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4 mb-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to C++"
              {...register("title", { required: "Title is required" })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <input
              type="number"
              min={1}
              step={1}
              {...register("order", {
                valueAsNumber: true,
                setValueAs: (v) => Math.max(1, Number(v || 1)),
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course *
            </label>
            <select
              {...register("courseId", { required: "Course is required" })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.courseId ? "border-red-300" : "border-gray-300"
              }`}
            >
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {errors.courseId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.courseId.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Description
            </label>
            <textarea
              rows={3}
              placeholder="What will this module cover?"
              {...register("description")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Lessons */}
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No lessons yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by adding videos, articles, or materials. Quizzes/Exams
              attach to video lessons.
            </p>
            <button
              type="button"
              onClick={() => addLesson("video")}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((f, idx) => {
              const type = watch(`lessons.${idx}.content_type`);
              const isVideo = type === "video";
              const qDraft = watch(`lessons.${idx}.quizDraft`) as
                | AssessmentDraft
                | undefined;
              const eDraft = watch(`lessons.${idx}.examDraft`) as
                | AssessmentDraft
                | undefined;

              return (
                <div key={f.id} className="border border-gray-200 rounded-lg">
                  <div className="p-4">
                    <div className="flex sm:items-start sm:justify-between sm:flex-row flex-col-reverse gap-3">
                      <div className="flex w-full items-start gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 sm:block hidden" />
                        <div className="sm:block hidden">
                          {lessonIcon(type)}
                        </div>

                        <div className="space-y-2 w-full">
                          <div className="flex flex-col md:flex-row gap-3">
                            <input
                              type="text"
                              placeholder="Lesson title"
                              {...register(`lessons.${idx}.title`, {
                                required: "Title required",
                              })}
                              className={`md:w-80 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                (errors?.lessons?.[idx] as any)?.title
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                            />

                            <select
                              {...register(`lessons.${idx}.content_type`, {
                                onChange: (e) => {
                                  const val = e.target
                                    .value as LessonDraft["content_type"];
                                  if (val !== "video") {
                                    setValue(`lessons.${idx}.quizDraft`, null, {
                                      shouldDirty: true,
                                    });
                                    setValue(`lessons.${idx}.examDraft`, null, {
                                      shouldDirty: true,
                                    });
                                  }
                                },
                              })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="video">Video</option>
                              <option value="article">Article</option>
                              <option value="material">Material</option>
                            </select>

                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                {...register(`lessons.${idx}.free_preview`)}
                                className="h-4 w-4 text-purple-600 rounded"
                              />
                              Free preview
                            </label>
                          </div>

                          {isVideo && (
                            <input
                              type="url"
                              placeholder="Video URL (YouTube or direct .mp4/.m3u8)"
                              {...register(`lessons.${idx}.video_url` as const)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          )}
                          <input
                            type="number"
                            placeholder="Lesson Duration (Minutes)"
                            {...register(
                              `lessons.${idx}.duration_hours` as const
                            )}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          {!isVideo && (
                            <textarea
                              placeholder="Lesson description (optional)"
                              {...register(`lessons.${idx}.description`)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            />
                          )}
                          {isVideo && (
                            <>
                              <textarea
                                placeholder="Lesson description (optional)"
                                {...register(`lessons.${idx}.description`)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                              />
                              {/* Assessment config (Video-only) */}
                              <div className="flex sm:flex-row flex-col sm:w-fit w-full items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openAssessmentModal(idx, "quiz")
                                  }
                                  className="sm:w-40  w-full px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center"
                                  title="Configure Quiz"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  {qDraft ? "Edit Quiz" : "Add Quiz"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openAssessmentModal(idx, "exam")
                                  }
                                  className="sm:w-40  w-full px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors flex items-center"
                                  title="Configure Exam"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  {eDraft ? "Edit Exam" : "Add Exam"}
                                </button>

                                {/* status pills */}
                                {qDraft && (
                                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                                    Quiz • {qDraft.questions?.length ?? 0} Q •{" "}
                                    {qDraft.time_limit_mins} min • pass{" "}
                                    {qDraft.passing_score}%
                                  </span>
                                )}
                                {eDraft && (
                                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                    Exam • {eDraft.questions?.length ?? 0} Q •{" "}
                                    {eDraft.time_limit_mins} min • pass{" "}
                                    {eDraft.passing_score}%
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full sm:w-fit justify-between items-center gap-2 sm:self-start self-end">
                        <div className="flex items-center gap-2 sm:hidden">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div>{lessonIcon(type)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="pt-6 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting || creatingSection || creatingAssessments}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-60"
          >
            {isSubmitting || creatingSection || creatingAssessments
              ? "Saving…"
              : "Save Module"}
          </button>
        </div>
      </form>

      {/* Quiz/Exam Builder Modal */}
      {quizModal.open && quizModal.index != null && (
        <QuizBuilderModal
          type={quizModal.type}
          initial={quizModal.initial || undefined}
          onCancel={() =>
            setQuizModal({
              open: false,
              index: null,
              type: "quiz",
              initial: null,
            })
          }
          onSaveDraft={onSaveDraftFromModal}
        />
      )}
    </div>
  );
}
