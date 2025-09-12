import { DollarSign, Eye, LucideIcon, Star, Users } from "lucide-react";
import { useCustomQuery } from "../../hooks/useQuery";
import { API_ENDPOINTS } from "../../utils/constants";

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

export default function StatisticsCards() {
  const { data } = useCustomQuery(API_ENDPOINTS.instructorStats, [
    "instructor-stats",
  ]);

  const stats: InstructorStats = data?.data;

  const items = [
    {
      label: "Total Students",
      value: stats?.total_students ?? 0,
      icon: "Users",
      color: "text-blue-600",
      bg: "bg-blue-100",
      change: stats?.new_students ?? 0,
    },
    {
      label: "Total Revenue",
      value: stats?.revenue ?? 0,
      icon: "DollarSign",
      color: "text-green-600",
      bg: "bg-green-100",
      // change: "+8%",
    },
    {
      label: "Average Rating",
      value: stats?.average_rating ?? 0,
      icon: "Star",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      // change: "+0.2",
    },
    {
      label: "Total Reviews",
      value: stats?.total_reviews,
      icon: "Eye",
      color: "text-purple-600",
      bg: "bg-purple-100",
      change: stats?.new_reviews ?? 0,
      // change: "+15%",
    },
  ];

  const instructorStats =
    (items as DisplayedStats[] | undefined)?.map((s: DisplayedStats) => ({
      ...s,
      Icon: ICONS[s.icon] as LucideIcon,
    })) ?? [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {instructorStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
            {stat?.change && stat?.change > 0 ? (
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">
                  +{stat?.change}
                </span>
                <p className="text-xs text-gray-500">vs last month</p>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
