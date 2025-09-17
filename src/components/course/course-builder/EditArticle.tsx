type LessonLocal = Lesson & { parentId?: string };

interface Props {
  modules: Module[];
  updateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<LessonLocal>
  ) => void;
  editingArticle: {
    moduleId: string;
    lessonId: string;
  };
  setEditingArticle: React.Dispatch<
    React.SetStateAction<{
      moduleId: string;
      lessonId: string;
    } | null>
  >;
  onCancel?: () => void;
  onSave?: () => void;
}

export default function EditArticle({
  modules,
  editingArticle,
  setEditingArticle,
  updateLesson,
  onCancel,
  onSave,
}: Props) {
  const mod = modules.find((m) => m.id === editingArticle.moduleId);
  const les = mod?.lessons.find((l) => l.id === editingArticle.lessonId) as
    | LessonLocal
    | undefined;

  const canSave =
    Boolean((les?.title || "").trim()) &&
    Boolean(
      (les?.description || les?.description_html || "").toString().trim()
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit Article</h3>
          <p className="text-gray-600 mt-1">
            Create rich text content for your lesson
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title
              </label>
              <input
                type="text"
                value={les?.title || ""}
                onChange={(e) =>
                  updateLesson(
                    editingArticle.moduleId,
                    editingArticle.lessonId,
                    {
                      title: e.target.value,
                    }
                  )
                }
                placeholder="Enter article title"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content
              </label>
              <textarea
                value={les?.description || ""}
                onChange={(e) =>
                  updateLesson(
                    editingArticle.moduleId,
                    editingArticle.lessonId,
                    {
                      description: e.target.value, // will be mapped into description_html on save
                    }
                  )
                }
                placeholder="Write your article content here (TipTap JSON or HTML)..."
                rows={15}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be sent as <code>description_html</code> in the
                lessons payload.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={() => (onCancel ? onCancel() : setEditingArticle(null))}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!canSave) return;
              updateLesson(editingArticle.moduleId, editingArticle.lessonId, {
                description_html: (les?.description ??
                  les?.description_html ??
                  "") as any,
                content_type: "article",
              });
              if (onSave) onSave();
              else setEditingArticle(null);
            }}
            disabled={!canSave}
            className={`bg-purple-600 text-white px-6 py-2 rounded-lg ${
              !canSave ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"
            } transition-colors`}
          >
            Save Article
          </button>
        </div>
      </div>
    </div>
  );
}
