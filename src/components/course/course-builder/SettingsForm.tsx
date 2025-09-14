interface Props {
  isPublished: boolean;
  onChange: (published: boolean) => void;
}

export default function SettingsForm({ isPublished, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Settings</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Publishing
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Course Status</h4>
                <p className="text-sm text-gray-600">
                  Control who can see your course
                </p>
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={isPublished ? "published" : "draft"}
                onChange={(e) => onChange(e.target.value === "published")}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Enrollment
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  Auto-approve enrollments
                </h4>
                <p className="text-sm text-gray-600">
                  Students can enroll immediately
                </p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600"
                defaultChecked
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
