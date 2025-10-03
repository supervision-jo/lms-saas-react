// src/components/course/builder/EditLesson.tsx
import { Youtube } from "lucide-react";
import {
  isYouTubeUrl,
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  getYouTubeDurationSeconds,
  secondsToHours,
  getHtmlVideoDurationSeconds,
} from "../../../utils/courseBuilder";

interface Props {
  modules: Module[];
  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<Lesson>
  ) => void;
  editingLesson: { moduleId: string; lessonId: string };
  setEditingLesson: React.Dispatch<
    React.SetStateAction<{ moduleId: string; lessonId: string } | null>
  >;
  onCancel?: () => void;
  onSave?: () => void;
}

export default function EditLesson({
  modules,
  editingLesson,
  setEditingLesson,
  updateLesson,
  onCancel,
  onSave,
}: Props) {
  const mod = modules.find((m) => m.id === editingLesson.moduleId);
  const les = mod?.lessons.find((l) => l.id === editingLesson.lessonId) as any;

  const url: string = les?.url || "";
  const isYT = isYouTubeUrl(url);
  const videoId = isYT ? extractYouTubeVideoId(url) : null;
  const thumb = videoId ? getYouTubeThumbnail(videoId) : "";

  const isValid = (() => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  })();

  const handleUrlChange = async (value: string) => {
    updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
      url: value,
    });

    // Auto-extract duration -> duration_hours
    try {
      let seconds = 0;
      if (isYouTubeUrl(value)) {
        const id = extractYouTubeVideoId(value);
        if (id) seconds = await getYouTubeDurationSeconds(id);
      } else {
        seconds = await getHtmlVideoDurationSeconds(value);
      }
      const hours = secondsToHours(seconds);
      if (hours > 0) {
        updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
          duration_hours: hours,
        });
      }
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Add Video Link</h3>
          <p className="text-gray-600 mt-1">
            Add a YouTube link (we’ll save it as <code>url</code>)
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Title (NEW) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title
              </label>
              <input
                type="text"
                value={les?.title || ""}
                onChange={(e) =>
                  updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
                    title: e.target.value,
                  } as any)
                }
                placeholder="Enter video title"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Youtube className="h-5 w-5 text-red-500" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  name="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                We auto-fill duration when possible.
              </p>
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Video Preview</h4>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                {videoId ? (
                  <img
                    src={thumb}
                    alt="YouTube video thumbnail"
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">
                      {url ? "No preview for non-YouTube URL" : "No preview"}
                    </span>
                  </div>
                )}
              </div>
              {videoId && (
                <p className="text-sm text-gray-600 mt-2 break-all">
                  Video ID: <span className="font-mono">{videoId}</span>
                </p>
              )}
            </div>

            {/* Duration (hours) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Duration (hours)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={les?.duration_hours ?? ""}
                onChange={(e) =>
                  updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
                    duration_hours: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="e.g., 1.25"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4 sticky bottom-0 bg-white">
          <button
            onClick={() => (onCancel ? onCancel() : setEditingLesson(null))}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!isValid) return;
              updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
                content_type: "video",
                url: (les?.url || "").trim(),
              } as any);
              if (onSave) onSave();
              else setEditingLesson(null);
            }}
            disabled={!isValid}
            className={`bg-purple-600 text-white px-6 py-2 rounded-lg ${
              !isValid ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"
            } transition-colors`}
          >
            Save Video
          </button>
        </div>
      </div>
    </div>
  );
}
