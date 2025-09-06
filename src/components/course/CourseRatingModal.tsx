import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Send, X } from "lucide-react";

interface CourseRatingProps {
  courseTitle: string;
  onSubmit: (rating: CourseRatingData) => void;
  onClose: () => void;
  existingRating?: CourseRatingData;
}

interface CourseRatingData {
  rating: number;
  review: string;
  reasons: string[];
  wouldRecommend: boolean;
  anonymous: boolean;
}

export default function CourseRatingModal({
  courseTitle,
  onSubmit,
  onClose,
  existingRating,
}: CourseRatingProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(existingRating?.review || "");
  const [selectedReasons, setSelectedReasons] = useState<string[]>(
    existingRating?.reasons || []
  );
  const [wouldRecommend, setWouldRecommend] = useState(
    existingRating?.wouldRecommend ?? true
  );
  const [anonymous, setAnonymous] = useState(
    existingRating?.anonymous ?? false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabels = [
    "", // 0 stars
    "Terrible",
    "Poor",
    "Average",
    "Good",
    "Excellent",
  ];

  const reasonOptions = [
    "Clear explanations",
    "Practical examples",
    "Good pacing",
    "Engaging content",
    "Helpful exercises",
    "Great instructor",
    "Well organized",
    "Up-to-date content",
    "Good production quality",
    "Valuable resources",
    "Interactive elements",
    "Real-world applications",
  ];

  const negativeReasons = [
    "Confusing explanations",
    "Too fast paced",
    "Too slow paced",
    "Outdated content",
    "Poor audio/video quality",
    "Lack of examples",
    "Disorganized structure",
    "Not enough practice",
    "Boring presentation",
    "Missing key topics",
  ];

  const currentReasons = rating >= 4 ? reasonOptions : negativeReasons;

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    const ratingData: CourseRatingData = {
      rating,
      review: review.trim(),
      reasons: selectedReasons,
      wouldRecommend,
      anonymous,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit(ratingData);
      alert("Thank you for your feedback!");
      onClose();
    } catch (error: any) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Rate This Course
              </h2>
              <p className="text-gray-600 mt-1">{courseTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              How would you rate this course?
            </h3>
            <div className="flex items-center justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-lg font-medium text-gray-700">
                {ratingLabels[rating]} ({rating} star{rating !== 1 ? "s" : ""})
              </p>
            )}
          </div>

          {/* Reasons */}
          {rating > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                What did you {rating >= 4 ? "like" : "dislike"} about this
                course?
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {currentReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => toggleReason(reason)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedReasons.includes(reason)
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-purple-300 text-gray-700"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Written Review */}
          {rating > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Tell others about your experience (optional)
              </h4>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about the course content, instructor, and overall experience..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {review.length}/500 characters
                </span>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {rating > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Would you recommend this course to others?
              </h4>
              <div className="flex space-x-4">
                <button
                  onClick={() => setWouldRecommend(true)}
                  className={`flex items-center px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                    wouldRecommend
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300 text-gray-700"
                  }`}
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Yes, I recommend it
                </button>
                <button
                  onClick={() => setWouldRecommend(false)}
                  className={`flex items-center px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                    !wouldRecommend
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300 text-gray-700"
                  }`}
                >
                  <ThumbsDown className="w-5 h-5 mr-2" />
                  No, I don't recommend it
                </button>
              </div>
            </div>
          )}

          {/* Privacy Options */}
          {rating > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Submit this review anonymously
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Your review will be public, but your name won't be shown if you
                choose anonymous.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
