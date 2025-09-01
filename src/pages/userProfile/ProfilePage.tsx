/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
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
import { useCustomQuery } from "../../hooks/useQuery";

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

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // const [profileData, setProfileData] = useState({
  //   name: "John Doe",
  //   email: "john.doe@example.com",
  //   phone: "+1 (555) 123-4567",
  //   location: "San Francisco, CA",
  //   bio: "Passionate learner and software developer with 5+ years of experience in web development. Love exploring new technologies and sharing knowledge with others.",
  //   joinDate: "January 2023",
  //   avatar:
  //     "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
  // });

  const profileData = readUserFromStorage();

  const achievementsData = useCustomQuery("/data/achievements.json", [
    "achievements",
    // profileData.id,
  ]);
  const certificatesData = useCustomQuery("/data/certificates.json", [
    "certificates",
    // profileData.id,
  ]);
  const learningStatsData = useCustomQuery("/data/learningStats.json", [
    "learningStats",
    // profileData.id,
  ]);

  const achievements: Acheivement[] = achievementsData?.data?.data ?? [];

  const certificates: Certificate[] = certificatesData?.data?.data ?? [];

  const learningStats =
    (learningStatsData?.data?.data as LearningState[] | undefined)?.map(
      (s: LearningState) => ({
        ...s,
        Icon: ICONS[s.icon] as LucideIcon,
      })
    ) ?? [];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
                  {profileData.name}
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
                  <span>{profileData.email || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{profileData.phone || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{profileData.location || "--"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {profileData.joinDate || "--"}</span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {profileData.bio || "--"}
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
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
                      Full Name
                    </label>
                    <p className="text-gray-900">{profileData.name || "--"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900">{profileData.email || "--"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <p className="text-gray-900">{profileData.phone || "--"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <p className="text-gray-900">
                      {profileData.location || "--"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <p className="text-gray-900">{profileData.bio || "--"}</p>
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
                    src={certificate.thumbnail}
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
