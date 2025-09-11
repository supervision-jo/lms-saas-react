export default function InstructorDashboardSidebar() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            View All Reviews
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Download Reports
          </button>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Manage Payouts
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">New Students</span>
            <span className="font-semibold text-gray-900">+234</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Revenue</span>
            <span className="font-semibold text-green-600">+$6,200</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Course Views</span>
            <span className="font-semibold text-gray-900">+12,450</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">New Reviews</span>
            <span className="font-semibold text-gray-900">+45</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tips for Success
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900">Engage with Students</p>
            <p className="text-blue-700">
              Respond to questions and reviews promptly
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="font-medium text-green-900">Update Content</p>
            <p className="text-green-700">
              Keep your courses current and relevant
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-900">Promote Courses</p>
            <p className="text-purple-700">
              Share on social media and networks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
