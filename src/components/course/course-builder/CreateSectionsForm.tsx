// only the relevant parts are highlighted; this is the full component for drop-in use
import React, { useEffect, useRef, useState } from "react";
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
import { useDrag, useDrop } from "react-dnd";
import { useCustomQuery } from "../../../hooks/useQuery";
import { API_ENDPOINTS } from "../../../utils/constants";
import { useParams } from "react-router";
import handleErrorAlerts from "../../../utils/showErrorMessages";
import toast from "react-hot-toast";
import EditLesson from "./EditLesson";
import EditArticle from "./EditArticle";
import UploadingMaterial from "./UploadingMaterial";
import {
  // extractYouTubeVideoId,
  // getYouTubeThumbnail,
  isContent,
  isAssessment,
  nextAssessmentTitle,
  anchorAbove,
  reindexOrders1Based,
} from "../../../utils/courseBuilder";
import { useCustomPost } from "../../../hooks/useMutation";
import { patch } from "../../../api";

const DND_TYPES = { MODULE: "MODULE", LESSON: "LESSON" } as const;

type ModuleItemProps = {
  module: Module;
  index: number;
  moveModule: (dragId: string, hoverId: string) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
};

function ModuleItem({
  module,
  index,
  moveModule,
  onDragEnd,
  children,
}: ModuleItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, drop] = useDrop({
    accept: DND_TYPES.MODULE,
    hover(item: { id: string; index: number }) {
      if (!ref.current || item.id === module.id) return;
      moveModule(item.id, module.id);
      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.MODULE,
    item: { id: module.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: () => onDragEnd(),
  });
  drag(drop(ref));
  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.7 : 1 }}>
      {children}
    </div>
  );
}

type LessonItemProps = {
  moduleId: string;
  lesson: Lesson;
  index: number;
  moveLesson: (moduleId: string, dragId: string, hoverId: string) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
};

function LessonItem({
  moduleId,
  lesson,
  index,
  moveLesson,
  onDragEnd,
  children,
}: LessonItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, drop] = useDrop({
    accept: DND_TYPES.LESSON,
    hover(item: { id: string; index: number; moduleId: string }) {
      if (!ref.current || item.id === lesson.id || item.moduleId !== moduleId)
        return;
      moveLesson(moduleId, item.id, lesson.id);
      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPES.LESSON,
    item: { id: lesson.id, index, moduleId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: () => onDragEnd(),
  });
  drag(drop(ref));
  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.7 : 1 }}>
      {children}
    </div>
  );
}

