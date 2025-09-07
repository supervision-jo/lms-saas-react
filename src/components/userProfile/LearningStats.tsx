import { Award, BookOpen, Clock, TrendingUp } from "lucide-react";

interface LearningStatsProps {
  stats: StudentStats;
}

export default function LearningStats({ stats }: LearningStatsProps) {
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
}
