import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  FileText,
  GripVertical,
  HelpCircle,
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

import QuizBuilder, { AssessmentDraft } from "../../quizzes/QuizBuilder";
import QuizPreview from "../../quizzes/QuizPreview";
import { AxiosResponse } from "axios";

import ModuleItem from "./ModuleItem";
import Modal from "../../reusable-components/Modal";
import { useExamsByLesson } from "../../../hooks/useExamsByLesson";
import { invalidateLessonExams, qk } from "../../../utils/builderQueries";
import { useTranslation } from "react-i18next";

import { patchLessonApi } from "../../../utils/lessonApi";
import { patch } from "../../../api";
import SectionLessons from "./SectionLessons";

export default function CreateSectionsForm({ courseId }: { courseId: string }) {
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Track last committed values to avoid no-op PATCH on blur (modules only)
  const lastSavedModuleRef = useRef<
    Record<string, { title: string; description: string }>
  >({});
  // Track last saved lesson fields for modals (kept to avoid changing modal components)
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

  // Fetch sections
  const { data: modulesData, isLoading } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}&include_lessons=false`,
    qk.modules(courseId),
    undefined,
    !!courseId
  );
  const serverModules: Module[] = useMemo(
    () => modulesData?.data?.data ?? [],
    [modulesData]
  );

  // Local editable state (modules only; lesson rows here are for modal lookups)
  const [modules, setModules] = useState<Module[]>(serverModules);

  // Per-module API coming from SectionLessons (so the “+” menu can create lessons)
  const sectionApisRef = useRef<
    Record<string, { createContentLesson: any; createAssessment: any }>
  >({});

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

  // Seed local modules snapshot when server changes
  useEffect(() => {
    setModules(serverModules);
    const snap: Record<string, any> = {};
    for (const m of serverModules || []) {
      for (const l of m.lessons || []) {
        snap[l.id] = {
          title: l.title,
          description: l.description ?? undefined,
          url: l.url ?? undefined,
          duration_hours: l.duration_hours ?? null,
        };
      }
    }
    lastSavedLessonRef.current = snap;
  }, [serverModules]);

  // // ---- Modules (sections) mutations (title/description/order) ----
  // const { mutateAsync: patchModule } = useMutation<
  //   AxiosResponse<any>,
  //   any,
  //   { id: string; payload: any }
  // >({
  //   mutationFn: async ({ id, payload }) => {
  //     return patch(`${API_ENDPOINTS.updateSection}${id}/`, payload);
  //   },
  //   onError: (e) => handleErrorAlerts(e.response?.data?.error),
  // });

  const { mutateAsync: patchModule } = useMutation<
    AxiosResponse<any>,
    any,
    any
  >({
    mutationFn: async ({ id, payload }: any) => {
      return patch(`${API_ENDPOINTS.updateSection}${id}/`, payload);
    },
    onError: (e) => {
      const error = e.response?.data?.error;
      handleErrorAlerts(error);
    },
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
    queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
  };

  // Update a single lesson field in our local module snapshot so modals reflect typing immediately
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

  // Add a new section
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

  // Modules DnD
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

  // Reorder modules = normal PATCH per changed row
  const commitModulesOrder = async () => {
    const ops = modules
      .map((m, idx) => {
        if (m.order === idx + 1) return null;
        return patchModule({
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
      toast.success(t("createSections.commitModulesOrderSuccess"));
    } catch {
      toast.error(t("createSections.commitModulesOrderError"));
    } finally {
      await queryClient.invalidateQueries({ queryKey: qk.modules(courseId) });
    }
  };

  const deleteModule = async (id: string) => {
    try {
      await removeSection({ id });
      toast.success(t("createSections.moduleDeleted"));
    } catch (e: any) {
      handleErrorAlerts(e?.response?.data?.error);
    }
  };

  // Exams by LESSON id for the quiz/exam builder
  const { data: examResp } = useExamsByLesson(
    editingAssessment?.id ?? undefined
  );
  const assessmentDetail = useMemo(() => {
    const obj = examResp?.data ?? examResp ?? null;
    return obj && typeof obj === "object" ? obj : null;
  }, [examResp]);

  // Helper to persist a lesson field from modal
  const persistLessonField = async (
    lessonId: string,
    payload: Partial<Lesson>
  ) => {
    const snap = lastSavedLessonRef.current[lessonId] || {};
    let changed = false;
    for (const k of Object.keys(payload) as (keyof Lesson)[]) {
      if ((snap as any)[k] !== (payload as any)[k]) {
        changed = true;
        (snap as any)[k] = (payload as any)[k];
      }
    }
    if (!changed) return;

    await patchLessonApi(lessonId, payload);
    lastSavedLessonRef.current[lessonId] = snap;
  };

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
            <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
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
                      <div className="flex items-center gap-3 w-full">
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
                      <div className="flex sm:self-center self-end items-center gap-2">
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
                            <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <button
                                type="button"
                                onClick={() => {
                                  sectionApisRef.current[
                                    module.id
                                  ]?.createContentLesson("video");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full ltr:text-left rtl:text-right px-4 py-2 hover:bg-gray-50 flex items-center"
                              >
                                <Video className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {t("createSections.video")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sectionApisRef.current[
                                    module.id
                                  ]?.createContentLesson("article");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full ltr:text-left rtl:text-right px-4 py-2 hover:bg-gray-50 flex items-center"
                              >
                                <FileText className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {t("createSections.article")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sectionApisRef.current[
                                    module.id
                                  ]?.createContentLesson("material");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full ltr:text-left rtl:text-right px-4 py-2 hover:bg-gray-50 flex items-center"
                              >
                                <Upload className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {t("createSections.material")}
                              </button>
                              <div className="my-1 border-t border-gray-200" />
                              <button
                                type="button"
                                onClick={() => {
                                  sectionApisRef.current[
                                    module.id
                                  ]?.createAssessment("quiz");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full ltr:text-left rtl:text-right px-4 py-2 flex items-center hover:bg-gray-50"
                                title={t("createSections.createQuizLesson")}
                              >
                                <HelpCircle className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                {t("createSections.quiz")}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sectionApisRef.current[
                                    module.id
                                  ]?.createAssessment("exam");
                                  setOpenMenuFor(null);
                                }}
                                className="w-full ltr:text-left rtl:text-right px-4 py-2 flex items-center rounded-b-lg hover:bg-gray-50"
                                title={t("createSections.createExamLesson")}
                              >
                                <Award className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
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

                  {/* LESSONS */}
                  <SectionLessons
                    moduleId={module.id}
                    setEditingLesson={setEditingLesson}
                    setEditingArticle={setEditingArticle}
                    setUploadingMaterial={setUploadingMaterial}
                    setEditingAssessment={setEditingAssessment}
                    updateLessonLocal={updateLessonLocal}
                    onReady={(api) => {
                      sectionApisRef.current[module.id] = api;
                    }}
                  />
                </div>
              </ModuleItem>
            ))}
          </div>
        )}
      </div>

      {/* Video */}
      {editingLesson && (
        <EditLesson
          // modules={modules}
          editingLesson={editingLesson}
          setEditingLesson={setEditingLesson}
          updateLesson={(mId, lId, up) => {
            updateLessonLocal(mId, lId, up as any);
          }}
          onCancel={() => setEditingLesson(null)}
          onSave={async () => {
            try {
              const mod = modules.find((m) => m.id === editingLesson.moduleId)!;
              const les = mod.lessons.find(
                (l) => l.id === editingLesson.lessonId
              )!;
              await persistLessonField(les.id, {
                title: les.title,
                url: les.url,
                content_type: "video",
                duration_hours: les.duration_hours ?? null,
              });
              toast.success(t("createSections.videoSaved"));
              await queryClient.invalidateQueries({
                queryKey: ["lessons", editingLesson.moduleId],
              });
            } finally {
              setEditingLesson(null);
            }
          }}
        />
      )}

      {/* Article */}
      {editingArticle && (
        <EditArticle
          // modules={modules}
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
              await persistLessonField(les.id, {
                title: les.title,
                description_html: les.description_html ?? null,
                duration_hours: les.duration_hours ?? null,
                content_type: "article",
              });
              toast.success(t("createSections.articleSaved"));
              await queryClient.invalidateQueries({
                queryKey: ["lessons", editingArticle.moduleId],
              });
            } finally {
              setEditingArticle(null);
            }
          }}
        />
      )}

      {/* Material */}
      {uploadingMaterial && (
        <UploadingMaterial
          // modules={modules}
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
                url: les.string_file ? undefined : les.url ?? undefined,
              };
              await persistLessonField(les.id, payload);
              toast.success(t("createSections.materialSaved"));
              await queryClient.invalidateQueries({
                queryKey: ["lessons", uploadingMaterial.moduleId],
              });
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
                onLessonTitleBlur={async (tval) => {
                  await persistLessonField(les.id, { title: tval });
                }}
                onLessonDescriptionBlur={async (dval) => {
                  await persistLessonField(les.id, { description: dval });
                }}
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
                    await queryClient.invalidateQueries({
                      queryKey: ["lessons", editingAssessment.moduleId],
                    });
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