export default function CreateSectionsForm() {
  const { courseId } = useParams();
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setMenuRef =
    (id: string) =>
    (el: HTMLDivElement | null): void => {
      menuRefs.current[id] = el;
    };
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
  const {
    data: modulesData,
    refetch,
    isLoading,
  } = useCustomQuery(
    `${API_ENDPOINTS.modules}?course=${courseId}`,
    ["modules", courseId],
    undefined,
    !!courseId
  );
  const serverModules: Module[] = modulesData?.data?.data ?? [];
  const [modules, setModules] = useState<Module[]>(serverModules);
  useEffect(() => {
    if (Array.isArray(serverModules)) setModules(serverModules);
  }, [modulesData]); // eslint-disable-line

  const { mutateAsync: createSection } = useCustomPost(
    API_ENDPOINTS.createSection,
    ["modules", courseId!]
  );

  /** ================= Normalization =================
   * Video now sends a single `url` field.
   * Material already sends { title, description, string_file, url }.
   */
  const normalizeLessonForSave = (l: any) => {
    const common: any = {};
    if (l?.id && !String(l.id).startsWith("tmp-")) common.id = l.id;
    if (l?.type) common.type = l.type;
    if (l?.order != null) common.order = Number(l.order);

    if (l?.type === "video") {
      return {
        ...common,
        title: l?.title ?? "",
        description: l?.description ?? "",
        url: l?.url || "", // ← IMPORTANT
        ...(l?.duration ? { duration: l.duration } : {}),
      };
    }

    if (l?.type === "article") {
      return {
        ...common,
        title: l?.title ?? "",
        description_html:
          l?.description_html != null
            ? l.description_html
            : l?.description ?? "",
      };
    }

    if (l?.type === "material") {
      return {
        ...common,
        title: l?.title ?? "",
        description: l?.description ?? "",
        string_file: l?.string_file ?? null,
        url: l?.url ?? null,
      };
    }

    if (l?.type === "quiz" || l?.type === "exam") {
      return {
        ...common,
        title: l?.title ?? "",
      };
    }

    return {
      ...common,
      title: l?.title ?? "",
      description: l?.description ?? "",
    };
  };

  const saveSectionLessons = async (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const normalized = reindexOrders1Based(mod.lessons || []);
    const payload = { lessons: normalized.map(normalizeLessonForSave) };
    await patch(`${API_ENDPOINTS.updateSection}${moduleId}/`, payload);
  };

  const patchModuleField = async (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    const body: Record<string, any> = { [field]: value };
    await patch(`${API_ENDPOINTS.updateSection}${id}/`, body);
    toast.success("Saved");
    await refetch();
  };

  const patchAssessmentField = async (
    id: string,
    field: string,
    value: string | number | boolean
  ) => {
    const body: Record<string, any> = { [field]: value };
    await patch(`${API_ENDPOINTS.exams}${id}/`, body);
    toast.success("Saved");
  };

  const addModule = async () => {
    try {
      const body = {
        course: courseId,
        title: `New Module ${modules.length + 1}`,
        description: "",
        order: modules.length + 1,
      };
      await createSection(body);
      toast.success("New module added!");
      await refetch();
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
          title:
            type === "video"
              ? "New Video"
              : type === "article"
              ? "New Article"
              : "New Material",
          description: "",
          description_html: null,
          type,
          order: (m.lessons?.length ?? 0) + 1, // 1-based
          url: "", // ← video/material write here
          string_file: null, // ← material only
        };
        const lessons = [...(m.lessons || []), stub];
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

  const { mutateAsync: createExam } = useCustomPost(API_ENDPOINTS.exams, [
    "modules",
    courseId!,
  ]);

  const addAssessment = async (moduleId: string, type: "quiz" | "exam") => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    const lastContentIndex =
      [...(mod.lessons || [])]
        .map((l, i) => ({ l, i }))
        .reverse()
        .find(({ l }) => isContent(l.content_type))?.i ?? -1;

    if (lastContentIndex < 0) {
      toast.error("Create a content lesson first");
      return;
    }

    const anchorId = mod.lessons[lastContentIndex].id;
    const title = nextAssessmentTitle(mod as any, type);

    try {
      const body = { title, type, lesson: anchorId };
      const created = await createExam(body);
      const newId = created?.data?.id ?? created?.id;
      if (!newId) throw new Error("No id returned");

      setModules((prev) =>
        prev.map((m) => {
          if (m.id !== moduleId) return m;
          const stub: any = {
            id: newId,
            title,
            description: "",
            description_html: null,
            type,
            order: lastContentIndex + 2,
          };
          const next = [...m.lessons];
          next.splice(lastContentIndex + 1, 0, stub);
          return { ...m, lessons: reindexOrders1Based(next) };
        })
      );

      toast.success(`${type === "quiz" ? "Quiz" : "Exam"} created`);
    } catch (e: any) {
      toast.error(e?.message || "Cannot create quiz/exam");
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
        return patch(`${API_ENDPOINTS.updateSection}${m.id}/`, {
          order: idx + 1,
        });
      })
      .filter(Boolean) as Promise<any>[];
    if (!ops.length) return;
    try {
      await Promise.all(ops);
      toast.success("Module order updated");
      await refetch();
    } catch {
      toast.error("Failed to update module order");
      await refetch();
    }
  };

  const moveLesson = (moduleId: string, dragId: string, hoverId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const d = m.lessons.findIndex((l) => l.id === dragId);
        const h = m.lessons.findIndex((l) => l.id === hoverId);
        if (d < 0 || h < 0 || d === h) return m;
        const next = [...m.lessons];
        const [dragged] = next.splice(d, 1);
        next.splice(h, 0, dragged);
        return { ...m, lessons: next };
      })
    );
  };

  const commitLessonOrderAndAnchors = async (moduleId: string) => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;

    try {
      await saveSectionLessons(moduleId);
    } catch {
      toast.error("Failed to save lesson order");
      await refetch();
      return;
    }

    const ops =
      mod.lessons
        ?.map((l, idx) => {
          if (!isAssessment(l.content_type)) return null;
          const anch = anchorAbove(mod.lessons as any, idx);
          if (!anch) return null;
          return patch(`${API_ENDPOINTS.exams}${l.id}/`, { lesson: anch });
        })
        .filter(Boolean) ?? [];

    if (ops.length) {
      try {
        await Promise.all(ops as any[]);
        toast.success("Attachments updated");
      } catch {
        toast.error("Failed to update some attachments");
      } finally {
        await refetch();
      }
    }
  };

  const deleteModule = (id: string) => console.log(id);

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
                isContent((l as any).type)
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
                            (lesson as any).type
                          );
                          const canDrag = true;

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
                            >
                              <div className="flex sm:items-center items-start sm:flex-row flex-col sm:gap-0 gap-4 justify-between sm:p-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3 w-full">
                                  <div>
                                    <GripVertical
                                      className={`w-4 h-4 text-gray-400 ${
                                        canDrag ? "cursor-move" : "opacity-50"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    {isContentLesson ? (
                                      (lesson as any).type === "video" ? (
                                        <Video className="w-4 h-4" />
                                      ) : (lesson as any).type === "article" ? (
                                        <FileText className="w-4 h-4" />
                                      ) : (
                                        <Upload className="w-4 h-4" />
                                      )
                                    ) : (lesson as any).type === "quiz" ? (
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
                                          try {
                                            await patchAssessmentField(
                                              (lesson as any).id,
                                              "title",
                                              e.target.value
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
                                        (lesson as any).type === "video" ? (
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
                                      {!isContentLesson ? (
                                        <span className="text-purple-600">
                                          •{" "}
                                          {lesson?.content_type?.toUpperCase()}{" "}
                                          (attached to content above)
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 sm:self-center self-end">
                                  {isContentLesson && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toast("Delete lesson not implemented")
                                      }
                                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}

                                  {(lesson as any).type === "video" && (
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

                                  {(lesson as any).type === "article" && (
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

                                  {(lesson as any).type === "material" && (
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
              await saveSectionLessons(editingLesson.moduleId);
              toast.success("Video saved");
              await refetch();
            } catch {
              //
            }
            setEditingLesson(null);
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
              await saveSectionLessons(editingArticle.moduleId);
              toast.success("Article saved");
              await refetch();
            } catch {
              //
            }
            setEditingArticle(null);
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
              await saveSectionLessons(uploadingMaterial.moduleId);
              toast.success("Material saved");
              await refetch();
            } catch {
              //
            }
            setUploadingMaterial(null);
          }}
        />
      )}
    </div>
  );
}
