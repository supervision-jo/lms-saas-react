import React from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useSettings, useFeatureFlag } from "../../hooks/useSettings";

const CheckEmailPage: React.FC = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { data, isLoading } = useSettings();

  const {
    enabled: indexEnabled,
    isError: indexError,
    isFetching: indexFetching,
    isLoading: indexLoading,
  } = useFeatureFlag("index_page", true);

  const shouldShowHomePage = indexError ? false : indexEnabled === "home";
  const indexPagePath = shouldShowHomePage ? "/" : "/login";

  if (isLoading || indexLoading || indexFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {data?.logo_type === "text" ? (
              data?.logo_text
            ) : (
              <img
                src={data?.logo_file}
                alt="logo"
                className="w-40 block m-auto rounded-full"
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-6">
            {/* Email Icon */}
            <div className="flex justify-center">
              <div className="bg-purple-100 rounded-full p-4">
                <Mail className="h-12 w-12 text-purple-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("CheckEmail.title")}
            </h2>

            {/* Message */}
            <p className="text-gray-600">
              {t("CheckEmail.message")}
            </p>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
              >
                {t("CheckEmail.goToLogin")}
              </button>
              <button
                onClick={() => navigate(indexPagePath)}
                className="flex-1 bg-white border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-xl font-semibold hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
              >
                {t("CheckEmail.goToHome")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;

