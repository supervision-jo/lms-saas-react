import React, { useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit,
  Clock,
  BookOpen,
  Award,
  LucideIcon,
  // Award,
  // BookOpen,
  // Clock,
} from "lucide-react";
import EditUserProfile from "../../components/userProfile/EditUserProfile";
import { readUserFromStorage } from "../../services/auth";
import toast from "react-hot-toast";
import { formatDateTimeSimple } from "../../utils/formatDateTime";
import { useCustomPatch } from "../../hooks/useMutation";
import { API_ENDPOINTS, USER_KEY } from "../../utils/constants";
import handleErrorAlerts from "../../utils/showErrorMessages";
// import { useCustomQuery } from "../../hooks/useQuery";

const ICONS = {
  Award,
  BookOpen,
  Clock,
  Calendar,
} as const;

type IconName = keyof typeof ICONS;

type LearningState = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
};

const achievementsData = [
  {
    id: "1",
    title: "First Course Completed",
    icon: "🎓",
    date: "2024-01-15",
    description: "Completed your first course",
  },
  {
    id: "2",
    title: "Week Streak",
    icon: "🔥",
    date: "2024-01-20",
    description: "Learned for 7 consecutive days",
  },
  {
    id: "3",
    title: "Fast Learner",
    icon: "⚡",
    date: "2024-01-25",
    description: "Completed 3 courses in one month",
  },
  {
    id: "4",
    title: "Quiz Master",
    icon: "🧠",
    date: "2024-02-01",
    description: "Scored 100% on 5 quizzes",
  },
  {
    id: "5",
    title: "Community Helper",
    icon: "🤝",
    date: "2024-02-05",
    description: "Helped 10 fellow students",
  },
  {
    id: "6",
    title: "Dedicated Student",
    icon: "📚",
    date: "2024-02-10",
    description: "Spent 100+ hours learning",
  },
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

const learningStatsData = [
  {
    label: "Courses Completed",
    value: "12",
    icon: "BookOpen",
    color: "text-blue-600",
  },
  {
    label: "Hours Learned",
    value: "156",
    icon: "Clock",
    color: "text-green-600",
  },
  {
    label: "Certificates Earned",
    value: "8",
    icon: "Award",
    color: "text-purple-600",
  },
  {
    label: "Current Streak",
    value: "23 days",
    icon: "Calendar",
    color: "text-orange-600",
  },
];

const ProfilePage: React.FC = () => {
  const profileRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const profileData: User = readUserFromStorage();

  const [profileImage, setProfileImage] = useState<string | null>(
    profileData?.profile_image
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const achievements: Acheivement[] = achievementsData ?? [];

  const certificates: Certificate[] = certificatesData ?? [];

  const learningStats =
    (learningStatsData as LearningState[] | undefined)?.map(
      (s: LearningState) => ({
        ...s,
        Icon: ICONS[s.icon] as LucideIcon,
      })
    ) ?? [];
  // PATCH USER
  const { mutateAsync: editUser } = useCustomPatch(
    API_ENDPOINTS.updateProfile,
    ["patch-user"]
  );
  const handleButtonClick = () => {
    profileRef.current?.click();
  };
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const profile_image = event.target.files?.[0];
    try {
      const formData = new FormData();
      if (profile_image) {
        formData.append("profile_image", profile_image);
        console.log("Selected image:", profile_image);
        const response = await editUser(formData);
        toast.success("Changes saved successfully!");
        // const user = {
        //   ...profileData,
        //   profile_image: formData.get("profile_image"),
        // };

        localStorage.setItem(USER_KEY, JSON.stringify(response?.data));
      }
    } catch (error: any) {
      const payload = error?.response?.data;
      handleErrorAlerts(
        payload?.message || "There is an unexpected error occured."
      );
    }
  };
  const handleDownloadCertificate = (certificate: any) => {
    console.log("Downloading certificate for:", certificate.title);
    // Create a mock download
    const link = document.createElement("a");
    link.href = "#";
    link.download = `${certificate.title}-certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Certificate download started!");
  };

  const { mutateAsync, isPending } = useCustomPatch(
    API_ENDPOINTS.updateProfile,
    ["update-profile"]
  );

  const handleChangeImage = async (file: File) => {
    try {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
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
        toast.success("Profile image updated successfully!");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profileData.first_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profileData?.first_name?.charAt(0)}
                  </span>
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-60"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                aria-label="Change profile photo"
                title="Change profile photo"
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

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
                  {profileData.first_name} {profileData.last_name}
                </h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-4">
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profileData?.email || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{profileData?.phone || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{profileData?.location || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {/* <span>Joined {profileData.created_at || "--"}</span> */}
                  <span>
                    Joined {formatDateTimeSimple(profileData?.data_joined)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {learningStats?.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 text-center"
            >
              <div className="flex items-center justify-center mb-3">
                <stat.Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "profile", label: "Profile Settings" },
                { id: "achievements", label: "Achievements" },
                { id: "certificates", label: "Certificates" },
              ].map((tab) => (
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
              Profile Settings
            </h3>

            {isEditing ? (
              <EditUserProfile setIsEditing={setIsEditing} />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <p className="text-gray-900">
                      {profileData?.first_name || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <p className="text-gray-900">
                      {profileData.first_name || "--"}{" "}
                      {profileData.last_name || "--"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900">{profileData?.email || "--"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <p className="text-gray-900">{profileData?.phone || "--"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <p className="text-gray-900">
                      {profileData?.location || "--"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
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
              Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="border border-gray-200 rounded-lg p-6 text-center hover:border-purple-300 transition-colors"
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-gray-500">{achievement.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Certificates
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
                      Download Certificate
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
