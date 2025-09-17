import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { fileToBase64 } from "../../../utils/courseBuilder";

type LessonLocal = Lesson & {
  parentId?: string;
  file?: File | null;
  fileUrl?: string | null;
  string_file?: string | null;
};

interface Props {
  modules: Module[];
  setUploadingMaterial: React.Dispatch<
    React.SetStateAction<{
      moduleId: string;
      lessonId: string;
    } | null>
  >;
  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<LessonLocal>
  ) => void;
  uploadingMaterial: {
    moduleId: string;
    lessonId: string;
  };
  onCancel?: () => void;
  onSave?: () => void;
}

export default function UploadingMaterial({
  modules,
  setUploadingMaterial,
  updateLesson,
  uploadingMaterial,
  onCancel,
  onSave,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mod = modules.find((m) => m.id === uploadingMaterial.moduleId);
  const les = mod?.lessons.find((l) => l.id === uploadingMaterial.lessonId) as
    | LessonLocal
    | undefined;

  const canSave =
    Boolean((les?.title || "").trim()) &&
    (Boolean(les?.file) || Boolean((les as any)?.fileUrl));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Upload Material</h3>
          <p className="text-gray-600 mt-1">
            Add downloadable resources for your students
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Title
              </label>
              <input
                type="text"
                value={les?.title || ""}
                onChange={(e) =>
                  updateLesson(
                    uploadingMaterial.moduleId,
                    uploadingMaterial.lessonId,
                    {
                      title: e.target.value,
                    }
                  )
                }
                placeholder="Enter material title"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, ZIP, PPT, XLS… (Max 50MB)
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.xls,.xlsx,application/zip,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const fileUrl = URL.createObjectURL(file);
                      updateLesson(
                        uploadingMaterial.moduleId,
                        uploadingMaterial.lessonId,
                        {
                          fileUrl,
                          file, // temporary File; will be converted to base64 on Save
                        }
                      );
                    }
                  }}
                />
                {(les?.file as any)?.name && (
                  <p className="text-sm text-gray-500 mt-2 truncate">
                    Selected: {(les?.file as any)?.name}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or provide a download link
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Download URL
              </label>
              <input
                type="url"
                value={(les as any)?.fileUrl || ""}
                onChange={(e) =>
                  updateLesson(
                    uploadingMaterial.moduleId,
                    uploadingMaterial.lessonId,
                    {
                      fileUrl: e.target.value,
                      file: null, // prefer external URL if provided
                      string_file: undefined,
                    }
                  )
                }
                placeholder="https://example.com/file.pdf"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={les?.description || ""}
                onChange={(e) =>
                  updateLesson(
                    uploadingMaterial.moduleId,
                    uploadingMaterial.lessonId,
                    {
                      description: e.target.value,
                    }
                  )
                }
                placeholder="Describe what this material contains..."
                rows={3}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={() => (onCancel ? onCancel() : setUploadingMaterial(null))}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!canSave) return;

              const m = modules.find(
                (mm) => mm.id === uploadingMaterial.moduleId
              )!;
              const draft = m.lessons.find(
                (l) => l.id === uploadingMaterial.lessonId
              ) as any;

              let string_file: string | null = null;
              let fileUrl: string | null = draft?.fileUrl || null;

              if (draft.file instanceof File) {
                // convert to base64 string and send as JSON under `string_file`
                string_file = await fileToBase64(draft.file);
                fileUrl = null; // prefer base64 if uploaded
              }

              updateLesson(
                uploadingMaterial.moduleId,
                uploadingMaterial.lessonId,
                {
                  type: "material",
                  string_file,
                  fileUrl,
                  file: null, // clear transient File
                } as any
              );

              if (onSave) onSave();
              else setUploadingMaterial(null);
            }}
            disabled={!canSave}
            className={`bg-purple-600 text-white px-6 py-2 rounded-lg ${
              !canSave ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"
            } transition-colors`}
          >
            Save Material
          </button>
        </div>
      </div>
    </div>
  );
}
