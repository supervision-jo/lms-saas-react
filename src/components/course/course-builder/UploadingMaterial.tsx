// src/components/course/course-builder/UploadingMaterial.tsx
// — aligns to { content_type:"material", title, description, url, string_file (base64) }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { fileToBase64 } from "../../../utils/courseBuilder";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCustomQuery } from "../../../hooks/useQuery";
import { useCustomUpdate } from "../../../hooks/useMutation";
import { API_ENDPOINTS } from "../../../utils/constants";
import { useQueryClient } from "@tanstack/react-query";

type LessonLocal = Lesson & {
  parentId?: string;
  file?: File | null;
  url?: string | null; // external or preview link
  string_file?: string | null; // base64
};

interface Props {
  // modules: Module[]; // kept for compatibility (unused for source)
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
  // modules, // not used as source of truth
  setUploadingMaterial,
  updateLesson,
  uploadingMaterial,
  onCancel,
  onSave,
}: Props) {
  const { t } = useTranslation("courseBuilder");
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lessonId = uploadingMaterial.lessonId;
  const moduleId = uploadingMaterial.moduleId;

  // Fetch the lesson
  const { data } = useCustomQuery(
    `${API_ENDPOINTS.lesson}${lessonId}/`,
    ["lesson", lessonId],
    undefined,
    !!lessonId
  );
  const serverLesson: Lesson | undefined = data?.data ?? data;

  // Local working state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [url, setUrl] = useState<string | null>(null);
  const [stringFile, setStringFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // Initialize from server
  useEffect(() => {
    if (!serverLesson) return;
    setTitle(serverLesson.title ?? "");
    setDescription(serverLesson.description ?? "");
    setUrl(serverLesson.url ?? null);
    setStringFile(null);
    setFile(null);
  }, [serverLesson]);

  const canSave =
    Boolean((title || "").trim()) &&
    (Boolean(stringFile) || Boolean(file) || Boolean(url));

  const localPreviewUrl = useMemo(() => {
    if (file instanceof File) return URL.createObjectURL(file);
    return null;
  }, [file]);

  const { mutateAsync: patchLesson } = useCustomUpdate(
    `${API_ENDPOINTS.lesson}${lessonId}/`
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {t("uploadingMaterial.title")}
          </h3>
          <p className="text-gray-600 mt-1">
            {t("uploadingMaterial.subTitle")}
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("uploadingMaterial.label")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  updateLesson(moduleId, lessonId, { title: e.target.value });
                }}
                placeholder={t("uploadingMaterial.placeholder")}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("uploadingMaterial.uploadFile")}
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {t("uploadingMaterial.clickOrDrop")}
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, ZIP, PPT, XLS… (Max 50MB)
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.xls,.xlsx,application/zip,application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const picked = e.target.files?.[0] || null;
                    if (!picked) return;

                    // 1) set local + optimistic reflect
                    setFile(picked);
                    setUrl(null);
                    setStringFile(null);
                    updateLesson(moduleId, lessonId, {
                      file: picked,
                      url: null,
                      string_file: undefined,
                    });

                    // 2) encode to base64
                    try {
                      const b64 = await fileToBase64(picked);
                      setStringFile(b64);
                      updateLesson(moduleId, lessonId, { string_file: b64 });
                    } catch {
                      toast.error(t("uploadingMaterial.fail"));
                    }

                    // 3) allow reselecting the same file later
                    e.currentTarget.value = "";
                  }}
                />

                {(file as any)?.name && (
                  <p className="text-sm text-gray-500 mt-2 truncate">
                    {t("uploadingMaterial.selected")} {(file as any)?.name}
                  </p>
                )}
                {!!localPreviewUrl && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t("uploadingMaterial.ready")}
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
                  {t("uploadingMaterial.downloadLink")}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("uploadingMaterial.downloadURL")}
              </label>
              <input
                type="url"
                value={url || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setUrl(v);
                  setFile(null);
                  setStringFile(null);
                  updateLesson(moduleId, lessonId, {
                    url: v,
                    file: null,
                    string_file: undefined,
                  });
                }}
                placeholder="https://example.com/file.pdf"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("uploadingMaterial.description")}
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  updateLesson(moduleId, lessonId, {
                    description: e.target.value,
                  });
                }}
                placeholder={t("uploadingMaterial.descriptionP")}
                rows={3}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={() => (onCancel ? onCancel() : setUploadingMaterial(null))}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t("uploadingMaterial.cancel")}
          </button>
          <button
            onClick={async () => {
              if (!canSave) return;

              // Prefer base64 string_file; otherwise use URL
              const payload: any = {
                title: title ?? "",
                description: description ?? "",
                content_type: "material",
              };
              if (stringFile) {
                payload.string_file = stringFile;
                payload.url = null;
              } else if (url) {
                payload.url = url;
                payload.string_file = null;
              }

              try {
                await patchLesson(payload);
                toast.success(t("createSections.materialSaved"));
                await queryClient.invalidateQueries({
                  queryKey: ["lessons", moduleId],
                });
                if (onSave) onSave();
                else setUploadingMaterial(null);
              } catch {
                // handled by wrappers
              }
            }}
            disabled={!canSave}
            className={`bg-purple-600 text-white px-6 py-2 rounded-lg ${
              !canSave ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"
            } transition-colors`}
          >
            {t("uploadingMaterial.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
