// src/components/course/builder/createSectionForm.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Edit,
  FileText,
  GripVertical,
  HelpCircle,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useCustomQuery } from "../../../hooks/useQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../../../utils/constants";
import handleErrorAlerts from "../../../utils/showErrorMessages";
import toast from "react-hot-toast";

import EditLesson from "./EditLesson";
import EditArticle from "./EditArticle";
import UploadingMaterial from "./UploadingMaterial";

import {
  isContent,
  nextAssessmentTitle,
  reindexOrders1Based,
} from "../../../utils/courseBuilder";
import { makeKeyedDebouncer } from "../../../utils/netCoalesce";
import QuizBuilder, { AssessmentDraft } from "../../quizzes/QuizBuilder";
import QuizPreview from "../../quizzes/QuizPreview";
import { AxiosResponse } from "axios";

import ModuleItem from "./ModuleItem";
import LessonItem from "./LessonItem";
import Modal from "../../reusable-components/Modal";
import { useExamsByLesson } from "../../../hooks/useExamsByLesson";
import { invalidateLessonExams, qk } from "../../../utils/builderQueries";
import { useTranslation } from "react-i18next";

// NEW: dedicated lesson API thin helpers
import {
  createLessonApi,
  patchLessonApi,
  deleteLessonApi,
} from "../../../utils/lessonApi";

// const debounceLessons = makeKeyedDebouncer(450);
const debounceCommit = makeKeyedDebouncer(450);

