import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Edit,
  FileText,
  GripVertical,
  HelpCircle,
  Link,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useCustomQuery } from "../../../hooks/useQuery";
import { useCustomPost } from "../../../hooks/useMutation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patch, remove, get } from "../../../api";
import { API_ENDPOINTS } from "../../../utils/constants";
import handleErrorAlerts from "../../../utils/showErrorMessages";
import toast from "react-hot-toast";
import EditLesson from "./EditLesson";
import EditArticle from "./EditArticle";
import UploadingMaterial from "./UploadingMaterial";
import {
  isContent,
  isAssessment,
  nextAssessmentTitle,
  anchorAbove,
  reindexOrders1Based,
  fetchAssessmentsForLessons,
  injectAssessmentsIntoModules,
  invalidateAssessmentsCacheForLesson,
} from "../../../utils/courseBuilder";
import { makeKeyedDebouncer } from "../../../utils/netCoalesce";
import QuizBuilder, { AssessmentDraft } from "../../quizes/QuizBuilder";
import QuizPreview from "../../quizes/QuizPreview";
import { AxiosResponse } from "axios";

// ⬇️ NEW imports (split files + helpers)
import ModuleItem from "./ModuleItem";
import LessonItem from "./LessonItem";
import Modal from "../../reusable-components/Modal";
import { buildLessonsPayload } from "../../../utils/lessonNormalize";
import { useExamsByLesson } from "../../../hooks/useExamsByLesson";
import { invalidateLessonExams } from "../../../utils/builderQueries";
import { qk } from "../../../utils/builderQueries";

const debounceLessons = makeKeyedDebouncer(450);
const debounceAssessments = makeKeyedDebouncer(450);
const debounceCommit = makeKeyedDebouncer(450);

