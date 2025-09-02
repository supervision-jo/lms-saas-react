import { Award, BookOpen, TrendingUp, Users } from "lucide-react";

export default function StatisticsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="text-4xl font-bold">190K+</div>
            <div className="text-purple-100">Online Courses</div>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-4xl font-bold">50M+</div>
            <div className="text-purple-100">Registered Students</div>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-4xl font-bold">100K+</div>
            <div className="text-purple-100">Certificates Issued</div>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="text-4xl font-bold">98%</div>
            <div className="text-purple-100">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