export default function CreateSectionsForm({ courseId }: { courseId: string }) {
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Track last committed values to avoid no-op PATCH on blur
  const lastSavedModuleRef = useRef<
    Record<string, { title: string; description: string }>
  >({});
  const lastSavedLessonRef = useRef<
    Record<
      string,
      {
        title?: string;
        description?: string;
        url?: string;
        duration_hours?: number | null;
      }
    >
  >({});

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setMenuRef =
    (id: string) =>
    (el: HTMLDivElement | null): void => {
      menuRefs.current[id] = el;
    };

  // DnD baselines
  const dragBaselineRef = useRef<Record<string, string[]>>({});
  const lastCommittedLessonOrderRef = useRef<Record<string, string[]>>({});

  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x, i) => x === b[i]);

  const { t } = useTranslation("courseBuilder");

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
    `${API_ENDPOINTS.modules}?course=${courseId}&include_lessons=true`,
    qk.modules(courseId),
    undefined,
    !!courseId
  );
  const serverModules: Module[] = useMemo(
    () => modulesData?.data?.data ?? [],
    [modulesData]
  );

  // Local editable state
  const [modules, setModules] = useState<Module[]>(serverModules);

  // Editing states
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
    id: string; // lessonId
    moduleId: string;
    type: "quiz" | "exam";
  } | null>(null);
  const [previewDraft, setPreviewDraft] = useState<AssessmentDraft | null>(
    null
  );

  const isEditingAny = !!(
    editingLesson ||
    editingArticle ||
    uploadingMaterial ||
    editingAssessment
  );

  // Seed local state & snapshot from server — but don't override while any editor is open
  useEffect(() => {
    if (isEditingAny) return;
    const next = Array.isArray(serverModules) ? serverModules : [];
    setModules(next);

    // seed last committed order snapshot from server
    const map: Record<string, string[]> = {};
    next.forEach((m) => {
      map[m.id] = (m.lessons || []).map((l: any) => l.id);
    });
    lastCommittedLessonOrderRef.current = map;

    // seed module last-saved snapshot
    const mSnap: Record<string, { title: string; description: string }> = {};
    for (const m of next || []) {
      mSnap[m.id] = { title: m.title ?? "", description: m.description ?? "" };
      for (const l of m.lessons || []) {
        lastSavedLessonRef.current[l.id] = {
          title: l.title,
          description: l.description ?? undefined,
          url: l.url ?? undefined,
          duration_hours: l.duration_hours ?? null,
        };
      }
    }
    lastSavedModuleRef.current = mSnap;
  }, [serverModules, isEditingAny]);

  // ---- Modules (sections) mutations (title/description/order) ----
  const { mutateAsync: patchModule } = useMutation<
    AxiosResponse<any>,
    any,
    { id: string; payload: any }
  >({
    mutationFn: async ({ id, payload }) => {
      // keep your existing endpoint for module (section) updates
      const { patch } = await import("../../../api");
      return patch(`${API_ENDPOINTS.updateSection}${id}/`, payload);
    },
    onError: (e) => handleErrorAlerts(e.response?.data?.error),
  });

  const { mutateAsync: removeSection } = useMutation<
    AxiosResponse<any>,
    any,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      const { remove } = await import("../../../api");
      return remove(`${API_ENDPOINTS.deleteSection}${id}/`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) }),
    onError: (e) => handleErrorAlerts(e.response?.data?.error),
  });

  const patchModuleField = async (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    const last = lastSavedModuleRef.current[id]?.[field] ?? "";
    if (String(last) === String(value)) return; // no-op
    await patchModule({ id, payload: { [field]: value } });
    toast.success(t("createSections.saved"));
    lastSavedModuleRef.current[id] = {
      title:
        field === "title" ? value : lastSavedModuleRef.current[id]?.title ?? "",
      description:
        field === "description"
          ? value
          : lastSavedModuleRef.current[id]?.description ?? "",
    };
    // only invalidate modules list (light)
    queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
  };

  // ---- Lessons (new endpoints) ----
  const createLesson = async (
    sectionId: string,
    base: Partial<Lesson>
  ): Promise<Lesson> => {
    const res = await createLessonApi({
      section_id: sectionId,
      title: base.title ?? "",
      description: base.description ?? "",
      description_html: base.description_html ?? null,
      content_type: base.content_type!,
      order: base.order ?? 1,
      url: base.url ?? null,
      // string_file: base.string_file ?? null,
      duration_hours: base.duration_hours ?? null,
      free_preview: !!base.free_preview,
    });
    const lesson: Lesson = res?.data?.data ?? res?.data ?? res;
    // snapshot last saved
    lastSavedLessonRef.current[lesson.id] = {
      title: lesson.title,
      description: lesson.description ?? undefined,
      url: lesson.url ?? undefined,
      duration_hours: lesson.duration_hours ?? null,
    };
    return lesson;
  };

  const patchLesson = async (lessonId: string, payload: Partial<Lesson>) => {
    // change-detect simple fields to avoid no-op patches
    const snap = lastSavedLessonRef.current[lessonId] || {};
    const nextSnap = { ...snap };
    const toSend: any = {};

    (
      [
        "title",
        "description",
        "url",
        "duration_hours",
        "description_html",
        "free_preview",
        "order",
        "content_type",
        // "string_file",
      ] as const
    ).forEach((k) => {
      // only include if provided in payload AND changed vs snapshot
      if (payload[k as keyof Lesson] !== undefined) {
        const v = payload[k as keyof Lesson] as any;
        if (snap[k as keyof typeof snap] !== v) {
          toSend[k] = v;
          (nextSnap as any)[k] = v;
        }
      }
    });

    if (Object.keys(toSend).length === 0) return; // nothing changed

    await patchLessonApi(lessonId, toSend);
    lastSavedLessonRef.current[lessonId] = nextSnap;
  };

  const deleteLesson = async (lessonId: string) => {
    await deleteLessonApi(lessonId);
    delete lastSavedLessonRef.current[lessonId];
  };

  // Local state helpers
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
                l.id === lessonId ? ({ ...l, ...updates } as Lesson) : l
              ),
            }
      )
    );
  };

  // add module (section)
  const { mutateAsync: createSection } = useMutation<
    AxiosResponse<any>,
    any,
    any
  >({
    mutationFn: async (body) => {
      const { post } = await import("../../../api");
      return post(API_ENDPOINTS.createSection, body);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) }),
    onError: (e) => handleErrorAlerts(e.response?.data?.error),
  });

  const addModule = async () => {
    try {
      const body = {
        course: courseId,
        title: t("createSections.newModuleTitle", {
          l: (modules?.length ?? 0) + 1,
        }),
        description: "",
        order: (modules?.length ?? 0) + 1,
      };
      await createSection(body);
      toast.success(t("createSections.addModuleSuccess"));
    } catch (error: any) {
      handleErrorAlerts(error?.response?.data?.error);
    }
  };

  // add content lessons (POST immediately with defaults, then open modal)
  const addContentLesson = async (
    moduleId: string,
    type: "video" | "article" | "material"
  ) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const tempId = `tmp-${Date.now()}`;
    const optimistic: Lesson = {
      id: tempId,
      title:
        type === "video"
          ? t("createSections.newVideoTitle")
          : type === "article"
          ? t("createSections.newArticleTitle")
          : t("createSections.newMaterialTitle"),
      description: "",
      description_html: type === "article" ? "<p></p>" : null,
      content_type: type,
      free_preview: false,
      order: (mod.lessons?.length ?? 0) + 1,
      url: "",
      // string_file: null,
      duration_hours: null,
      file: null as any,
      watched: false,
      section: moduleId,
    };

    // optimistic UI
    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : { ...m, lessons: [...(m.lessons || []), optimistic] }
      )
    );

    try {
      const created = await createLesson(moduleId, optimistic);
      // replace temp with real
      setModules((prev) =>
        prev.map((m) =>
          m.id !== moduleId
            ? m
            : {
                ...m,
                lessons: (m.lessons || []).map((l) =>
                  l.id === tempId ? ({ ...created } as Lesson) : l
                ),
              }
        )
      );

      // Refresh cache
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });

      // open editor
      setTimeout(() => {
        if (type === "video")
          setEditingLesson({ moduleId, lessonId: created.id });
        if (type === "article")
          setEditingArticle({ moduleId, lessonId: created.id });
        if (type === "material")
          setUploadingMaterial({ moduleId, lessonId: created.id });
      }, 0);
    } catch (e: any) {
      handleErrorAlerts(e?.response?.data?.error);
      // rollback optimistic
      setModules((prev) =>
        prev.map((m) =>
          m.id !== moduleId
            ? m
            : {
                ...m,
                lessons: (m.lessons || []).filter((l) => l.id !== tempId),
              }
        )
      );
    }
  };

  const addAssessment = async (moduleId: string, type: "quiz" | "exam") => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const title = nextAssessmentTitle(mod as any, type);
    // NOTE: assessments still flow through exams endpoints; store as lesson row first
    const optimistic: Lesson = {
      id: `tmp-${Date.now()}`,
      title,
      description: "",
      description_html: null,
      content_type: type,
      free_preview: false,
      order: (mod.lessons?.length ?? 0) + 1,
      url: "",
      // string_file: null,
      duration_hours: null,
      file: null as any,
      watched: false,
      section: moduleId,
    };

    setModules((prev) =>
      prev.map((m) =>
        m.id !== moduleId
          ? m
          : {
              ...m,
              lessons: reindexOrders1Based([...(m.lessons || []), optimistic]),
            }
      )
    );

    try {
      const created = await createLesson(moduleId, optimistic);
      setModules((prev) =>
        prev.map((m) =>
          m.id !== moduleId
            ? m
            : {
                ...m,
                lessons: (m.lessons || []).map((l) =>
                  l.id === optimistic.id ? ({ ...created } as Lesson) : l
                ),
              }
        )
      );
      
      // Refresh cache
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
      
      toast.success(
        `${
          type === "quiz" ? t("createSections.quiz") : t("createSections.exam")
        } ${t("createSections.created")}`
      );
      setEditingAssessment({ id: created.id, moduleId, type });
    } catch {
      toast.error(t("createSections.failedUpdateSomeAttachments"));
      // rollback optimistic
      setModules((prev) =>
        prev.map((m) =>
          m.id !== moduleId
            ? m
            : {
                ...m,
                lessons: (m.lessons || []).filter(
                  (l) => l.id !== optimistic.id
                ),
              }
        )
      );
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
    // Only PATCH changed modules' order (silent)
    const ops = modules
      .map((m, idx) => {
        if (m.order === idx + 1) return null;
        return patchModule({ id: m.id, payload: { order: idx + 1 } });
      })
      .filter(Boolean) as Promise<any>[];
    if (!ops.length) return;
    try {
      await Promise.all(ops);
      toast.success(t("createSections.commitModulesOrderSuccess"));
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    } catch {
      toast.error(t("createSections.commitModulesOrderError"));
    }
  };

  const moveLesson = (moduleId: string, dragId: string, hoverId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;

        // Record baseline once per drag gesture
        if (!dragBaselineRef.current[moduleId]) {
          dragBaselineRef.current[moduleId] = (m.lessons || []).map(
            (l: any) => l.id
          );
        }

        const lessons = [...m.lessons];
        const d = lessons.findIndex((l: any) => l.id === dragId);
        const h = lessons.findIndex((l: any) => l.id === hoverId);
        if (d < 0 || h < 0 || d === h) return m;

        const [dragged] = lessons.splice(d, 1);
        lessons.splice(h, 0, dragged);

        return { ...m, lessons: reindexOrders1Based(lessons) };
      })
    );
  };

  const commitLessonOrder = async (moduleId: string) => {
    return debounceCommit(moduleId, async () => {
      const mod = modules.find((m) => m.id === moduleId);
      if (!mod) return;

      const baseline =
        dragBaselineRef.current[moduleId] ??
        lastCommittedLessonOrderRef.current[moduleId];
      const currentIds = (mod.lessons || []).map((l: any) => l.id);

      // Clear the live baseline after drag ends
      delete dragBaselineRef.current[moduleId];

      // If nothing changed, skip
      if (baseline && arraysEqual(baseline, currentIds)) return;

      // Only PATCH lessons whose order changed
      const ops: Promise<any>[] = [];
      (mod.lessons || []).forEach((l, idx) => {
        if (l.order !== idx + 1) {
          ops.push(
            patchLesson(l.id, { order: idx + 1 }).catch(() => {
              /* swallow per-lesson order errors */
            })
          );
        }
      });

      if (!ops.length) return;

      try {
        await Promise.all(ops);
        lastCommittedLessonOrderRef.current[moduleId] = currentIds;
        toast.success(t("createSections.commitModulesOrderSuccess"));
      } catch {
        toast.error(t("createSections.commitModulesOrderError"));
      } finally {
        // Lightweight: refresh modules to ensure consistency if server transforms anything
        queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
      }
    });
  };

  const deleteModule = async (id: string) => {
    try {
      await removeSection({ id });
      toast.success(t("createSections.moduleDeleted"));
    } catch (e: any) {
      handleErrorAlerts(e?.response?.data?.error);
    }
  };

  const deleteContentLesson = async (moduleId: string, lessonId: string) => {
    // optimistic remove
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
      await deleteLesson(lessonId);
      toast.success(t("createSections.lessonRemoved"));
      await commitLessonOrder(moduleId);
    } catch {
      toast.error(t("createSections.failedRemoveLesson"));
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    }
  };

  const deleteExamOrQuiz = async (id: string, moduleId: string) => {
    // assessments as lessons are also deletable via lesson API
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const nextLessons = reindexOrders1Based(
      (mod.lessons || []).filter((l) => l.id !== id)
    );

    setModules((prev) =>
      prev.map((m) => (m.id !== moduleId ? m : { ...m, lessons: nextLessons }))
    );

    try {
      await deleteLesson(id);
      toast.success(t("createSections.assessmentDeleted"));
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    } catch (e: any) {
      handleErrorAlerts(e?.response?.data?.error);
      queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    }
  };

  //  fetch exam/quiz by LESSON id (for builder initialQuiz)
  const { data: examResp } = useExamsByLesson(
    editingAssessment?.id ?? undefined
  );
  const assessmentDetail = useMemo(() => {
    const obj = examResp?.data ?? examResp ?? null;
    return obj && typeof obj === "object" ? obj : null;
  }, [examResp]);

  return (
    <div className="sm:space-y-6 space-y-3">
      <div className="bg-white rounded-xl shadow-sm sm:p-8 p-2">
        <div className="flex sm:items-center items-start sm:flex-row flex-col gap-4 justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("createSections.curriculum")}
          </h2>
          <button
            type="button"
            onClick={addModule}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createSections.addModule")}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            {t("createSections.loading")}
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t("createSections.title")}</p>
            <button
              type="button"
              onClick={addModule}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t("createSections.addYourFirstModule")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((module, mIndex) => (
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
                            placeholder={t(
                              "createSections.moduleDescPlaceholder"
                            )}
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
                            title={t("createSections.add")}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {openMenuFor === module.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <button
                                type="button"
                                onClick={() => {
                                  void addContentLesson(module.id, "video");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                {t("createSections.video")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void addContentLesson(module.id, "article");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                {t("createSections.article")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void addContentLesson(module.id, "material");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {t("createSections.material")}
                              </button>
                              <div className="my-1 border-t border-gray-200" />
                              {/* Quiz & Exam */}
                              <button
                                type="button"
                                onClick={() => {
                                  void addAssessment(module.id, "quiz");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full text-left px-4 py-2 flex items-center hover:bg-gray-50"
                                title={t("createSections.createQuizLesson")}
                              >
                                <HelpCircle className="w-4 h-4 mr-2" />
                                {t("createSections.quiz")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void addAssessment(module.id, "exam");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full text-left px-4 py-2 flex items-center rounded-b-lg hover:bg-gray-50"
                                title={t("createSections.createExamLesson")}
                              >
                                <Award className="w-4 h-4 mr-2" />
                                {t("createSections.exam")}
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteModule(module.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                          title={t("createSections.deleteModule")}
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
                            onDragEnd={() => commitLessonOrder(module.id)}
                            canDrag={true}
                          >
                            <div className="flex sm:items-center items-start sm:flex-row flex-col sm:gap-0 gap-4 justify-between sm:p-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-3 w-full">
                                <div>
                                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                </div>
                                <div>
                                  {isContentLesson ? (
                                    (lesson as any).content_type === "video" ? (
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
                                      updateLessonLocal(module.id, lesson.id, {
                                        title: e.target.value,
                                      } as any)
                                    }
                                    onBlur={async (e) => {
                                      try {
                                        const newTitle = e.target.value;
                                        await patchLesson(lesson.id, {
                                          title: newTitle,
                                        });
                                        toast.success(
                                          t("createSections.saved")
                                        );
                                      } catch {
                                        /* ignore */
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
                                          <LinkIcon className="w-3 h-3 mr-1" />
                                          {videoUrlPreview
                                            ? String(videoUrlPreview).slice(
                                                0,
                                                20
                                              )
                                            : t("createSections.noURL")}
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
                                      title={t("createSections.delete")}
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
                                        title={t("createSections.editVideo")}
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
                                        title={t("createSections.editArticle")}
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
                                        title={t("createSections.edit")}
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
                                          id: lesson.id, // lesson id
                                          moduleId: module.id,
                                          type: (lesson as any).content_type as
                                            | "quiz"
                                            | "exam",
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
            ))}
          </div>
        )}
      </div>

      {/* Video */}
      {editingLesson && (
        <EditLesson
          modules={modules}
          editingLesson={editingLesson}
          setEditingLesson={setEditingLesson}
          updateLesson={(mId, lId, up) => {
            // Live reflect in list
            updateLessonLocal(mId, lId, up as any);
          }}
          onCancel={() => setEditingLesson(null)}
          onSave={async () => {
            try {
              const mod = modules.find((m) => m.id === editingLesson.moduleId)!;
              const les = mod.lessons.find(
                (l) => l.id === editingLesson.lessonId
              )!;
              // Persist changed fields (change-detected inside patchLesson)
              await patchLesson(les.id, {
                title: les.title,
                url: les.url,
                content_type: "video",
                duration_hours: les.duration_hours ?? null,
              });
              toast.success(t("createSections.videoSaved"));
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
          onCancel={() => setEditingArticle(null)}
          onSave={async () => {
            try {
              const mod = modules.find(
                (m) => m.id === editingArticle.moduleId
              )!;
              const les = mod.lessons.find(
                (l) => l.id === editingArticle.lessonId
              )! as any;
              await patchLesson(les.id, {
                title: les.title,
                description_html: les.description_html ?? null,
                duration_hours: les.duration_hours ?? null,
                content_type: "article",
              });
              toast.success(t("createSections.articleSaved"));
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
          onCancel={() => setUploadingMaterial(null)}
          onSave={async () => {
            try {
              const mod = modules.find(
                (m) => m.id === uploadingMaterial.moduleId
              )!;
              const les = mod.lessons.find(
                (l) => l.id === uploadingMaterial.lessonId
              )! as any;
              const payload: any = {
                title: les.title,
                description: les.description ?? "",
                content_type: "material",
                // string_file: les.string_file ?? null,
                url: les.string_file ? null : les.url ?? null,
              };
              await patchLesson(les.id, payload);
              toast.success(t("createSections.materialSaved"));
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
            editingAssessment?.type === "exam"
              ? t("createSections.examBuilder")
              : t("createSections.quizBuilder")
          }
          size="xl"
        >
          {(() => {
            const mod = modules.find(
              (m) => m.id === editingAssessment.moduleId
            );
            const les = mod?.lessons.find(
              (l) => l.id === editingAssessment.id
            ) as any;

            // blur-persist a single lesson field
            const persistLessonField = async (
              field: "title" | "description",
              value: string
            ) => {
              if (!les) return;
              await patchLesson(les.id, { [field]: value } as any);
              // also reflect local snapshot (so future no-op checks skip)
              lastSavedLessonRef.current[les.id] = {
                ...(lastSavedLessonRef.current[les.id] || {}),
                [field]: value,
              };
            };

            return (
              <QuizBuilder
                initialQuiz={
                  assessmentDetail ?? { type: editingAssessment?.type }
                }
                lessonTitle={les?.title ?? ""}
                lessonDescription={les?.description ?? ""}
                onLessonTitleChange={(tval) =>
                  updateLessonLocal(
                    editingAssessment.moduleId,
                    editingAssessment.id,
                    { title: tval } as any
                  )
                }
                onLessonDescriptionChange={(dval) =>
                  updateLessonLocal(
                    editingAssessment.moduleId,
                    editingAssessment.id,
                    { description: dval } as any
                  )
                }
                onLessonTitleBlur={(tval) => persistLessonField("title", tval)}
                onLessonDescriptionBlur={(dval) =>
                  persistLessonField("description", dval)
                }
                // Exam save -> patch EXAM-only fields; also called by blur inside QuizBuilder
                onSave={async (draft) => {
                  try {
                    const payload = {
                      type: editingAssessment.type,
                      time_limit: draft.time_limit,
                      passing_score: draft.passing_score,
                      questions: draft.questions,
                    };
                    const { patch } = await import("../../../api");
                    await patch(
                      `${API_ENDPOINTS.updateExam}${editingAssessment.id}/`,
                      payload
                    );

                    invalidateLessonExams(queryClient, editingAssessment.id);
                    toast.success(t("createSections.saved"));
                  } catch {
                    toast.error(t("createSections.failedToSave"));
                  }
                }}
                onPreview={(draft) => setPreviewDraft(draft)}
                onClose={() => setEditingAssessment(null)}
              />
            );
          })()}
        </Modal>
      )}

      {previewDraft && (
        <Modal
          isOpen={!!previewDraft}
          onClose={() => setPreviewDraft(null)}
          title={t("createSections.preview")}
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
