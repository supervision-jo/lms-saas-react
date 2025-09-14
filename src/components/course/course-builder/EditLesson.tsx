// EditLesson.tsx
import { Video, Youtube } from "lucide-react";

interface Props {
  course: BuilderCourse;
  extractYouTubeVideoId: (url: string) => string | null;
  getYouTubeThumbnail: (videoId: string) => string;
  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<BuilderLesson>
  ) => void;
  editingLesson: {
    moduleId: string;
    lessonId: string;
  };
  setEditingLesson: React.Dispatch<
    React.SetStateAction<{
      moduleId: string;
      lessonId: string;
    } | null>
  >;
}

export default function EditLesson({
  course,
  editingLesson,
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  setEditingLesson,
  updateLesson,
  onCancel,
  onSave,
}: Props & { onCancel?: () => void; onSave?: () => void }) {
  const mod = course.modules.find((m) => m.id === editingLesson.moduleId);
  const les = mod?.lessons.find((l) => l.id === editingLesson.lessonId);

  const hasYouTube = Boolean((les as any)?.youtubeUrl?.trim());
  const hasVideoUrl = Boolean((les as any)?.videoUrl?.trim());

  const videoId = (les as any)?.youtubeUrl
    ? extractYouTubeVideoId((les as any).youtubeUrl)
    : null;
  const thumb = videoId ? getYouTubeThumbnail(videoId) : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-900">Add Video Link</h3>
          <p className="text-gray-600 mt-1">
            Add a YouTube video or a direct video file URL
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-6">
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
                  value={(les as any)?.youtubeUrl || ""}
                  onChange={(e) =>
                    updateLesson(
                      editingLesson.moduleId,
                      editingLesson.lessonId,
                      {
                        youtubeUrl: e.target.value,
                        videoUrl: "",
                      }
                    )
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={hasVideoUrl}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Paste a YouTube URL (watch, youtu.be, or embed). When this is
                filled, the direct video URL is disabled.
              </p>
            </div>

            {/* Fixed preview box */}
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
                    <span className="text-sm">No preview</span>
                  </div>
                )}
              </div>
              {videoId && (
                <p className="text-sm text-gray-600 mt-2 break-all">
                  Video ID: <span className="font-mono">{videoId}</span>
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Regular Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={(les as any)?.videoUrl || ""}
                  onChange={(e) =>
                    updateLesson(
                      editingLesson.moduleId,
                      editingLesson.lessonId,
                      {
                        videoUrl: e.target.value,
                        youtubeUrl: "",
                      }
                    )
                  }
                  placeholder="https://example.com/video.mp4"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={hasYouTube}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Direct link to video file (MP4, WebM, etc.). When this is
                filled, the YouTube URL is disabled.
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Duration
              </label>
              <input
                type="text"
                value={(les as any)?.duration || ""}
                onChange={(e) =>
                  updateLesson(editingLesson.moduleId, editingLesson.lessonId, {
                    duration: e.target.value,
                  })
                }
                placeholder="e.g., 1h 15m 30s or 75:30"
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
            onClick={() => (onSave ? onSave() : setEditingLesson(null))}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save Video
          </button>
        </div>
      </div>
    </div>
  );
}
