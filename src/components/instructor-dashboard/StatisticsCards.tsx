import { DollarSign, Eye, LucideIcon, Star, Users } from "lucide-react";

const ICONS = {
  Users,
  DollarSign,
  Star,
  Eye,
} as const;

type IconName = keyof typeof ICONS;

type InstructorStats = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  bg: string;
  change: string;
};

const instructorStatsData = [
  {
    label: "Total Students",
    value: "12,450",
    icon: "Users",
    color: "text-blue-600",
    bg: "bg-blue-100",
    change: "+12%",
  },
  {
    label: "Total Revenue",
    value: "$45,230",
    icon: "DollarSign",
    color: "text-green-600",
    bg: "bg-green-100",
    change: "+8%",
  },
  {
    label: "Average Rating",
    value: "4.8",
    icon: "Star",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    change: "+0.2",
  },
  {
    label: "Course Views",
    value: "89,234",
    icon: "Eye",
    color: "text-purple-600",
    bg: "bg-purple-100",
    change: "+15%",
  },
];
export default function StatisticsCards() {
  const instructorStats =
    (instructorStatsData as InstructorStats[] | undefined)?.map(
      (s: InstructorStats) => ({
        ...s,
        Icon: ICONS[s.icon] as LucideIcon,
      })
    ) ?? [];
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
            <div className="text-right">
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
              <p className="text-xs text-gray-500">vs last month</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
