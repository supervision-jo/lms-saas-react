// CreateSectionsForm.tsx
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
import { formatDuration } from "../../../utils/formatDuration";

interface Props {
  addLesson: (moduleId: string, type: BuilderLesson["type"]) => void;
  addModule: () => void;
  course: BuilderCourse;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  deleteModule: (moduleId: string) => void;
  editQuiz: (moduleId: string, lessonId: string) => void;
  updateModule: (moduleId: string, updates: Partial<BuilderModule>) => void;
  getLessonIcon: (
    type: "quiz" | "video" | "article" | "exam" | "material"
  ) => JSX.Element;
  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<BuilderLesson>
  ) => void;
  setEditingLesson: React.Dispatch<
    React.SetStateAction<{
      moduleId: string;
      lessonId: string;
    } | null>
  >;
  setEditingArticle: React.Dispatch<
    React.SetStateAction<{
      moduleId: string;
      lessonId: string;
    } | null>
  >;
  setUploadingMaterial: React.Dispatch<
    React.SetStateAction<{
      moduleId: string;
      lessonId: string;
    } | null>
  >;
  moveModule: (dragId: string, hoverId: string) => void;
  moveLesson: (moduleId: string, dragId: string, hoverId: string) => void;
}

const isContent = (t?: string) =>
  t === "video" || t === "article" || t === "material";

/** DnD item types */
const DND_TYPES = {
  MODULE: "MODULE",
  LESSON: "LESSON",
} as const;

type ModuleItemProps = {
  module: BuilderModule;
  index: number;
  moveModule: (dragId: string, hoverId: string) => void;
  children: React.ReactNode;
};
function ModuleItem({ module, index, moveModule, children }: ModuleItemProps) {
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
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
  lesson: BuilderLesson;
  index: number;
  moveLesson: (moduleId: string, dragId: string, hoverId: string) => void;
  children: React.ReactNode;
};
function LessonItem({
  moduleId,
  lesson,
  index,
  moveLesson,
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
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));
  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.7 : 1 }}>
      {children}
    </div>
  );
}

export default function CreateSectionsForm({
  addLesson,
  addModule,
  course,
  deleteLesson,
  deleteModule,
  editQuiz,
  getLessonIcon,
  updateModule,
  updateLesson,
  setEditingLesson,
  setEditingArticle,
  setUploadingMaterial,
  moveModule,
  moveLesson,
}: Props) {
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);

  // per-module refs so the outside-click handler targets the correct menu
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
      if (!container.contains(e.target as Node)) {
        setOpenMenuFor(null);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [openMenuFor]);

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

        {course.modules.length === 0 ? (
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
            {course.modules.map((module, mIndex) => {
              const hasAnyContent = (module.lessons ?? []).some((l) =>
                isContent(l.type)
              );
              return (
                <ModuleItem
                  key={module.id}
                  module={module}
                  index={mIndex}
                  moveModule={moveModule}
                >
                  {/* allow dropdowns to escape bounds */}
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
                              value={module.title}
                              onChange={(e) =>
                                updateModule(module.id, {
                                  title: e.target.value,
                                })
                              }
                              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                            />
                            <input
                              type="text"
                              value={module.description}
                              onChange={(e) =>
                                updateModule(module.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Module description"
                              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 sm:max-w-full max-w-60 mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex sm:self-center self-end items-center space-x-2">
                          <div className="relative" ref={setMenuRef(module.id)}>
                            {/* icon-only Add button */}
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
                                    addLesson(module.id, "video");
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
                                    addLesson(module.id, "article");
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
                                    addLesson(module.id, "material");
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
                                    addLesson(module.id, "quiz");
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
                                    addLesson(module.id, "exam");
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
                          const canDrag = true;
                          return (
                            <LessonItem
                              key={lesson.id}
                              moduleId={module.id}
                              lesson={lesson as any}
                              index={lIndex}
                              moveLesson={moveLesson}
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
                                  <div>{getLessonIcon(lesson.type)}</div>
                                  <div>
                                    <input
                                      type="text"
                                      value={lesson.title}
                                      onChange={(e) =>
                                        updateLesson(module.id, lesson.id, {
                                          title: e.target.value,
                                        })
                                      }
                                      className="font-medium max-w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                    />
                                    <div className="text-sm text-gray-500 flex sm:items-center items-start sm:flex-row flex-col gap-2">
                                      <span className="inline-flex items-center flex-wrap">
                                        {lesson.type === "article" ||
                                        lesson.type === "quiz" ||
                                        lesson.type === "exam" ? null : (
                                          <>
                                            <Link className="w-3 h-3 mr-1" />
                                            {(lesson as any).youtubeUrl?.slice(
                                              0,
                                              20
                                            ) + "..." ||
                                              (lesson as any).url?.slice(
                                                0,
                                                20
                                              ) + "..." ||
                                              (lesson as any).video_url?.slice(
                                                0,
                                                20
                                              ) + "..." ||
                                              (lesson as any).fileUrl?.slice(
                                                0,
                                                20
                                              ) + "..." ||
                                              "No URL"}
                                          </>
                                        )}
                                      </span>
                                      {lesson.type === "video" && (
                                        <span>
                                          • Duration:{" "}
                                          {formatDuration(
                                            (lesson as any).duration
                                          ) || "N/A"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 sm:self-center self-end">
                                  {isContent(lesson.type) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteLesson(module.id, lesson.id)
                                      }
                                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}

                                  {lesson.type === "video" && (
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

                                  {lesson.type === "article" && (
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

                                  {lesson.type === "material" && (
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

                                  {(lesson.type === "quiz" ||
                                    lesson.type === "exam") && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        editQuiz(module.id, lesson.id)
                                      }
                                      className="p-1 text-purple-400 hover:text-purple-600 transition-colors"
                                      title={`Edit ${
                                        lesson.type === "quiz" ? "Quiz" : "Exam"
                                      }`}
                                    >
                                      <Edit className="w-4 h-4" />
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
    </div>
  );
}
