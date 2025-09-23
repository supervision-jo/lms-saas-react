import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

type RecentReview = {
  id: string;
  student: string;
  course: string;
  rating: number;
  comment: string;
  date: string;
};
const recentReviewsData = [
  {
    id: "1",
    student: "Sarah Johnson",
    course: "Complete React Developer Course",
    rating: 5,
    comment: "Excellent course! Very detailed and easy to follow.",
    date: "2024-01-25",
  },
  {
    id: "2",
    student: "Mike Chen",
    course: "Advanced JavaScript Concepts",
    rating: 4,
    comment: "Great content, but could use more practical examples.",
    date: "2024-01-24",
  },
  {
    id: "3",
    student: "Emily Davis",
    course: "Complete React Developer Course",
    rating: 5,
    comment: "Best React course I've taken. Highly recommended!",
    date: "2024-01-23",
  },
];

export default function ReviewsSection() {
  const { t } = useTranslation("instructorDashboard");
  const recentReviews: RecentReview[] = recentReviewsData ?? [];
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {t("recentReviews.title")}
      </h3>
      <div className="space-y-4">
        {recentReviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{review.student}</h4>
                <p className="text-sm text-gray-600">{review.course}</p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-2">{review.comment}</p>
            <p className="text-sm text-gray-500">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
