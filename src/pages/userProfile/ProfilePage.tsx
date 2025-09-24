import React, { useRef, useState } from "react";
import { Mail, Phone, MapPin, Calendar, Camera, Edit } from "lucide-react";
import EditUserProfile from "../../components/userProfile/EditUserProfile";
import { readUserFromStorage, roleOf } from "../../services/auth";
import toast from "react-hot-toast";
import { formatDateTimeSimple } from "../../utils/formatDateTime";
import { useCustomPatch } from "../../hooks/useMutation";
import { API_ENDPOINTS, USER_KEY } from "../../utils/constants";
import handleErrorAlerts from "../../utils/showErrorMessages";
import { useCustomQuery } from "../../hooks/useQuery";
import LearningStats from "../../components/userProfile/LearningStats";
import { useTranslation } from "react-i18next";

const achievements = [
  { id: "1", icon: "🎓", date: "2024-01-15" },
  { id: "2", icon: "🔥", date: "2024-01-20" },
  { id: "3", icon: "⚡", date: "2024-01-25" },
  { id: "4", icon: "🧠", date: "2024-02-01" },
  { id: "5", icon: "🤝", date: "2024-02-05" },
  { id: "6", icon: "📚", date: "2024-02-10" },
];

const certificatesData = [
  {
    id: "1",
    title: "Complete React Developer Course",
    issueDate: "2024-01-30",
    instructor: "John Doe",
    thumbnail:
      "https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: "2",
    title: "Python for Data Science",
    issueDate: "2024-02-15",
    instructor: "Jane Smith",
    thumbnail:
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: "3",
    title: "UI/UX Design Fundamentals",
    issueDate: "2024-02-28",
    instructor: "Alex Brown",
    thumbnail:
      "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
];

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation("profile");
  const { t: y } = useTranslation("studentDashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const profileData: User = readUserFromStorage();
  const isStudent = roleOf(profileData) === "student";

  const [profileImage, setProfileImage] = useState<string | null>(
    profileData?.profile_image
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const certificates: Certificate[] = certificatesData ?? [];

  const handleDownloadCertificate = (certificate: any) => {
    console.log("Downloading certificate for:", certificate.title);
    // Create a mock download
    const link = document.createElement("a");
    link.href = "#";
    link.download = `${certificate.title}-certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("downloadDone"));
  };

  const { data: studentStatsData } = useCustomQuery(
    API_ENDPOINTS.studentStats,
    ["student-stats", profileData?.id],
    undefined,
    !!isStudent
  );

  const studentStats: StudentStats = studentStatsData?.data;

  const { mutateAsync, isPending } = useCustomPatch(
    API_ENDPOINTS.updateProfile,
    ["update-profile"]
  );

  const handleChangeImage = async (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        toast.error(t("picError"));
        return;
      }

      const formData = new FormData();
      formData.append("profile_image", file);

      const res = await mutateAsync(formData);

      if (res?.status) {
        const newUrl = res?.data?.profile_image;
        setProfileImage(newUrl);
        const user = { ...profileData, profile_image: newUrl };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        toast.success(t("picSuccess"));
      } else {
        toast.error(res?.profile_image?.[0] || "There is an error");
      }
    } catch (error: any) {
      const payload = error?.response?.data;
      handleErrorAlerts(
        payload?.message || "There is an unexpected error occured."
      );
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleChangeImage(file);
    e.currentTarget.value = "";
  };

  const TABS = [
    { id: "profile", label: t("tabs.profileSettings") },
    { id: "achievements", label: t("tabs.achievements") },
    { id: "certificates", label: t("tabs.certificates"), studentOnly: true },
  ];

  const visibleTabs = TABS.filter((t) => !(t.studentOnly && !isStudent));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <div
              className="relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profileData.first_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profileData?.first_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-60"
                disabled={isPending}
                aria-label="Change profile photo"
                title={t("changePic")}
              >
                {isPending ? (
                  <span className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={onPickFile}
              />
            </div>

            <div className="flex-1 text-center ltr:md:text-left rtl:md:text-right">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
                  {profileData.first_name} {profileData.last_name}
                </h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {isEditing ? t("cancel") : t("editProfile")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-4">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  <span>{profileData?.email || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  <span>{profileData?.phone || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  <span>{profileData?.location || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Calendar className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {/* <span>Joined {profileData.created_at || "--"}</span> */}
                  <span>
                    {t("joined")}{" "}
                    {formatDateTimeSimple(profileData?.data_joined, {
                      locale: i18n.language,
                      t,
                    })}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {profileData?.bio || "--"}
              </p>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <LearningStats stats={studentStats} />

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 focus:outline-none px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t("tabs.profileSettings")}
            </h3>

            {isEditing ? (
              <EditUserProfile setIsEditing={setIsEditing} />
            ) : (
              <div className="gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("editForm.fn")}
                    </label>
                    <p className="text-gray-900">
                      {profileData?.first_name || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("editForm.ln")}
                    </label>
                    <p className="text-gray-900">
                      {profileData.first_name || "--"}{" "}
                      {profileData.last_name || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("editForm.email")}
                    </label>
                    <p className="text-gray-900">
                      {profileData?.email || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("editForm.phone")}
                    </label>
                    <p className="text-gray-900">
                      {profileData?.phone || "--"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("editForm.location")}
                    </label>
                    <p className="text-gray-900">
                      {profileData?.location || "--"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mt-8">
                    {t("editForm.bio")}
                  </label>
                  <p className="text-gray-900">{profileData?.bio || "--"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t("tabs.achievements")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="border border-gray-200 rounded-lg p-6 text-center hover:border-purple-300 transition-colors"
                >
                  <div className="text-5xl mb-4">{achievement.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {y(`achievementsSection.items.${achievement.id}.title`)}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {y(`achievementsSection.items.${achievement.id}.desc`)}
                  </p>
                  <p className="text-xs text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full inline-block">
                    {achievement.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isStudent && activeTab === "certificates" && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {t("tabs.certificates")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors"
                >
                  <img
                    src={
                      certificate.thumbnail ??
                      "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
                    }
                    alt={certificate.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {certificate.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      Instructor: {certificate.instructor}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Issued: {certificate.issueDate}
                    </p>
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {t("download")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
