import {
  Award,
  BookOpen,
  Clock,
  DollarSign,
  Eye,
  LucideIcon,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { readUserFromStorage, roleOf } from "../../services/auth";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";

interface LearningStatsProps {
  stats: StudentStats;
}

const ICONS = {
  Users,
  DollarSign,
  Star,
  Eye,
} as const;

type IconName = keyof typeof ICONS;

type DisplayedStats = {
  label: string;
  value: number;
  icon: IconName;
  color: string;
  bg: string;
  change?: number;
};

export default function LearningStats({ stats }: LearningStatsProps) {
  const profileData: User = readUserFromStorage();
  const isStudent = roleOf(profileData) === "student";

  const { data } = useCustomQuery(API_ENDPOINTS.instructorStats, [
    "instructor-stats",
  ]);

  const insStats: InstructorStats = data?.data;

  const items = [
    {
      label: "Total Students",
      value: insStats?.total_students ?? 0,
      icon: "Users",
      color: "text-blue-600",
      bg: "bg-blue-100",
      change: insStats?.new_students ?? 0,
    },
    {
      label: "Total Revenue",
      value: insStats?.revenue ?? 0,
      icon: "DollarSign",
      color: "text-green-600",
      bg: "bg-green-100",
      // change: "+8%",
    },
    {
      label: "Average Rating",
      value: insStats?.average_rating ?? 0,
      icon: "Star",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      // change: "+0.2",
    },
    {
      label: "Total Reviews",
      value: insStats?.total_reviews,
      icon: "Eye",
      color: "text-purple-600",
      bg: "bg-purple-100",
      change: insStats?.new_reviews ?? 0,
      // change: "+15%",
    },
  ];

  const instructorStats =
    (items as DisplayedStats[] | undefined)?.map((s: DisplayedStats) => ({
      ...s,
      Icon: ICONS[s.icon] as LucideIcon,
    })) ?? [];
  if (isStudent) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-3">
              <BookOpen className={`w-8 h-8 text-blue-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.courses_completed ?? 0}
            </p>
            <p className="text-sm text-gray-600">Courses Enrolled</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-3">
              <Clock className={`w-8 h-8 text-green-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.hours_learned ?? 0}
            </p>
            <p className="text-sm text-gray-600">Hours Learned</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-3">
              <Award className={`w-8 h-8 text-purple-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.certificates_earned ?? 0}
            </p>
            <p className="text-sm text-gray-600">Certificates</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className={`w-8 h-8 text-orange-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.current_streak ?? 0}
            </p>
            <p className="text-sm text-gray-600">Streak Days</p>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {instructorStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-3">
                <stat.Icon className={`w-8 h-8 ${stat?.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat?.value}
              </p>
              <p className="text-sm text-gray-600">{stat?.label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
