import { useTranslation } from "react-i18next";

interface Props {
  isPublished: boolean;
  onChange: (published: boolean) => void;
}

export default function SettingsForm({ isPublished, onChange }: Props) {
  const { t } = useTranslation("courseBuilder");

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("settings.courseSettings")}
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("settings.publishing")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  {t("settings.courseStatus")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("settings.courseStatusDesc")}
                </p>
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={isPublished ? "published" : "draft"}
                onChange={(e) => onChange(e.target.value === "published")}
              >
                <option value="draft">{t("settings.draft")}</option>
                <option value="published">{t("settings.published")}</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("settings.enrollment")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  {t("settings.autoApproveEnrollments")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("settings.studentsCanEnrollDesc")}
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
