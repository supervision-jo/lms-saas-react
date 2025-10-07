import {
  Award,
  Edit,
  FileText,
  GripVertical,
  HelpCircle,
  LinkIcon,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import LessonItem from "./LessonItem";
import { isContent, reindexOrders1Based } from "../../../utils/courseBuilder";
import { API_ENDPOINTS } from "../../../utils/constants";
import handleErrorAlerts from "../../../utils/showErrorMessages";
import { useCustomQuery } from "../../../hooks/useQuery";
import { useCustomUpdate } from "../../../hooks/useMutation"; // <-- use your hook
import {
  deleteLessonApi,
  patchLessonApi,
  createLessonApi,
} from "../../../utils/lessonApi";
import { makeKeyedDebouncer } from "../../../utils/netCoalesce";
import LessonsSkeleton from "../../resource-stats/LessonsSkeleton";

/** Local debouncer for commit-on-drag-end */
const debounceCommit = makeKeyedDebouncer(450);

type ReadyApi = {
  createContentLesson: (
    type: "video" | "article" | "material"
  ) => Promise<void>;
  createAssessment: (type: "quiz" | "exam") => Promise<void>;
};

export default function SectionLessons({
  moduleId,
  setEditingLesson,
  setEditingArticle,
  setUploadingMaterial,
  setEditingAssessment,
  /** Reflect inline edits in parent's module snapshot so modals show current values */
  updateLessonLocal,
  /** Let parent register per-module creation handlers for the “+” menu */
  onReady,
}: {
  moduleId: string;
  setEditingLesson: React.Dispatch<
    React.SetStateAction<{ moduleId: string; lessonId: string } | null>
  >;
  setEditingArticle: React.Dispatch<
    React.SetStateAction<{ moduleId: string; lessonId: string } | null>
  >;
  setUploadingMaterial: React.Dispatch<
    React.SetStateAction<{ moduleId: string; lessonId: string } | null>
  >;
  setEditingAssessment: React.Dispatch<
    React.SetStateAction<{
      id: string;
      moduleId: string;
      type: "quiz" | "exam";
    } | null>
  >;
  updateLessonLocal: (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => void;
  onReady?: (api: ReadyApi) => void;
}) {
  const { t } = useTranslation("courseBuilder");
  const queryClient = useQueryClient();

  /** Fetch lessons for this section; cache key is ["lessons", moduleId] */
  const { data, isLoading } = useCustomQuery(
    `${API_ENDPOINTS.lessons}${moduleId}/`,
    ["lessons", moduleId],
    undefined,
    !!moduleId
  );
  const lessonsFromServer: Lesson[] = useMemo(() => data?.data ?? [], [data]);

  /** Local working copy to support DnD before committing */
  const [localLessons, setLocalLessons] = useState<Lesson[]>(lessonsFromServer);

  /** DnD snapshot baseline per section, and last committed orders */
  const dragBaselineRef = useRef<Record<string, string[]>>({});
  const lastCommittedLessonOrderRef = useRef<Record<string, string[]>>({});

  useEffect(() => {
    setLocalLessons(lessonsFromServer);
    lastCommittedLessonOrderRef.current[moduleId] = (
      lessonsFromServer || []
    ).map((l) => l.id);
  }, [moduleId, lessonsFromServer]);

  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((x, i) => x === b[i]);

  /** --- Reorder lessons: use your top-level POST hook --- */
  const { mutateAsync: reorderLessons } = useCustomUpdate(
    API_ENDPOINTS.reorderLessons
  );

  /** Move DnD item inside local list only */
  const moveLesson = (_moduleId: string, dragId: string, hoverId: string) => {
    setLocalLessons((prev) => {
      if (!prev?.length) return prev;

      // Record baseline once per drag gesture for this module
      if (!dragBaselineRef.current[_moduleId]) {
        dragBaselineRef.current[_moduleId] = prev.map((l) => l.id);
      }

      const next = [...prev];
      const d = next.findIndex((l) => l.id === dragId);
      const h = next.findIndex((l) => l.id === hoverId);
      if (d < 0 || h < 0 || d === h) return prev;

      const [dragged] = next.splice(d, 1);
      next.splice(h, 0, dragged);

      // Reindex for UI only (safe)
      return reindexOrders1Based(next);
    });
  };

  /** Commit only changed lesson orders (compare to baseline ids) */
  const commitLessonOrder = async (sectionId: string) => {
    return debounceCommit(sectionId, async () => {
      const baselineIds =
        dragBaselineRef.current[sectionId] ??
        lastCommittedLessonOrderRef.current[sectionId];

      const currentLessons = localLessons || [];
      const currentIds = currentLessons.map((l) => l.id);

      // Clear the live baseline after drag ends
      delete dragBaselineRef.current[sectionId];

      // If we have a baseline and order of IDs is identical, skip
      if (baselineIds && arraysEqual(baselineIds, currentIds)) return;

      // Build a map of baseline positions: lessonId -> oldOrder
      const baselinePos = new Map<string, number>();
      if (baselineIds) {
        baselineIds.forEach((id, idx) => baselinePos.set(id, idx + 1));
      }

      // Build payload based on difference between baseline position and new position
      const changes: Array<{ lesson_id: string; order: number }> =
        currentLessons
          .map((l, idx) => {
            const newOrder = idx + 1;
            // if no baseline, treat all as changed (first reorder ever)
            const oldOrder = baselinePos.size
              ? baselinePos.get(l.id)
              : undefined;
            return {
              lesson_id: l.id,
              order: newOrder,
              _changed: oldOrder !== newOrder,
            };
          })
          .filter((x) => !baselinePos.size || x._changed)
          .map(({ lesson_id, order }) => ({ lesson_id, order }));

      // If nothing changed, bail
      if (!changes.length) return;

      try {
        await reorderLessons({ lessons: changes }); // your hook
        // Remember last committed order for this module
        lastCommittedLessonOrderRef.current[sectionId] = currentIds;
        toast.success(t("createSections.commitModulesOrderSuccess"));
      } catch (e: any) {
        toast.error(t("createSections.commitModulesOrderError"));
        handleErrorAlerts(e?.response?.data?.error);
      } finally {
        // Revalidate only this section's lessons
        queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
      }
    });
  };

  /** Inline title edit -> local reflect for parent (modals) + patch lesson, then revalidate this section */
  const onTitleBlur = async (lessonId: string, newTitle: string) => {
    try {
      updateLessonLocal(moduleId, lessonId, { title: newTitle } as any);
      await patchLessonApi(lessonId, { title: newTitle });
      toast.success(t("createSections.saved"));
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
    } catch {
      /* ignore; errors already handled by wrapper */
    }
  };

  /** Delete a lesson: optimistic local removal, API delete, then revalidate this section's lessons */
  const deleteLesson = async (lessonId: string) => {
    setLocalLessons((prev) =>
      reindexOrders1Based(prev.filter((l) => l.id !== lessonId))
    );
    try {
      await deleteLessonApi(lessonId);
      toast.success(t("createSections.lessonRemoved"));
      await queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
    } catch (e) {
      toast.error(t("createSections.failedRemoveLesson"));
      handleErrorAlerts((e as any)?.response?.data?.error);
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
    }
  };

  const deleteExamOrQuiz = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      toast.success(t("createSections.assessmentDeleted"));
    } catch (e: any) {
      handleErrorAlerts(e?.response?.data?.error);
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
    }
  };

  /** Creation helpers (exposed to parent via onReady) */
  const createContentLesson = async (
    type: "video" | "article" | "material"
  ) => {
    const optimistic: Lesson = {
      id: `tmp-${Date.now()}`,
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
      order: (localLessons?.length ?? 0) + 1,
      url: "",
      duration_hours: null,
      file: null as any,
      watched: false,
      section: moduleId,
    };

    setLocalLessons((prev) => [...prev, optimistic]);

    try {
      const createdRes = await createLessonApi({
        section_id: moduleId,
        title: optimistic.title,
        description: "",
        description_html: optimistic.description_html,
        content_type: optimistic.content_type!,
        order: optimistic.order,
        url: optimistic.url,
        duration_hours: optimistic.duration_hours,
        free_preview: optimistic.free_preview,
      });
      const created: Lesson =
        createdRes?.data?.data ?? createdRes?.data ?? createdRes;
      setLocalLessons((prev) =>
        prev.map((l) => (l.id === optimistic.id ? (created as Lesson) : l))
      );

      await queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });

      if (type === "video")
        setEditingLesson({ moduleId, lessonId: created.id });
      if (type === "article")
        setEditingArticle({ moduleId, lessonId: created.id });
      if (type === "material")
        setUploadingMaterial({ moduleId, lessonId: created.id });
    } catch (e: any) {
      setLocalLessons((prev) => prev.filter((l) => l.id !== optimistic.id));
      handleErrorAlerts(e?.response?.data?.error);
    }
  };

  const createAssessment = async (type: "quiz" | "exam") => {
    const optimistic: Lesson = {
      id: `tmp-${Date.now()}`,
      title: type === "quiz" ? "Quiz" : "Exam",
      description: "",
      description_html: null,
      content_type: type,
      free_preview: false,
      order: (localLessons?.length ?? 0) + 1,
      url: "",
      duration_hours: null,
      file: null as any,
      watched: false,
      section: moduleId,
    };

    setLocalLessons((prev) =>
      reindexOrders1Based([...(prev || []), optimistic])
    );

    try {
      const createdRes = await createLessonApi({
        section_id: moduleId,
        title: optimistic.title,
        description: "",
        description_html: null,
        content_type: optimistic.content_type!,
        order: optimistic.order,
        url: null,
        duration_hours: null,
        free_preview: false,
      });
      const created: Lesson =
        createdRes?.data?.data ?? createdRes?.data ?? createdRes;

      setLocalLessons((prev) =>
        prev.map((l) => (l.id === optimistic.id ? (created as Lesson) : l))
      );

      await queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });

      toast.success(
        `${
          type === "quiz" ? t("createSections.quiz") : t("createSections.exam")
        } ${t("createSections.created")}`
      );
      setEditingAssessment({ id: created.id, moduleId, type });
    } catch (e: any) {
      toast.error(t("createSections.failedUpdateSomeAttachments"));
      setLocalLessons((prev) => prev.filter((l) => l.id !== optimistic.id));
      handleErrorAlerts(e?.response?.data?.error);
    }
  };

  /** Expose creation API to parent (for the module “+” menu) */
  useEffect(() => {
    onReady?.({
      createContentLesson,
      createAssessment,
    });
    // re-expose if moduleId changes
  }, [onReady, moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <LessonsSkeleton />;

  if (lessonsFromServer.length === 0) return;

  return (
    <div className="p-4 space-y-2">
      {localLessons.map((lesson, lIndex) => {
        const isContentLesson = isContent((lesson as any).content_type);
        const videoUrlPreview = (lesson as any)?.url || "";

        return (
          <LessonItem
            key={lesson.id}
            moduleId={moduleId}
            lesson={lesson}
            index={lIndex}
            moveLesson={moveLesson}
            onDragEnd={() => commitLessonOrder(moduleId)}
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
                    ) : (lesson as any).content_type === "article" ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )
                  ) : (lesson as any).content_type === "quiz" ? (
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
                      updateLessonLocal(moduleId, lesson.id, {
                        title: e.target.value,
                      } as any)
                    }
                    onBlur={(e) => onTitleBlur(lesson.id, e.target.value)}
                    className="font-medium w-11/12 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  />
                  <div className="text-sm text-gray-500 flex sm:items-center items-start sm:flex-row flex-col gap-2">
                    <span className="inline-flex items-center flex-wrap">
                      {isContentLesson &&
                      (lesson as any).content_type === "video" ? (
                        <>
                          <LinkIcon className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                          {videoUrlPreview
                            ? String(videoUrlPreview).slice(0, 20)
                            : t("createSections.noURL")}
                        </>
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center self-end">
                {isContentLesson ? (
                  <>
                    <button
                      type="button"
                      onClick={() => deleteLesson(lesson.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title={t("createSections.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {(lesson as any).content_type === "video" && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingLesson({ moduleId, lessonId: lesson.id })
                        }
                        className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                        title={t("createSections.editVideo")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {(lesson as any).content_type === "article" && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingArticle({ moduleId, lessonId: lesson.id })
                        }
                        className="p-1 text-green-400 hover:text-green-600 transition-colors"
                        title={t("createSections.editArticle")}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {(lesson as any).content_type === "material" && (
                      <button
                        type="button"
                        onClick={() =>
                          setUploadingMaterial({
                            moduleId,
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
                          id: lesson.id,
                          moduleId,
                          type: (lesson as any).content_type as "quiz" | "exam",
                        })
                      }
                      className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExamOrQuiz(lesson.id)}
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
  );
}