export default function CreateSectionsForm({ courseId }: { courseId: string }) {
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const lastSavedRef = useRef<
    Record<string, { title: string; description: string }>
  >({});
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setMenuRef =
    (id: string) =>
    (el: HTMLDivElement | null): void => {
      menuRefs.current[id] = el;
    };

  const assessmentCacheRef = useRef<Record<string, AssessmentDraft>>({});

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!openMenuFor) return;
      const container = menuRefs.current[openMenuFor];
      if (!container) return;
      if (!container.contains(e.target as Node)) setOpenMenuFor(null);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [openMenuFor]);

  // Prefill modules on load
  const { data: modulesData, isLoading } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    qk.modules(courseId),
    undefined,
    !!courseId
  );
  const serverModules: Module[] = useMemo(
    () => modulesData?.data?.data ?? [],
    [modulesData]
  );

  const [modules, setModules] = useState<Module[]>(serverModules);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!Array.isArray(serverModules)) return;
      // collect all content lesson ids (anchors)
      const lessonIds: string[] = [];
      serverModules.forEach((mod) =>
        (mod.lessons || []).forEach((l: any) => {
          if (isContent(l?.content_type)) lessonIds.push(l.id);
        })
      );
      // fetch exams/quizzes by anchor lesson id
      const byLesson = await fetchAssessmentsForLessons(
        lessonIds,
        API_ENDPOINTS.exams
      );
      const stitched = injectAssessmentsIntoModules(serverModules, byLesson);
      if (!cancelled) setModules(stitched);
    })();
    return () => {
      cancelled = true;
    };
  }, [serverModules]);

  const { mutateAsync: createSection } = useCustomPost(
    API_ENDPOINTS.createSection,
    ["modules", courseId!]
  );

  const { mutateAsync: createExam } = useCustomPost(API_ENDPOINTS.createExam, [
    "exams",
    courseId!,
  ]);

  type Values = {
    id: any;
    payload: any;
    lessonIdHint?: string; // ⬅️ add hint for surgical invalidation
  };

  const { mutateAsync: mutateSection } = useMutation<
    AxiosResponse<any>,
    any,
    Values
  >({
    mutationFn: async ({ id, payload }: Values) => {
      return patch(`${API_ENDPOINTS.updateSection}${id}/`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.modules(courseId),
      });
    },
    onError: (e) => {
      const error = e.response?.data?.error;
      handleErrorAlerts(error);
    },
  });

  const { mutateAsync: removeSection } = useMutation<
    AxiosResponse<any>,
    any,
    Partial<Values>
  >({
    mutationFn: async ({ id }: Partial<Values>) => {
      return remove(`${API_ENDPOINTS.deleteSection}${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: qk.modules(courseId),
      });
    },
    onError: (e) => {
      const error = e.response?.data?.error;
      handleErrorAlerts(error);
    },
  });

  // ⬇️ exam update → invalidate only ["exams", lessonId]
  const { mutateAsync: mutateExam } = useMutation<
    AxiosResponse<any>,
    any,
    Values
  >({
    mutationFn: async ({ id, payload }: Values) => {
      return patch(`${API_ENDPOINTS.updateExam}${id}/`, payload);
    },
    onSuccess: (res, vars) => {
      const ex = res?.data?.data?.[0] ?? res?.data?.data ?? res?.data ?? {};
      const lessonId = ex?.lesson ?? vars.lessonIdHint;
      invalidateLessonExams(queryClient, lessonId);
    },
    onError: (e) => {
      const error = e.response?.data?.error;
      handleErrorAlerts(error);
    },
  });

  // ⬇️ exam delete → invalidate only ["exams", lessonId]
  const { mutateAsync: removeExam } = useMutation<
    AxiosResponse<any>,
    any,
    Partial<Values>
  >({
    mutationFn: async ({ id }: Partial<Values>) => {
      return remove(`${API_ENDPOINTS.updateExam}${id}/`);
    },
    onSuccess: (res, vars) => {
      const ex = res?.data?.data?.[0] ?? res?.data?.data ?? res?.data ?? {};
      const lessonId = (ex as any)?.lesson ?? (vars as any)?.lessonIdHint;
      invalidateLessonExams(queryClient, lessonId);
    },
    onError: (e) => {
      const error = e.response?.data?.error;
      handleErrorAlerts(error);
    },
  });

  /** =============== Normalization =============== */
  const saveSectionLessons = async (
    moduleId: string,
    lessonsOverride?: any[]
  ) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const sourceLessons = lessonsOverride ?? mod.lessons ?? [];
    const payload = buildLessonsPayload(sourceLessons);

    // debounce by moduleId
    return debounceLessons(moduleId, () =>
      mutateSection({ id: moduleId, payload })
    );
  };

  useEffect(() => {
    const map: Record<string, { title: string; description: string }> = {};
    for (const m of serverModules || []) {
      map[m.id] = { title: m.title ?? "", description: m.description ?? "" };
    }
    lastSavedRef.current = map;
  }, [serverModules]);

  const patchModuleField = async (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    const last = lastSavedRef.current[id]?.[field] ?? "";
    if (String(last) === String(value)) return; // only skip if same as server

    await mutateSection({ id, payload: { [field]: value } });
    toast.success("Saved");

    // update last-saved snapshot so subsequent blurs don’t re-send
    lastSavedRef.current[id] = {
      title: field === "title" ? value : lastSavedRef.current[id]?.title ?? "",
      description:
        field === "description"
          ? value
          : lastSavedRef.current[id]?.description ?? "",
    };

    // invalidate if you still need a refetch to sync other fields
    queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
  };

  const getCachedAssessment = (id: string) => assessmentCacheRef.current[id];

  const setCachedAssessment = (id: string, draft: AssessmentDraft) => {
    // ensure points & choices shape are present
    assessmentCacheRef.current[id] = {
      ...draft,
      questions: (draft.questions || []).map((q) => ({
        text: q.text,
        question_type: q.question_type || "mcq",
        explanation: q.explanation || "",
        // default defensively
        choices: (q.choices || []).map((c) => ({
          text: c.text,
          is_correct: !!c.is_correct,
        })),
        points: typeof (q as any).points === "number" ? (q as any).points : 1,
      })),
    };
  };

  function normalizeAssessmentFromServer(server: any): AssessmentDraft {
    const timeLimit =
      typeof server?.time_limit_mins === "number"
        ? server.time_limit_mins
        : typeof server?.time_limit === "number"
        ? server.time_limit
        : 10;

    const questions = Array.isArray(server?.questions) ? server.questions : [];

    return {
      title: server?.title ?? "",
      description: server?.description ?? "",
      type: server?.type === "exam" ? "exam" : "quiz",
      time_limit: Math.max(1, Number(timeLimit) || 10),
      passing_score: Math.max(
        0,
        Math.min(100, Number(server?.passing_score ?? 70))
      ),
      questions: questions.map((q: any) => ({
        text: String(q?.text ?? ""),
        question_type: (q?.question_type as "mcq") || "mcq",
        explanation: String(q?.explanation ?? ""),
        choices: Array.isArray(q?.choices)
          ? q.choices.map((c: any) => ({
              text: String(c?.text ?? ""),
              is_correct: !!c?.is_correct,
            }))
          : [],
        points: Number.isFinite(q?.points) ? Number(q.points) : 1,
      })),
    };
  }

  const fetchAssessmentByAnchor = async (
    anchorLessonId: string,
    preferType?: "quiz" | "exam"
  ): Promise<AssessmentDraft | null> => {
    const resp = await get(`${API_ENDPOINTS.exams}?lesson=${anchorLessonId}`);
    const list = resp?.data ?? resp?.results ?? resp ?? [];
    if (!Array.isArray(list) || !list.length) return null;
    const server =
      (preferType ? list.find((x: any) => x?.type === preferType) : null) ||
      list[0];
    const full = normalizeAssessmentFromServer(server);
    if (!Array.isArray(full.questions) || full.questions.length === 0)
      return null;
    return full;
  };

  // GET from read endpoints only → then PATCH to update endpoint
  const patchAssessmentField = async (
    id: string,
    field: string,
    value: string | number | boolean,
    anchorLessonId: string,
    preferType?: "quiz" | "exam"
  ) => {
    let full = getCachedAssessment(id);
    if (!full) {
      const fetched = await fetchAssessmentByAnchor(anchorLessonId, preferType);
      if (!fetched) {
        toast.error("Open the quiz/exam and save once before editing inline.");
        throw new Error("No complete assessment available for safe PATCH");
      }
      full = fetched;
      setCachedAssessment(id, full);
    }

    const merged: any = { ...full, [field]: value, lesson: anchorLessonId };
    if (merged.time_limit_mins && !merged.time_limit) {
      merged.time_limit = merged.time_limit_mins;
    }

    return debounceAssessments(String(id), async () => {
      await mutateExam({ id, payload: merged, lessonIdHint: anchorLessonId });
      setCachedAssessment(id, merged);
      toast.success("Saved");
    });
  };

  const addModule = async () => {
    try {
      const body = {
        course: courseId,
        title: `New Module ${modules.length + 1}`,
        description: "",
        order: modules.length + 1, // 1-based
      };
      await createSection(body);
      toast.success("New module added!");
      await queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    } catch (error: any) {
      handleErrorAlerts(error?.response?.data?.error);
    }
  };

  const updateLessonLocal = (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: (m.lessons || []).map((l) =>
                l.id === lessonId ? { ...l, ...updates } : l
              ),
            }
      )
    );
  };

  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);
  const [editingArticle, setEditingArticle] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState<{
    moduleId: string;
    lessonId: string;
  } | null>(null);

  // Assessment editing / preview
  const [editingAssessment, setEditingAssessment] = useState<{
    id: string;
    moduleId: string;
    type: "quiz" | "exam";
  } | null>(null);
  const [previewDraft, setPreviewDraft] = useState<AssessmentDraft | null>(
    null
  );

  const anchorIdForEditingAssessment = useMemo(() => {
    if (!editingAssessment) return null;
    const mod = modules.find((m) => m.id === editingAssessment.moduleId);
    if (!mod) return null;
    const idx = mod.lessons.findIndex((l) => l.id === editingAssessment.id);
    if (idx < 0) return null;
    return anchorAbove(mod.lessons as any, idx);
  }, [editingAssessment, modules]);

  // fetch exams/quiz list for the parent lesson, then pick the one we need
  const { data: examsByLessonResp } = useExamsByLesson(
    anchorIdForEditingAssessment ?? undefined
  );

  // Normalize returned list (array from the collection endpoint)
  const assessmentDetail = useMemo(() => {
    const arr =
      examsByLessonResp?.data ??
      examsByLessonResp?.results ??
      examsByLessonResp ??
      [];
    if (!Array.isArray(arr) || !arr.length) return null;
    const wantType = editingAssessment?.type;
    const byType = wantType ? arr.find((x: any) => x?.type === wantType) : null;
    return byType || arr[0];
  }, [examsByLessonResp, editingAssessment?.type]);

  const addContentLesson = (
    moduleId: string,
    type: "video" | "article" | "material"
  ) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const tempId = `tmp-${Date.now()}`;
        const stub: any = {
          id: tempId,
          _draft: true,
          title:
            type === "video"
              ? "New Video"
              : type === "article"
              ? "New Article"
              : "New Material",
          description: "",
          description_html: null,
          content_type: type,
          free_preview: false,
          order: (m.lessons?.length ?? 0) + 1, // 1-based
          url: "",
          string_file: null,
          duration_hours: null,
        };
        const lessons = [...(m.lessons || []), stub];

        // Open editor
        setTimeout(() => {
          if (type === "video")
            setEditingLesson({ moduleId, lessonId: tempId });
          if (type === "article")
            setEditingArticle({ moduleId, lessonId: tempId });
          if (type === "material")
            setUploadingMaterial({ moduleId, lessonId: tempId });
        }, 0);

        return { ...m, lessons };
      })
    );
  };

  const addAssessment = async (moduleId: string, type: "quiz" | "exam") => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const lastContentIndex =
      [...(mod.lessons || [])]
        .map((l, i) => ({ l, i }))
        .reverse()
        .find(({ l }) => isContent((l as any).content_type))?.i ?? -1;

    if (lastContentIndex < 0) {
      toast.error("Create a content lesson first");
      return;
    }

    const anchorId = mod.lessons[lastContentIndex].id;
    const title = nextAssessmentTitle(mod as any, type);

    try {
      const body = {
        title,
        type,
        lesson: anchorId,
        time_limit: 10,
        passing_score: 70,
        questions: [
          {
            text: "Sample question",
            question_type: "mcq",
            points: 1,
            explanation: "",
            choices: [
              { text: "Option 1", is_correct: true },
              { text: "Option 2", is_correct: false },
            ],
          },
        ],
      };
      const created = await createExam(body);
      const newId = created?.data?.id ?? created?.id;

      setCachedAssessment(newId, {
        title,
        description: "",
        type,
        time_limit: 10,
        passing_score: 70,
        questions: [
          {
            text: "Sample question",
            question_type: "mcq",
            explanation: "",
            choices: [
              { text: "Option 1", is_correct: true },
              { text: "Option 2", is_correct: false },
            ],
            points: 1,
          },
        ],
      });

      if (!newId) throw new Error("No id returned");

      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== moduleId) return m;
          const stub: any = {
            id: newId,
            title,
            description: "",
            description_html: null,
            content_type: type,
            order: lastContentIndex + 2,
          };
          const next = [...m.lessons];
          next.splice(lastContentIndex + 1, 0, stub);
          return { ...m, lessons: reindexOrders1Based(next) };
        })
      );

      toast.success(`${type === "quiz" ? "Quiz" : "Exam"} created`);
      invalidateAssessmentsCacheForLesson(anchorId);
    } catch (e: any) {
      const payload = e?.response?.data?.error;
      handleErrorAlerts(payload);
    }
  };

  const moveModule = (dragId: string, hoverId: string) => {
    setModules((prev) => {
      const d = prev.findIndex((m) => m.id === dragId);
      const h = prev.findIndex((m) => m.id === hoverId);
      if (d < 0 || h < 0 || d === h) return prev;
      const next = [...prev];
      const [dragged] = next.splice(d, 1);
      next.splice(h, 0, dragged);
      return next;
    });
  };

  const commitModulesOrder = async () => {
    const ops = modules
      .map((m, idx) => {
        if (m.order === idx + 1) return null;
        return mutateSection({
          id: m.id,
          payload: {
            order: idx + 1,
          },
        });
      })
      .filter(Boolean) as Promise<any>[];
    if (!ops.length) return;
    try {
      await Promise.all(ops);
      toast.success("Module order updated");
      await queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    } catch {
      toast.error("Failed to update module order");
      await queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    }
  };

  const moveLesson = (moduleId: string, dragId: string, hoverId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const lessons = [...m.lessons];
        let d = lessons.findIndex((l: any) => l.id === dragId);
        let h = lessons.findIndex((l: any) => l.id === hoverId);
        if (d < 0 || h < 0 || d === h) return m;

        // If dragging an assessment, convert to its anchor so you only move the group
        const dIsAssessment = isAssessment((lessons[d] as any)?.content_type);
        if (dIsAssessment) {
          for (let i = d - 1; i >= 0; i--) {
            if (isContent((lessons[i] as any)?.content_type)) {
              d = i;
              break;
            }
          }
        }

        // If hovering over an assessment, normalize drop target to its anchor content
        const hIsAssessment = isAssessment((lessons[h] as any)?.content_type);
        if (hIsAssessment) {
          for (let i = h - 1; i >= 0; i--) {
            if (isContent((lessons[i] as any)?.content_type)) {
              h = i;
              break;
            }
          }
        }

        if (d === h) return m;

        // Determine the group slice: anchor content + all contiguous assessments until next content
        const start = d;
        if (!isContent((lessons[start] as any)?.content_type)) return m;
        let endExclusive = start + 1;
        while (
          endExclusive < lessons.length &&
          isAssessment((lessons[endExclusive] as any)?.content_type)
        ) {
          endExclusive++;
        }

        // Extract the group
        const group = lessons.slice(start, endExclusive);
        lessons.splice(start, group.length);

        // After removal, target index may shift
        if (start < h) {
          h -= group.length;
        }

        // Insert group before the hover anchor
        lessons.splice(h, 0, ...group);

        return { ...m, lessons };
      })
    );
  };

  const commitLessonOrderAndAnchors = async (moduleId: string) => {
    return debounceCommit(moduleId, async () => {
      const mod = modules.find((m) => m.id === moduleId);
      if (!mod) return;

      try {
        await saveSectionLessons(moduleId);
      } catch {
        toast.error("Failed to save lesson order");
        await queryClient.invalidateQueries({
          queryKey: qk.modules(courseId),
        });
        return;
      }

      const patches: Promise<any>[] = [];
      const affectedAnchors = new Set<string>();

      const nextLessons = [...(mod.lessons || [])];
      nextLessons.forEach((l, idx) => {
        if (!isAssessment((l as any).content_type)) return;
        const newAnchor = anchorAbove(nextLessons as any, idx);
        const oldAnchor = (l as any)._anchor;
        if (!newAnchor || newAnchor === oldAnchor) return;
        patches.push(
          mutateExam({
            id: l.id,
            payload: { lesson: newAnchor },
            lessonIdHint: newAnchor,
          })
        );
        if (oldAnchor) affectedAnchors.add(oldAnchor);
        affectedAnchors.add(newAnchor);
        (l as any)._anchor = newAnchor;
      });

      if (patches.length) {
        try {
          await Promise.allSettled(patches);
          affectedAnchors.forEach((a) =>
            invalidateAssessmentsCacheForLesson(a)
          );
          toast.success("Attachments updated");
        } catch {
          toast.error("Failed to update some attachments");
        }
      }
    });
  };

  const deleteModule = async (id: string) => {
    try {
      await removeSection({ id });
      toast.success("Module deleted");
      await queryClient.invalidateQueries({
        queryKey: qk.modules(courseId),
      });
    } catch (e: any) {
      const payload = e?.response?.data?.error;
      handleErrorAlerts(payload);
    }
  };

  const deleteContentLesson = async (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: reindexOrders1Based(
                (m.lessons || []).filter((l) => l.id !== lessonId)
              ),
            }
      )
    );
    try {
      await saveSectionLessons(moduleId);
      toast.success("Lesson removed");
      await commitLessonOrderAndAnchors(moduleId);
    } catch {
      toast.error("Failed to remove lesson");
      await queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    }
  };

  const deleteExamOrQuiz = async (id: string, moduleId: string) => {
    try {
      const mod = modules.find((m) => m.id === moduleId);
      let anchorIdForDeleted: string | null = null;
      if (mod) {
        const idx = mod.lessons.findIndex((l: any) => l.id === id);
        if (idx >= 0) {
          anchorIdForDeleted = anchorAbove(mod.lessons as any, idx);
        }
      }
      await removeExam({ id, lessonIdHint: anchorIdForDeleted ?? undefined });
      setModules((prev) =>
        prev.map((m) =>
          m.id !== moduleId
            ? m
            : { ...m, lessons: m.lessons.filter((l) => l.id !== id) }
        )
      );
      if (anchorIdForDeleted)
        invalidateAssessmentsCacheForLesson(anchorIdForDeleted);

      toast.success("Assessment deleted");
    } catch (e: any) {
      const payload = e?.response?.data?.error;
      handleErrorAlerts(payload);
    }
  };

  return (
    <div className="sm:space-y-6 space-y-3">
      <div className="bg-white rounded-xl shadow-sm sm:p-8 p-2">
        <div className="flex sm:items-center items-start sm:flex-row flex-col gap-4 justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Curriculum</h2>
          <button
            type="button"
            onClick={addModule}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading…</div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Start by adding modules to structure your course content.
            </p>
            <button
              type="button"
              onClick={addModule}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Add your first module
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((module, mIndex) => {
              const hasAnyContent = (module.lessons ?? []).some((l) =>
                isContent((l as any).content_type)
              );
              return (
                <ModuleItem
                  key={module.id}
                  module={{ ...module, order: mIndex + 1 }}
                  index={mIndex}
                  moveModule={moveModule}
                  onDragEnd={commitModulesOrder}
                >
                  <div className="border border-gray-200 rounded-lg overflow-visible">
                    <div className="sm:p-4 p-2 bg-gray-50 border-b border-gray-200 relative">
                      <div className="flex sm:items-center items-start sm:flex-row flex-col gap-4 justify-between">
                        <div className="flex items-center space-x-3">
                          <div>
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <input
                              type="text"
                              value={module.title ?? ""}
                              onChange={(e) =>
                                setModules((prev) =>
                                  prev.map((m) =>
                                    m.id === module.id
                                      ? { ...m, title: e.target.value }
                                      : m
                                  )
                                )
                              }
                              onBlur={(e) =>
                                patchModuleField(
                                  module.id,
                                  "title",
                                  e.target.value
                                ).catch(() => {})
                              }
                              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                            />
                            <input
                              type="text"
                              value={module.description ?? ""}
                              onChange={(e) =>
                                setModules((prev) =>
                                  prev.map((m) =>
                                    m.id === module.id
                                      ? { ...m, description: e.target.value }
                                      : m
                                  )
                                )
                              }
                              onBlur={(e) =>
                                patchModuleField(
                                  module.id,
                                  "description",
                                  e.target.value
                                ).catch(() => {})
                              }
                              placeholder="Module description"
                              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 sm:max-w-full max-w-60 mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex sm:self-center self-end items-center space-x-2">
                          <div className="relative" ref={setMenuRef(module.id)}>
                            <button
                              type="button"
                              aria-label="Add"
                              onClick={() =>
                                setOpenMenuFor((id) =>
                                  id === module.id ? null : module.id
                                )
                              }
                              className="text-purple-600 hover:text-purple-800 p-2 rounded-lg border border-purple-200 hover:border-purple-300"
                              title="Add"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {openMenuFor === module.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <button
                                  type="button"
                                  onClick={() => {
                                    addContentLesson(module.id, "video");
                                    setOpenMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Video
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    addContentLesson(module.id, "article");
                                    setOpenMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Article
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    addContentLesson(module.id, "material");
                                    setOpenMenuFor(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Material
                                </button>
                                <div className="my-1 border-t border-gray-200" />
                                <button
                                  type="button"
                                  disabled={!hasAnyContent}
                                  onClick={() => {
                                    if (!hasAnyContent) return;
                                    addAssessment(module.id, "quiz");
                                    setOpenMenuFor(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 flex items-center ${
                                    hasAnyContent
                                      ? "hover:bg-gray-50"
                                      : "opacity-50 cursor-not-allowed"
                                  }`}
                                  title={
                                    hasAnyContent
                                      ? "Attach a Quiz to the last content lesson"
                                      : "Create a lesson first"
                                  }
                                >
                                  <HelpCircle className="w-4 h-4 mr-2" />
                                  Quiz
                                </button>
                                <button
                                  type="button"
                                  disabled={!hasAnyContent}
                                  onClick={() => {
                                    if (!hasAnyContent) return;
                                    addAssessment(module.id, "exam");
                                    setOpenMenuFor(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 flex items-center rounded-b-lg ${
                                    hasAnyContent
                                      ? "hover:bg-gray-50"
                                      : "opacity-50 cursor-not-allowed"
                                  }`}
                                  title={
                                    hasAnyContent
                                      ? "Attach an Exam to the last content lesson"
                                      : "Create a lesson first"
                                  }
                                >
                                  <Award className="w-4 h-4 mr-2" />
                                  Exam
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteModule(module.id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                            title="Delete Module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {(module.lessons?.length ?? 0) > 0 && (
                      <div className="p-4 space-y-2">
                        {module.lessons!.map((lesson, lIndex) => {
                          const isContentLesson = isContent(
                            (lesson as any).content_type
                          );
                          const videoUrlPreview = (lesson as any)?.url || "";

                          return (
                            <LessonItem
                              key={lesson.id}
                              moduleId={module.id}
                              lesson={lesson}
                              index={lIndex}
                              moveLesson={moveLesson}
                              onDragEnd={() =>
                                commitLessonOrderAndAnchors(module.id)
                              }
                              canDrag={isContentLesson}
                            >
                              <div className="flex sm:items-center items-start sm:flex-row flex-col sm:gap-0 gap-4 justify-between sm:p-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3 w-full">
                                  <div>
                                    {isContentLesson ? (
                                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                    ) : (
                                      <div className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    {isContentLesson ? (
                                      (lesson as any).content_type ===
                                      "video" ? (
                                        <Video className="w-4 h-4" />
                                      ) : (lesson as any).content_type ===
                                        "article" ? (
                                        <FileText className="w-4 h-4" />
                                      ) : (
                                        <Upload className="w-4 h-4" />
                                      )
                                    ) : (lesson as any).content_type ===
                                      "quiz" ? (
                                      <HelpCircle className="w-4 h-4" />
                                    ) : (
                                      <Award className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={(lesson as any).title}
                                      onChange={(e) =>
                                        updateLessonLocal(
                                          module.id,
                                          lesson.id,
                                          { title: e.target.value } as any
                                        )
                                      }
                                      onBlur={async (e) => {
                                        if (!isContentLesson) {
                                          const anchor = anchorAbove(
                                            module.lessons as any,
                                            lIndex
                                          );
                                          try {
                                            await patchAssessmentField(
                                              (lesson as any).id,
                                              "title",
                                              e.target.value,
                                              anchor ?? "",
                                              (lesson as any).content_type as
                                                | "quiz"
                                                | "exam"
                                            );
                                          } catch {
                                            //
                                          }
                                          return;
                                        }
                                        try {
                                          await saveSectionLessons(module.id);
                                          toast.success("Saved");
                                        } catch {
                                          //
                                        }
                                      }}
                                      className="font-medium max-w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                    />
                                    <div className="text-sm text-gray-500 flex sm:items-center items-start sm:flex-row flex-col gap-2">
                                      <span className="inline-flex items-center flex-wrap">
                                        {isContentLesson &&
                                        (lesson as any).content_type ===
                                          "video" ? (
                                          <>
                                            <Link className="w-3 h-3 mr-1" />
                                            {videoUrlPreview
                                              ? String(videoUrlPreview).slice(
                                                  0,
                                                  20
                                                )
                                              : "No URL"}
                                          </>
                                        ) : null}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 sm:self-center self-end">
                                  {isContentLesson ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteContentLesson(
                                            module.id,
                                            lesson.id
                                          )
                                        }
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>

                                      {(lesson as any).content_type ===
                                        "video" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingLesson({
                                              moduleId: module.id,
                                              lessonId: lesson.id,
                                            })
                                          }
                                          className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                          title="Edit Video"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}

                                      {(lesson as any).content_type ===
                                        "article" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingArticle({
                                              moduleId: module.id,
                                              lessonId: lesson.id,
                                            })
                                          }
                                          className="p-1 text-green-400 hover:text-green-600 transition-colors"
                                          title="Edit Article"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}

                                      {(lesson as any).content_type ===
                                        "material" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setUploadingMaterial({
                                              moduleId: module.id,
                                              lessonId: lesson.id,
                                            })
                                          }
                                          className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
                                          title="Upload Material"
                                        >
                                          <Upload className="w-4 h-4" />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingAssessment({
                                            id: lesson.id,
                                            moduleId: module.id,
                                            type: (lesson as any)
                                              .content_type as "quiz" | "exam",
                                          })
                                        }
                                        className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteExamOrQuiz(lesson.id, module.id)
                                        }
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </LessonItem>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ModuleItem>
              );
            })}
          </div>
        )}
      </div>

      {/* Video */}
      {editingLesson && (
        <EditLesson
          modules={modules}
          editingLesson={editingLesson}
          setEditingLesson={setEditingLesson}
          updateLesson={(mId, lId, up) =>
            updateLessonLocal(mId, lId, up as any)
          }
          onCancel={() => {
            const mod = modules.find((m) => m.id === editingLesson.moduleId);
            const les = mod?.lessons.find(
              (l) => l.id === editingLesson.lessonId
            );
            if (les && String(les.id).startsWith("tmp-")) {
              setModules((prev) =>
                prev.map((m) =>
                  m.id !== editingLesson.moduleId
                    ? m
                    : {
                        ...m,
                        lessons: m.lessons.filter((l) => l.id !== les.id),
                      }
                )
              );
            }
            setEditingLesson(null);
          }}
          onSave={async () => {
            try {
              const mod = modules.find((m) => m.id === editingLesson.moduleId)!;
              const nextLessons = (mod.lessons ?? []).map((l) =>
                l.id === editingLesson.lessonId ? { ...l, _draft: false } : l
              );

              setModules((prev) =>
                prev.map((m) =>
                  m.id !== mod.id ? m : { ...m, lessons: nextLessons }
                )
              );

              await saveSectionLessons(mod.id, nextLessons);
              toast.success("Video saved");
            } finally {
              setEditingLesson(null);
            }
          }}
        />
      )}

      {/* Article */}
      {editingArticle && (
        <EditArticle
          modules={modules}
          editingArticle={editingArticle}
          setEditingArticle={setEditingArticle}
          updateLesson={(mId, lId, up) =>
            updateLessonLocal(mId, lId, up as any)
          }
          onCancel={() => {
            const mod = modules.find((m) => m.id === editingArticle.moduleId);
            const les = mod?.lessons.find(
              (l) => l.id === editingArticle.lessonId
            );
            if (les && String(les.id).startsWith("tmp-")) {
              setModules((prev) =>
                prev.map((m) =>
                  m.id !== editingArticle.moduleId
                    ? m
                    : {
                        ...m,
                        lessons: m.lessons.filter((l) => l.id !== les.id),
                      }
                )
              );
            }
            setEditingArticle(null);
          }}
          onSave={async () => {
            try {
              const mod = modules.find(
                (m) => m.id === editingArticle.moduleId
              )!;
              const nextLessons = (mod.lessons ?? []).map((l) =>
                l.id === editingArticle.lessonId ? { ...l, _draft: false } : l
              );

              setModules((prev) =>
                prev.map((m) =>
                  m.id !== mod.id ? m : { ...m, lessons: nextLessons }
                )
              );

              await saveSectionLessons(mod.id, nextLessons);
              toast.success("Article saved");
            } finally {
              setEditingArticle(null);
            }
          }}
        />
      )}

      {/* Material */}
      {uploadingMaterial && (
        <UploadingMaterial
          modules={modules}
          setUploadingMaterial={setUploadingMaterial}
          updateLesson={(mId, lId, up) =>
            updateLessonLocal(mId, lId, up as any)
          }
          uploadingMaterial={uploadingMaterial}
          onCancel={() => {
            const mod = modules.find(
              (m) => m.id === uploadingMaterial.moduleId
            );
            const les = mod?.lessons.find(
              (l) => l.id === uploadingMaterial.lessonId
            );
            if (les && String(les.id).startsWith("tmp-")) {
              setModules((prev) =>
                prev.map((m) =>
                  m.id !== uploadingMaterial.moduleId
                    ? m
                    : {
                        ...m,
                        lessons: m.lessons.filter((l) => l.id !== les.id),
                      }
                )
              );
            }
            setUploadingMaterial(null);
          }}
          onSave={async () => {
            try {
              const mod = modules.find(
                (m) => m.id === uploadingMaterial.moduleId
              )!;
              const nextLessons = (mod.lessons ?? []).map((l) =>
                l.id === uploadingMaterial.lessonId
                  ? { ...l, _draft: false }
                  : l
              );

              setModules((prev) =>
                prev.map((m) =>
                  m.id !== mod.id ? m : { ...m, lessons: nextLessons }
                )
              );

              await saveSectionLessons(mod.id, nextLessons);
              toast.success("Material saved");
            } finally {
              setUploadingMaterial(null);
            }
          }}
        />
      )}

      {/* Quiz / Exam Builder & Preview */}
      {editingAssessment && (
        <Modal
          isOpen={!!editingAssessment}
          onClose={() => setEditingAssessment(null)}
          title={
            editingAssessment?.type === "exam" ? "Exam Builder" : "Quiz Builder"
          }
          size="xl"
        >
          <QuizBuilder
            initialQuiz={assessmentDetail ?? { type: editingAssessment?.type }}
            onTitleChange={(t) =>
              updateLessonLocal(
                editingAssessment.moduleId,
                editingAssessment.id,
                { title: t } as any
              )
            }
            onSave={async (draft) => {
              try {
                await mutateExam({
                  id: editingAssessment.id,
                  payload: {
                    ...draft,
                    type: editingAssessment.type,
                    lesson: anchorIdForEditingAssessment,
                    time_limit: draft.time_limit,
                  },
                  lessonIdHint: anchorIdForEditingAssessment ?? undefined,
                });
                // cache the full draft we just saved
                setCachedAssessment(editingAssessment.id, draft);

                updateLessonLocal(
                  editingAssessment.moduleId,
                  editingAssessment.id,
                  { title: draft.title } as any
                );

                if (anchorIdForEditingAssessment) {
                  invalidateAssessmentsCacheForLesson(
                    anchorIdForEditingAssessment
                  );
                }

                toast.success("Saved");
                // if you still keep the old "exams-by-lesson" read somewhere, keep this too:
                queryClient.invalidateQueries({
                  queryKey: ["exams-by-lesson", anchorIdForEditingAssessment],
                });
              } catch {
                toast.error("Failed to save");
              }
            }}
            onPreview={(draft) => setPreviewDraft(draft)}
            onClose={() => setEditingAssessment(null)}
          />
        </Modal>
      )}

      {previewDraft && (
        <Modal
          isOpen={!!previewDraft}
          onClose={() => setPreviewDraft(null)}
          title="Preview"
          size="xl"
        >
          <QuizPreview
            quiz={{
              title: previewDraft.title,
              description: previewDraft.description,
              questions: previewDraft.questions.map((q) => ({
                text: q.text,
                points: q.points,
                question_type: q.question_type,
                explanation: q.explanation,
                choices: q.choices,
              })),
              totalTimeLimit: (previewDraft.time_limit || 0) * 60,
            }}
            onEdit={() => setPreviewDraft(null)}
            onClose={() => setPreviewDraft(null)}
          />
        </Modal>
      )}
    </div>
  );
}
